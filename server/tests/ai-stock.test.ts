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

const { checkAndTopUp, formatTopUpLog, getStockReport } = await import("../src/questions/ai/stock.js");
const { insertQuestion, insertAiGenerationLog } = await import("../src/db/questions.js");
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
  db.exec("DELETE FROM ai_generation_log; DELETE FROM questions;");
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
    const lines = formatTopUpLog("boot", { skipped: true, reason: "ANTHROPIC_API_KEY ausente", batches: [] });
    assert.equal(lines.length, 1);
    assert.match(lines[0], /pulado -- ANTHROPIC_API_KEY ausente/);
  });

  it("formata um lote processado com todos os contadores, sem nunca incluir a api key", () => {
    const lines = formatTopUpLog("intervalo de 6h", {
      skipped: false,
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
