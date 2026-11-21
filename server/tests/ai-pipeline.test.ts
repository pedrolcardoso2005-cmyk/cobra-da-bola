// End-to-end test of the AI question-generation pipeline (generate ->
// validate -> dedupe -> insert as pending/approved), with the Anthropic and
// OpenAI HTTP calls stubbed via global.fetch -- no real network access, no
// real API key needed. Runs against a throwaway SQLite file in the OS temp
// dir so it never touches the real dev database or the live question bank.
//
// IMPORTANT: db.ts reads DB_PATH from process.env at module-evaluation
// time, and ES module `import` declarations are hoisted -- every
// statically imported module (however it's ordered in this file's source)
// is fully evaluated *before* this file's own top-level statements run. So
// setting `process.env.DB_PATH` as a plain statement above a static
// `import ... from "../src/questions/ai/pipeline.js"` does NOT run in time
// to affect db.ts; it silently falls through to the real dev database
// instead (this was caught by inspecting server/data/cobra.db after a
// first version of this file ran and found rows it had inserted there).
// Dynamic `import()` is a function call, not hoisted, so it's used below
// for every module that transitively touches db.ts, after DB_PATH is set.
// `node:test`/`node:assert` and type-only imports have no such side effect
// and stay as ordinary static imports.
import { describe, it, after, before } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import os from "node:os";
import type { AiQuestionsConfig } from "../src/questions/ai/config.js";
import type { GeneratedQuestionCandidate } from "../src/questions/ai/types.js";

const dbPath = `${os.tmpdir()}/cobra-ai-pipeline-test-${process.pid}-${Date.now()}.db`;
process.env.DB_PATH = dbPath;

const { runGenerationBatch } = await import("../src/questions/ai/pipeline.js");
const { listPendingQuestions } = await import("../src/db/questions.js");
const { db } = await import("../src/db/db.js");

function baseConfig(overrides: Partial<AiQuestionsConfig> = {}): AiQuestionsConfig {
  return {
    enabled: true,
    anthropicApiKey: "test-anthropic-key",
    anthropicModel: "test-model",
    openaiApiKey: "test-openai-key",
    embeddingModel: "test-embedding-model",
    minStockPerBucket: 15,
    targetStockPerBucket: 40,
    minStockPerDifficulty: {},
    targetStockPerDifficulty: {},
    circuitBreakerThreshold: 0,
    demandWindowHours: 24,
    demandWeight: 0,
    batchSize: 20,
    maxBatchesPerDay: 6,
    autoApprove: false,
    duplicateRejectThreshold: 0.95,
    duplicateReviewThreshold: 0.85,
    ...overrides,
  };
}

let anthropicResponder: () => { ok: boolean; status?: number; candidates?: GeneratedQuestionCandidate[] };

// Deterministic stand-in for a real embedding: same text -> same vector,
// different text -> (very likely) low cosine similarity, so the mocked
// OpenAI endpoint doesn't flag unrelated candidates as semantic duplicates
// of each other just because they share a category. The real semantic
// dedupe math (verdict thresholds) is covered on fabricated vectors in
// ai-dedupe.test.ts; this only needs to not produce false positives here.
function fakeEmbedding(text: string): number[] {
  const dims = 8;
  const vec: number[] = [];
  for (let d = 0; d < dims; d++) {
    let h = d + 1;
    for (let i = 0; i < text.length; i++) h = (h * 131 + text.charCodeAt(i)) >>> 0;
    vec.push((h % 2000 - 1000) / 1000);
  }
  return vec;
}

const originalFetch = global.fetch;
before(() => {
  global.fetch = (async (url: string | URL, init?: RequestInit) => {
    const u = String(url);
    if (u.includes("api.anthropic.com")) {
      const r = anthropicResponder();
      if (!r.ok) {
        return { ok: false, status: r.status ?? 500, text: async () => "erro simulado da API" } as Response;
      }
      return {
        ok: true,
        json: async () => ({
          content: [{ type: "tool_use", name: "submit_questions", input: { questions: r.candidates ?? [] } }],
          stop_reason: "tool_use",
          usage: { input_tokens: 10, output_tokens: 10 },
        }),
      } as Response;
    }
    if (u.includes("api.openai.com")) {
      const body = JSON.parse(String(init?.body ?? "{}"));
      const texts: string[] = body.input ?? [];
      return {
        ok: true,
        json: async () => ({ data: texts.map((text, index) => ({ embedding: fakeEmbedding(text), index })) }),
      } as Response;
    }
    // Anything else is treated as a source-URL reachability check.
    return { ok: !u.includes("unreachable") } as Response;
  }) as typeof fetch;
});

after(() => {
  global.fetch = originalFetch;
  db.close();
  // Best-effort only: on Windows, node:sqlite can keep the file briefly
  // locked even after close() in some cases. It's a unique pid+timestamp
  // name in the OS temp dir either way, so leaving it behind on the rare
  // failure is harmless cleanup debt, not a correctness problem.
  try {
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${dbPath}${suffix}`, { force: true });
  } catch {
    // ignore
  }
});

function candidate(overrides: Partial<GeneratedQuestionCandidate> = {}): GeneratedQuestionCandidate {
  return {
    category: "copa_do_mundo",
    difficulty: "facil",
    format: "aberta",
    prompt: "Pergunta de teste unica o bastante para passar na validacao de tamanho minimo.",
    correctAnswer: "Resposta",
    explanation: "Explicacao de teste.",
    sourceUrl: "https://example.com/fonte-teste",
    ...overrides,
  };
}

describe("runGenerationBatch", () => {
  it("separa candidatos invalidos dos validos, e por padrao tudo vai para revisao (nao auto-aprova)", async () => {
    anthropicResponder = () => ({
      ok: true,
      candidates: [
        candidate({ category: "copa_do_mundo", prompt: "Quem venceu a Copa do Mundo de 1994, nos Estados Unidos?", correctAnswer: "Brasil" }),
        candidate({ category: "copa_do_mundo", prompt: "Quem venceu a Copa do Mundo de 2002, no Japao e Coreia do Sul?", correctAnswer: "Brasil" }),
        candidate({ category: "copa_do_mundo", prompt: "Pergunta invalida", explanation: "" }), // explanation vazia -> falha no schema
      ],
    });

    const result = await runGenerationBatch(baseConfig(), "copa_do_mundo", "facil", 3);

    assert.equal(result.error, null);
    assert.equal(result.generated, 3);
    assert.equal(result.rejectedValidation, 1);
    assert.equal(result.rejectedDuplicate, 0);
    assert.equal(result.flaggedForReview, 2);
    assert.equal(result.autoApproved, 0);
    assert.equal(result.insertedIds.length, 2);

    const pendingIds = new Set(listPendingQuestions().map((q) => q.id));
    for (const id of result.insertedIds) assert.ok(pendingIds.has(id), `${id} deveria estar pendente de revisao`);
  });

  it("rejeita como duplicata um candidato quase igual a outro do mesmo lote", async () => {
    anthropicResponder = () => ({
      ok: true,
      candidates: [
        candidate({ category: "clubes", prompt: "Qual o apelido do Botafogo?", correctAnswer: "Fogao" }),
        candidate({ category: "clubes", prompt: "QUAL O APELIDO DO BOTAFOGO???", correctAnswer: "Fogao" }), // mesmo texto normalizado
        candidate({ category: "clubes", prompt: "Qual o apelido do Gremio, time gaucho?", correctAnswer: "Imortal Tricolor" }),
      ],
    });

    const result = await runGenerationBatch(baseConfig(), "clubes", "facil", 3);

    assert.equal(result.generated, 3);
    assert.equal(result.rejectedDuplicate, 1);
    assert.equal(result.insertedIds.length, 2);
  });

  it("com AUTO_APPROVE ligado, aprova direto quando a fonte resolve, mas ainda manda para revisao se a fonte nao resolve", async () => {
    anthropicResponder = () => ({
      ok: true,
      candidates: [
        candidate({ category: "jogadores", prompt: "Pergunta auto-aprovavel com fonte valida e alcancavel.", sourceUrl: "https://example.com/fonte-ok" }),
        candidate({ category: "jogadores", prompt: "Pergunta com fonte que nao resolve de verdade.", sourceUrl: "https://example.com/unreachable" }),
      ],
    });

    const result = await runGenerationBatch(baseConfig({ autoApprove: true }), "jogadores", "medio", 2);

    assert.equal(result.autoApproved, 1);
    assert.equal(result.flaggedForReview, 1);

    const rows = db.prepare("SELECT id, status FROM questions WHERE id IN (?, ?)").all(...result.insertedIds) as { id: string; status: string }[];
    const statuses = new Map(rows.map((r) => [r.id, r.status]));
    const approvedCount = [...statuses.values()].filter((s) => s === "approved").length;
    const pendingCount = [...statuses.values()].filter((s) => s === "pending_review").length;
    assert.equal(approvedCount, 1);
    assert.equal(pendingCount, 1);
  });

  it("nunca lanca quando a API da Anthropic falha, e reporta o erro no resultado", async () => {
    anthropicResponder = () => ({ ok: false, status: 500 });

    const result = await runGenerationBatch(baseConfig(), "selecoes", "dificil", 5);

    assert.ok(result.error && result.error.length > 0);
    assert.equal(result.generated, 0);
    assert.equal(result.insertedIds.length, 0);
  });

  it("se a API de embeddings falhar, continua funcionando so com a deduplicacao textual", async () => {
    const failingFetch = global.fetch;
    global.fetch = (async (url: string | URL, init?: RequestInit) => {
      if (String(url).includes("api.openai.com")) return { ok: false, status: 500, text: async () => "falha simulada" } as Response;
      return (failingFetch as any)(url, init);
    }) as typeof fetch;

    anthropicResponder = () => ({
      ok: true,
      candidates: [candidate({ category: "competicoes_nacionais", prompt: "Pergunta nova sobre competicoes nacionais, sem duplicata." })],
    });

    const result = await runGenerationBatch(baseConfig(), "competicoes_nacionais", "facil", 1);

    global.fetch = failingFetch;

    assert.equal(result.error, null);
    assert.equal(result.insertedIds.length, 1);
    assert.equal(result.flaggedForReview, 1);
  });

  it("grava o motivo real da pendencia na propria pergunta -- fonte inacessivel vs. auto-approve desligado", async () => {
    anthropicResponder = () => ({
      ok: true,
      candidates: [
        candidate({ category: "concacaf", prompt: "Pergunta pendente por fonte que nao resolve de verdade.", sourceUrl: "https://example.com/unreachable" }),
      ],
    });

    const result = await runGenerationBatch(baseConfig({ autoApprove: true }), "concacaf", "facil", 1);
    assert.equal(result.flaggedForReview, 1);

    const row = db.prepare("SELECT review_reason FROM questions WHERE id = ?").get(result.insertedIds[0]) as { review_reason: string };
    assert.match(row.review_reason, /fonte_inacessivel/);

    // Mesma fonte, mas com AUTO_APPROVE desligado -- o motivo tem que
    // deixar claro que nao foi a qualidade da pergunta, foi a politica.
    anthropicResponder = () => ({
      ok: true,
      candidates: [candidate({ category: "concacaf", prompt: "Outra pergunta nova, com fonte alcancavel desta vez." })],
    });
    const result2 = await runGenerationBatch(baseConfig({ autoApprove: false }), "concacaf", "facil", 1);
    const row2 = db.prepare("SELECT review_reason FROM questions WHERE id = ?").get(result2.insertedIds[0]) as { review_reason: string };
    assert.match(row2.review_reason, /auto_approve_desligado/);
  });

  it("grava o consumo de tokens no log de geracao, para monitoramento de custo (nao fica so em memoria)", async () => {
    anthropicResponder = () => ({
      ok: true,
      candidates: [candidate({ category: "historia_do_futebol", prompt: "Pergunta nova e unica sobre a historia do futebol mundial." })],
    });

    const startedAt = Date.now();
    await runGenerationBatch(baseConfig(), "historia_do_futebol", "facil", 1);

    const row = db
      .prepare("SELECT input_tokens, output_tokens FROM ai_generation_log WHERE category = ? AND started_at >= ? ORDER BY started_at DESC LIMIT 1")
      .get("historia_do_futebol", startedAt) as { input_tokens: number; output_tokens: number };
    // O fetch mockado deste arquivo sempre devolve usage: {input_tokens:10, output_tokens:10}.
    assert.equal(row.input_tokens, 10);
    assert.equal(row.output_tokens, 10);
  });
});
