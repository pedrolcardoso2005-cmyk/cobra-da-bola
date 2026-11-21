// Fase pos-6 ("por que a IA nao esta gerando perguntas"): checkAndTopUp e
// formatTopUpLog. A investigacao encontrou duas coisas reais para corrigir:
// (1) varios motivos de "pulado" nunca apareciam nos logs do Railway
// (limite diario, concorrencia, estoque ja suficiente), tornando impossivel
// saber se a IA realmente rodou; (2) os limites antigos (maxBucketsPerRun=3,
// maxBatchesPerDay=6) cobririam os 70 buckets (14 categorias x 5
// dificuldades) muito devagar. Este arquivo cobre os dois.
//
// Mesmo idioma de isolamento de ai-pipeline.test.ts: fetch mockado (sem rede
// real), banco SQLite isolado em arquivo temporario, import dinamico depois
// de setar DB_PATH (ver o comentario longo em ai-pipeline.test.ts para o
// porque do import dinamico).
import { describe, it, after, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import os from "node:os";
import type { AiQuestionsConfig } from "../src/questions/ai/config.js";

const dbPath = `${os.tmpdir()}/cobra-ai-stock-test-${process.pid}-${Date.now()}.db`;
process.env.DB_PATH = dbPath;

const {
  checkAndTopUp,
  formatTopUpLog,
  getStockReport,
  rankBucketsByPriority,
  minStockFor,
  targetStockFor,
  acquireGenerationLock,
  releaseGenerationLock,
} = await import("../src/questions/ai/stock.js");
const { insertQuestion, insertAiGenerationLog, insertQuestionConsumption, countConsumptionSince, recentFailureStreak } = await import(
  "../src/db/questions.js"
);
const { db } = await import("../src/db/db.js");

after(() => {
  db.close();
  try {
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${dbPath}${suffix}`, { force: true });
  } catch {
    // best-effort, see ai-pipeline.test.ts
  }
});

const originalFetch = global.fetch;
before(() => {
  // Any generation call in this file succeeds with 1 candidate -- echoing
  // back whichever (category, difficulty) was actually requested (parsed
  // from the real request body generate.ts builds), so a test that asks
  // checkAndTopUp to cover every bucket actually sees every bucket's count
  // go up, not just one hardcoded category. These tests are about
  // checkAndTopUp's own bucket/limit/logging logic, not generation content
  // (that's ai-pipeline.test.ts's job).
  global.fetch = (async (url: string | URL, init?: RequestInit) => {
    const u = String(url);
    if (u.includes("api.anthropic.com")) {
      const body = JSON.parse(String(init?.body ?? "{}"));
      const userMessage = String(body?.messages?.[0]?.content ?? "");
      const category = /categoria "([^"]+)"/.exec(userMessage)?.[1] ?? "clubes";
      const difficulty = /dificuldade "([^"]+)"/.exec(userMessage)?.[1] ?? "facil";
      return {
        ok: true,
        json: async () => ({
          content: [
            {
              type: "tool_use",
              name: "submit_questions",
              input: {
                questions: [
                  {
                    category,
                    difficulty,
                    format: "aberta",
                    prompt: `Pergunta de teste gerada para o estoque de ${category}/${difficulty}, unica ${Math.random()}.`,
                    correctAnswer: "Resposta",
                    explanation: "Explicacao de teste.",
                    sourceUrl: "https://example.com/fonte-estoque",
                  },
                ],
              },
            },
          ],
          stop_reason: "tool_use",
          usage: { input_tokens: 5, output_tokens: 5 },
        }),
      } as Response;
    }
    return { ok: true } as Response; // source-reachability check
  }) as typeof fetch;
});
after(() => {
  global.fetch = originalFetch;
});

// Each test seeds exactly the questions/log rows it needs -- without this,
// a test that seeds 12 "ran today" log rows (to simulate the daily cap)
// would leak into every test that runs after it in the same file, since
// they all share one isolated DB file for the whole module.
beforeEach(() => {
  db.exec("DELETE FROM ai_generation_log; DELETE FROM questions; DELETE FROM question_consumption_log;");
});

function baseConfig(overrides: Partial<AiQuestionsConfig> = {}): AiQuestionsConfig {
  return {
    enabled: true,
    anthropicApiKey: "test-key",
    anthropicModel: "test-model",
    openaiApiKey: null,
    embeddingModel: "test-embedding-model",
    minStockPerBucket: 15,
    targetStockPerBucket: 40,
    minStockPerDifficulty: {},
    targetStockPerDifficulty: {},
    circuitBreakerThreshold: 0,
    demandWindowHours: 24,
    demandWeight: 0,
    batchSize: 20,
    maxBatchesPerDay: 12,
    maxBucketsPerRun: 4,
    autoApprove: true,
    duplicateRejectThreshold: 0.95,
    duplicateReviewThreshold: 0.85,
    ...overrides,
  };
}

describe("checkAndTopUp -- todo motivo de pular fica registrado, nunca silencioso", () => {
  it("pulado quando AI_QUESTIONS_ENABLED nao esta ligado, com motivo explicito", async () => {
    const summary = await checkAndTopUp(baseConfig({ enabled: false }));
    assert.equal(summary.skipped, true);
    assert.match(summary.reason!, /AI_QUESTIONS_ENABLED/);
  });

  it("pulado quando falta ANTHROPIC_API_KEY, com motivo explicito", async () => {
    const summary = await checkAndTopUp(baseConfig({ anthropicApiKey: null }));
    assert.equal(summary.skipped, true);
    assert.match(summary.reason!, /ANTHROPIC_API_KEY/);
  });

  it("pulado quando o limite diario de lotes ja foi atingido, com a contagem no motivo", async () => {
    for (let i = 0; i < 12; i++) {
      insertAiGenerationLog({
        category: "aleatorio",
        difficulty: "facil",
        requested: 1,
        generated: 1,
        rejectedValidation: 0,
        rejectedDuplicate: 0,
        flaggedForReview: 0,
        autoApproved: 1,
        model: "test-model",
        error: null,
        startedAt: Date.now(),
        finishedAt: Date.now(),
        inputTokens: null,
        outputTokens: null,
      });
    }
    const summary = await checkAndTopUp(baseConfig({ maxBatchesPerDay: 12 }));
    assert.equal(summary.skipped, true);
    assert.match(summary.reason!, /limite diario.*12\/12/);
  });
});

describe("checkAndTopUp -- processa buckets deficitarios de verdade quando nada bloqueia", () => {
  it("gera para um bucket abaixo do minimo e o estoque aprovado sobe", async () => {
    const before = getStockReport().find((b) => b.category === "futebol_saudita" && b.difficulty === "impossivel")!;
    assert.equal(before.count, 0);

    const summary = await checkAndTopUp(baseConfig({ minStockPerBucket: 1, targetStockPerBucket: 1, maxBucketsPerRun: 70, maxBatchesPerDay: 70 }));
    assert.equal(summary.skipped, false);
    assert.ok(summary.batches.length > 0, "deveria ter processado pelo menos 1 bucket deficitario");

    const after = getStockReport().find((b) => b.category === "futebol_saudita" && b.difficulty === "impossivel")!;
    assert.ok(after.count >= 1, "o bucket impossivel/futebol_saudita deveria ter recebido pelo menos 1 pergunta aprovada");
  });

  it('"estoque suficiente" tambem fica registrado como pulado, nao como silencio', async () => {
    // Preenche todos os 70 buckets ate o minimo exigido por esta config.
    const { QUESTION_CATEGORIES, DIFFICULTIES } = await import("../src/questions/ai/buckets.js");
    for (const category of QUESTION_CATEGORIES) {
      for (const difficulty of DIFFICULTIES) {
        for (let i = 0; i < 2; i++) {
          insertQuestion({
            category,
            difficulty,
            format: "aberta",
            prompt: `Pergunta de estoque ${category}-${difficulty}-${i}-${Math.random()}`,
            correctAnswer: "Resposta",
          });
        }
      }
    }
    const summary = await checkAndTopUp(baseConfig({ minStockPerBucket: 2 }));
    assert.equal(summary.skipped, true);
    assert.match(summary.reason!, /estoque suficiente/);
  });
});

describe("formatTopUpLog -- nunca silencioso, nunca vaza segredo", () => {
  it("formata um pulo com o motivo explicito", () => {
    const lines = formatTopUpLog("boot", { skipped: true, reason: "ANTHROPIC_API_KEY ausente", batches: [], circuitBroken: [] });
    assert.equal(lines.length, 1);
    assert.match(lines[0], /pulado -- ANTHROPIC_API_KEY ausente/);
  });

  it("formata um lote processado com todos os contadores, sem nunca incluir a api key", () => {
    const lines = formatTopUpLog("intervalo de 6h", {
      skipped: false,
      circuitBroken: [],
      batches: [
        {
          category: "clubes",
          difficulty: "impossivel",
          result: {
            insertedIds: ["a", "b"],
            requested: 5,
            generated: 5,
            rejectedValidation: 1,
            rejectedDuplicate: 1,
            flaggedForReview: 1,
            autoApproved: 2,
            error: null,
            usage: null,
          },
        },
      ],
    });
    assert.equal(lines.length, 1);
    assert.match(lines[0], /clubes\/impossivel/);
    assert.match(lines[0], /pedidas=5/);
    assert.match(lines[0], /geradas=5/);
    assert.match(lines[0], /aprovadas=2/);
    assert.match(lines[0], /pendentes=1/);
    assert.match(lines[0], /rejeitadas_validacao=1/);
    assert.match(lines[0], /rejeitadas_duplicata=1/);
    assert.doesNotMatch(lines[0], /key/i);
  });

  it("inclui o erro da Anthropic quando o lote falhou", () => {
    const lines = formatTopUpLog("boot", {
      skipped: false,
      circuitBroken: [],
      batches: [
        {
          category: "selecoes",
          difficulty: "dificil",
          result: {
            insertedIds: [],
            requested: 5,
            generated: 0,
            rejectedValidation: 0,
            rejectedDuplicate: 0,
            flaggedForReview: 0,
            autoApproved: 0,
            error: "HTTP 500 da Anthropic",
            usage: null,
          },
        },
      ],
    });
    assert.match(lines[0], /ERRO="HTTP 500 da Anthropic"/);
  });
});

describe("rankBucketsByPriority -- prioriza por deficit E por demanda real, nao so por deficit", () => {
  const demandConfig = { minStockPerBucket: 15, minStockPerDifficulty: {}, demandWeight: 2, demandWindowHours: 24 };

  it("sem consumo registrado, ordena so por deficit (demandWeight=0 cai nesse caso tambem)", () => {
    const buckets = [
      { category: "clubes" as const, difficulty: "facil" as const, count: 10 }, // deficit 5
      { category: "jogadores" as const, difficulty: "facil" as const, count: 0 }, // deficit 15
    ];
    const ranked = rankBucketsByPriority(buckets, new Map(), { ...demandConfig, demandWeight: 0 });
    assert.equal(ranked[0].category, "jogadores");
    assert.equal(ranked[1].category, "clubes");
  });

  it("um bucket com deficit menor mas consumo recente alto pode furar a fila de um com deficit maior e sem consumo", () => {
    const buckets = [
      { category: "clubes" as const, difficulty: "facil" as const, count: 10 }, // deficit 5
      { category: "jogadores" as const, difficulty: "facil" as const, count: 0 }, // deficit 15, nunca consumido
    ];
    // Deficit puro colocaria jogadores primeiro (15 > 5). Com consumo
    // intenso em clubes (240 em 24h = 10/h, peso 2 -> +20), a prioridade
    // de clubes (5 + 20 = 25) passa a de jogadores (15 + 0 = 15).
    const veryHighDemand = new Map([["clubes::facil", 240]]);
    const ranked = rankBucketsByPriority(buckets, veryHighDemand, demandConfig);
    assert.equal(ranked[0].category, "clubes", "consumo intenso deveria superar o deficit puro de jogadores");
  });

  it("buckets com estoque no minimo ou acima nunca entram na lista (deficit <= 0)", () => {
    const buckets = [{ category: "clubes" as const, difficulty: "facil" as const, count: 15 }];
    const ranked = rankBucketsByPriority(buckets, new Map(), demandConfig);
    assert.equal(ranked.length, 0);
  });

  it("minStockPerDifficulty sobrescreve o minStockPerBucket global quando presente", () => {
    const buckets = [{ category: "clubes" as const, difficulty: "impossivel" as const, count: 5 }];
    const config = { ...demandConfig, minStockPerDifficulty: { impossivel: 3 } };
    // minimo especifico (3) e menor que o estoque (5) -> sem deficit, mesmo
    // que o minimo global (15) diria o contrario.
    const ranked = rankBucketsByPriority(buckets, new Map(), config);
    assert.equal(ranked.length, 0);
  });
});

describe("minStockFor/targetStockFor -- override por dificuldade com fallback para o valor global", () => {
  it("usa o override quando existe", () => {
    const config = { minStockPerBucket: 15, targetStockPerBucket: 40, minStockPerDifficulty: { impossivel: 7 }, targetStockPerDifficulty: { impossivel: 20 } } as AiQuestionsConfig;
    assert.equal(minStockFor(config, "impossivel"), 7);
    assert.equal(targetStockFor(config, "impossivel"), 20);
  });

  it("cai para o valor global quando nao ha override para essa dificuldade", () => {
    const config = { minStockPerBucket: 15, targetStockPerBucket: 40, minStockPerDifficulty: {}, targetStockPerDifficulty: {} } as AiQuestionsConfig;
    assert.equal(minStockFor(config, "facil"), 15);
    assert.equal(targetStockFor(config, "facil"), 40);
  });
});

describe("checkAndTopUp -- circuit breaker por bucket (nunca tenta para sempre um bucket quebrado)", () => {
  it("pula (sem tentar de novo) um bucket com N falhas consecutivas, e registra isso separado dos processados", async () => {
    for (let i = 0; i < 3; i++) {
      insertAiGenerationLog({
        category: "futebol_saudita",
        difficulty: "impossivel",
        requested: 20,
        generated: 0,
        rejectedValidation: 0,
        rejectedDuplicate: 0,
        flaggedForReview: 0,
        autoApproved: 0,
        model: "test-model",
        error: "falha simulada",
        startedAt: Date.now(),
        finishedAt: Date.now(),
        inputTokens: null,
        outputTokens: null,
      });
    }
    assert.equal(recentFailureStreak("futebol_saudita", "impossivel", 3), true);

    const summary = await checkAndTopUp(
      baseConfig({ minStockPerBucket: 1, targetStockPerBucket: 1, maxBucketsPerRun: 70, maxBatchesPerDay: 70, circuitBreakerThreshold: 3 }),
    );
    assert.equal(summary.skipped, false);
    assert.ok(
      summary.circuitBroken.some((b) => b.category === "futebol_saudita" && b.difficulty === "impossivel"),
      "futebol_saudita/impossivel deveria estar na lista de circuit-broken",
    );
    assert.ok(
      !summary.batches.some((b) => b.category === "futebol_saudita" && b.difficulty === "impossivel"),
      "nao deveria ter tentado gerar de novo para esse bucket",
    );

    const lines = formatTopUpLog("boot", summary);
    assert.ok(lines.some((l) => l.includes("circuit breaker aberto") && l.includes("futebol_saudita/impossivel")));
  });

  it("circuitBreakerThreshold=0 desativa o breaker -- o bucket volta a ser tentado normalmente", async () => {
    for (let i = 0; i < 5; i++) {
      insertAiGenerationLog({
        category: "futebol_saudita",
        difficulty: "impossivel",
        requested: 20,
        generated: 0,
        rejectedValidation: 0,
        rejectedDuplicate: 0,
        flaggedForReview: 0,
        autoApproved: 0,
        model: "test-model",
        error: "falha simulada",
        startedAt: Date.now(),
        finishedAt: Date.now(),
        inputTokens: null,
        outputTokens: null,
      });
    }
    const summary = await checkAndTopUp(
      baseConfig({ minStockPerBucket: 1, targetStockPerBucket: 1, maxBucketsPerRun: 70, maxBatchesPerDay: 70, circuitBreakerThreshold: 0 }),
    );
    assert.equal(summary.circuitBroken.length, 0);
  });
});

describe("checkAndTopUp -- lock de geracao compartilhado (nunca roda duas geracoes ao mesmo tempo)", () => {
  it("se o lock ja estiver ocupado (ex. por uma chamada manual a /gerar), checkAndTopUp pula e explica o motivo", async () => {
    assert.equal(acquireGenerationLock(), true, "deveria conseguir o lock na primeira vez");
    try {
      const summary = await checkAndTopUp(baseConfig({ minStockPerBucket: 1, targetStockPerBucket: 1, maxBucketsPerRun: 70, maxBatchesPerDay: 70 }));
      assert.equal(summary.skipped, true);
      assert.match(summary.reason!, /geracao em andamento/);
    } finally {
      releaseGenerationLock();
    }
  });

  it("depois de liberado, uma nova chamada consegue o lock normalmente", async () => {
    assert.equal(acquireGenerationLock(), true);
    releaseGenerationLock();
    assert.equal(acquireGenerationLock(), true, "deveria conseguir de novo depois do release");
    releaseGenerationLock();
  });
});

describe("consumo de perguntas -- registra o que foi servido a uma partida, para orientar a reposicao", () => {
  it("countConsumptionSince conta certo por bucket, e ignora o que esta fora da janela", () => {
    const now = Date.now();
    insertQuestionConsumption("clubes", "facil", "q1");
    insertQuestionConsumption("clubes", "facil", "q2");
    insertQuestionConsumption("jogadores", "medio", "q3");
    // Fora da janela: simulado inserindo direto com served_at antigo.
    db.prepare("INSERT INTO question_consumption_log (id, category, difficulty, question_id, served_at) VALUES (?, ?, ?, ?, ?)").run(
      "old-1",
      "clubes",
      "facil",
      "q-old",
      now - 1000 * 60 * 60 * 48,
    );

    const since = now - 1000 * 60 * 60 * 24;
    const counts = countConsumptionSince(since);
    const clubesFacil = counts.find((c) => c.category === "clubes" && c.difficulty === "facil");
    const jogadoresMedio = counts.find((c) => c.category === "jogadores" && c.difficulty === "medio");
    assert.equal(clubesFacil?.count, 2, "nao deveria contar o consumo de 48h atras, fora da janela de 24h");
    assert.equal(jogadoresMedio?.count, 1);
  });
});
