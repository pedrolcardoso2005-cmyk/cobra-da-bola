// Quality gates for the permanent question bank. These check the batches
// that exist so far are well-formed and that loading them is safe to
// repeat -- NOT that the bank has reached 3000 questions yet (see
// server/src/questions/bank/PROGRESS.md for how many are done). A test
// asserting the full 3000/750-per-difficulty target belongs here only once
// that target is actually met.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { answersMatch } from "@cobra/shared";
import { batch001 } from "../src/questions/bank/batch-001.js";
import { batch002 } from "../src/questions/bank/batch-002.js";
import { batch003 } from "../src/questions/bank/batch-003.js";
import { loadQuestionBank } from "../src/questions/bank/index.js";

const FOUR_LEVELS = { facil: 25, moderado: 25, medio: 25, dificil: 25 };
const FIVE_LEVELS = { facil: 20, moderado: 20, medio: 20, dificil: 20, impossivel: 20 };

function checkBatchShape(batch: typeof batch001, label: string, expected: Record<string, number> = FOUR_LEVELS) {
  assert.equal(batch.length, 100, `${label} deveria ter 100 perguntas`);
  const byDifficulty: Record<string, number> = {};
  for (const q of batch) byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] ?? 0) + 1;
  assert.deepEqual(byDifficulty, expected, `${label} fora da distribuicao esperada`);

  const slugs = new Set<string>();
  for (const entry of batch) {
    assert.ok(entry.slug && !slugs.has(entry.slug), `slug duplicado ou vazio: ${entry.slug}`);
    slugs.add(entry.slug);
    assert.ok(entry.prompt?.trim(), `pergunta vazia em ${entry.slug}`);
    assert.ok(entry.correctAnswer?.trim(), `resposta vazia em ${entry.slug}`);
    assert.ok(entry.category, `categoria vazia em ${entry.slug}`);
    assert.ok(entry.difficulty, `dificuldade vazia em ${entry.slug}`);
    assert.ok(entry.sourceUrl?.trim(), `fonte vazia em ${entry.slug}`);
    assert.equal(entry.format, "aberta", `${entry.slug} deveria ser pergunta aberta`);
  }
  assert.equal(slugs.size, 100);

  const prompts = new Set<string>();
  for (const entry of batch) {
    assert.ok(!prompts.has(entry.prompt), `pergunta repetida dentro do ${label}: ${entry.prompt}`);
    prompts.add(entry.prompt);
  }
}

describe("banco de perguntas -- lote 001", () => {
  it("tem exatamente 100 perguntas, 25 em cada dificuldade, sem duplicadas internas", () => {
    checkBatchShape(batch001, "lote 001");
  });

  it("carregar o banco e idempotente (rodar duas vezes nao duplica nada)", () => {
    const first = loadQuestionBank();
    const second = loadQuestionBank();
    assert.equal(second.inserted, 0, "a segunda carga nao deveria inserir nada de novo");
    assert.equal(second.skipped, first.total);
  });
});

describe("banco de perguntas -- lote 002", () => {
  it("tem exatamente 100 perguntas, 25 em cada dificuldade, sem duplicadas internas", () => {
    checkBatchShape(batch002, "lote 002");
  });

  it("nao repete nenhum enunciado do lote 001", () => {
    const batch1Prompts = new Set(batch001.map((q) => q.prompt));
    for (const entry of batch002) {
      assert.ok(!batch1Prompts.has(entry.prompt), `pergunta do lote 002 repete o lote 001: ${entry.prompt}`);
    }
  });
});

describe("banco de perguntas -- lote 003", () => {
  it("tem exatamente 100 perguntas, 20 em cada uma das 5 dificuldades, sem duplicadas internas", () => {
    checkBatchShape(batch003, "lote 003", FIVE_LEVELS);
  });

  it("nao repete nenhum enunciado nem slug dos lotes 001 e 002", () => {
    const previous = [...batch001, ...batch002];
    const prompts = new Set(previous.map((q) => q.prompt));
    const slugs = new Set(previous.map((q) => q.slug));
    for (const entry of batch003) {
      assert.ok(!prompts.has(entry.prompt), `pergunta do lote 003 repete lote anterior: ${entry.prompt}`);
      assert.ok(!slugs.has(entry.slug), `slug do lote 003 repete lote anterior: ${entry.slug}`);
      assert.ok(entry.explanation?.trim(), `explicacao vazia em ${entry.slug}`);
    }
  });
});

describe("correcao de respostas abertas (answersMatch) sobre perguntas reais do banco", () => {
  it("aceita variacoes de maiusculas, acentos e espacos para uma resposta do banco", () => {
    const pele = batch001.find((q) => q.slug === "b1-f-03")!;
    assert.equal(pele.correctAnswer, "Pele");
    assert.ok(answersMatch("pele", pele.correctAnswer, pele.acceptedAnswers));
    assert.ok(answersMatch("PELÉ", pele.correctAnswer, pele.acceptedAnswers));
    assert.ok(answersMatch("  Pelé  ", pele.correctAnswer, pele.acceptedAnswers));
    assert.ok(answersMatch("edson arantes do nascimento", pele.correctAnswer, pele.acceptedAnswers));
  });

  it("aceita respostas alternativas cadastradas e rejeita respostas erradas", () => {
    const leonidas = batch001.find((q) => q.slug === "b1-h-23")!;
    assert.ok(answersMatch("Diamante Negro", leonidas.correctAnswer, leonidas.acceptedAnswers));
    assert.ok(answersMatch("leonidas da silva", leonidas.correctAnswer, leonidas.acceptedAnswers));
    assert.ok(!answersMatch("Pele", leonidas.correctAnswer, leonidas.acceptedAnswers));
    assert.ok(!answersMatch("", leonidas.correctAnswer, leonidas.acceptedAnswers));
  });
});
