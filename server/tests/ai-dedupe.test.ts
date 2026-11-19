// Pure dedupe logic (questions/ai/dedupe.ts) exercised against fabricated
// in-memory pools -- no network, no real database rows. dedupe.ts imports
// from db/questions.js at module scope (for the loadTextPool/
// loadEmbeddingPool helpers this file doesn't use), which would otherwise
// open/migrate the real dev SQLite file as a side effect of just importing
// the module. A *static* `import ... from "../src/questions/ai/dedupe.js"`
// placed after the `process.env.DB_PATH = ...` line below would NOT be
// redirected in time: ES module imports are hoisted and evaluated before
// this file's own top-level statements run, regardless of source order
// (see ai-pipeline.test.ts for the full explanation, including how this
// was caught against the real dev database). Dynamic `import()` after
// setting DB_PATH sidesteps that.
import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import os from "node:os";
import type { StoredEmbedding } from "../src/db/questions.js";

const dbPath = `${os.tmpdir()}/cobra-ai-dedupe-test-${process.pid}-${Date.now()}.db`;
process.env.DB_PATH = dbPath;

const { checkDuplicateAgainstPools, semanticDuplicateAgainstPool, textualDuplicateAgainstPool } = await import(
  "../src/questions/ai/dedupe.js"
);
type PromptPoolEntry = import("../src/questions/ai/dedupe.js").PromptPoolEntry;
const { db } = await import("../src/db/db.js");

after(() => {
  db.close();
  // Best-effort only (see ai-pipeline.test.ts for why this can fail
  // harmlessly on Windows): a unique pid+timestamp file in the OS temp
  // dir, so leaving it behind is cleanup debt, not a correctness problem.
  try {
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${dbPath}${suffix}`, { force: true });
  } catch {
    // ignore
  }
});

const pool: PromptPoolEntry[] = [
  { id: "q1", category: "copa_do_mundo", prompt: "Em que ano o Brasil conquistou o pentacampeonato mundial?" },
  { id: "q2", category: "copa_do_mundo", prompt: "Qual pais venceu a Copa do Mundo de 1998?" },
  { id: "q3", category: "clubes", prompt: "Qual o apelido do Flamengo?" },
];

describe("textualDuplicateAgainstPool", () => {
  it("marca como duplicata o mesmo enunciado so com caixa/pontuacao diferentes, na mesma categoria", () => {
    // normalizeAnswer (@cobra/shared) estrips accents/caixa/pontuacao, entao
    // isto fica identico ao prompt de q1 depois de normalizado -- o tipo de
    // "reformulacao" que o filtro textual precisa pegar sem precisar de
    // embeddings. Uma reformulacao com palavras diferentes (ex.: troca de
    // sinonimo) e deliberadamente deixada para a camada semantica, porque
    // perguntas de quiz com a MESMA estrutura de frase e um dado diferente
    // (ano, pais) tambem ficam parecidas em n-gramas de texto sem serem
    // duplicatas -- ver ai-pipeline.test.ts.
    const result = textualDuplicateAgainstPool(
      "EM QUE ANO O BRASIL CONQUISTOU O PENTACAMPEONATO MUNDIAL???",
      "copa_do_mundo",
      pool,
    );
    assert.ok(result, "deveria encontrar duplicata");
    assert.equal(result!.matchId, "q1");
  });

  it("nao marca como duplicata um fato claramente distinto", () => {
    const result = textualDuplicateAgainstPool("Quem e o maior artilheiro da historia das Copas do Mundo?", "copa_do_mundo", pool);
    assert.equal(result, null);
  });

  it("ignora candidatos de outra categoria mesmo com texto identico", () => {
    const result = textualDuplicateAgainstPool("Qual o apelido do Flamengo?", "jogadores", pool);
    assert.equal(result, null);
  });
});

function embeddingFor(vector: number[]): Float32Array {
  return Float32Array.from(vector);
}

describe("semanticDuplicateAgainstPool", () => {
  const embeddingPool: StoredEmbedding[] = [
    { questionId: "e1", model: "test-model", category: "copa_do_mundo", embedding: embeddingFor([1, 0, 0]) },
    { questionId: "e2", model: "test-model", category: "jogadores", embedding: embeddingFor([1, 0, 0]) },
  ];
  const thresholds = { rejectThreshold: 0.95, reviewThreshold: 0.85 };

  it("retorna 'duplicate' quando a similaridade passa do limiar de rejeicao", () => {
    const result = semanticDuplicateAgainstPool(embeddingFor([1, 0, 0]), "copa_do_mundo", embeddingPool, thresholds);
    assert.equal(result?.verdict, "duplicate");
    assert.equal(result?.matchId, "e1");
  });

  it("retorna 'needs_review' numa faixa intermediaria de similaridade", () => {
    // cos(30deg) ~= 0.866 -- entre 0.85 e 0.95.
    const result = semanticDuplicateAgainstPool(embeddingFor([Math.cos(Math.PI / 6), Math.sin(Math.PI / 6), 0]), "copa_do_mundo", embeddingPool, thresholds);
    assert.equal(result?.verdict, "needs_review");
  });

  it("retorna null quando a similaridade e baixa", () => {
    const result = semanticDuplicateAgainstPool(embeddingFor([0, 1, 0]), "copa_do_mundo", embeddingPool, thresholds);
    assert.equal(result, null);
  });

  it("ignora embeddings de outra categoria", () => {
    const result = semanticDuplicateAgainstPool(embeddingFor([1, 0, 0]), "clubes", embeddingPool, thresholds);
    assert.equal(result, null);
  });
});

describe("checkDuplicateAgainstPools", () => {
  it("retorna 'unique' quando nao bate em nenhuma das duas camadas", () => {
    const result = checkDuplicateAgainstPools("Pergunta completamente nova sobre arbitragem", "copa_do_mundo", pool, null);
    assert.equal(result.verdict, "unique");
  });

  it("a camada textual decide antes mesmo de rodar a semantica", () => {
    const result = checkDuplicateAgainstPools(
      "EM QUE ANO O BRASIL CONQUISTOU O PENTACAMPEONATO MUNDIAL???",
      "copa_do_mundo",
      pool,
      { embedding: embeddingFor([0, 1, 0]), pool: [], thresholds: { rejectThreshold: 0.95, reviewThreshold: 0.85 } },
    );
    assert.equal(result.verdict, "duplicate");
    assert.equal(result.matchId, "q1");
  });
});
