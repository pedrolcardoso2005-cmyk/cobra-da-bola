// Quality gates for the permanent question bank. These check the batches
// that exist so far are well-formed and that loading them is safe to
// repeat -- NOT that the bank has reached 1000 questions yet (see
// server/src/questions/bank/PROGRESS.md for how many are done). A test
// asserting the full 1000/200-per-difficulty target belongs here only once
// that target is actually met.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { answersMatch } from "@cobra/shared";
import { batch001 } from "../src/questions/bank/batch-001.js";
import { batch002 } from "../src/questions/bank/batch-002.js";
import { batch003 } from "../src/questions/bank/batch-003.js";
import { batch004 } from "../src/questions/bank/batch-004.js";
import { batch005 } from "../src/questions/bank/batch-005.js";
import { batch006 } from "../src/questions/bank/batch-006.js";
import { batch007 } from "../src/questions/bank/batch-007.js";
import { batch008 } from "../src/questions/bank/batch-008.js";
import { loadQuestionBank, RETIRED_SLUGS } from "../src/questions/bank/index.js";
import { insertBankQuestion } from "../src/db/questions.js";
import { db } from "../src/db/db.js";

const FOUR_LEVELS = { facil: 25, moderado: 25, medio: 25, dificil: 25 };
const FIVE_LEVELS = { facil: 20, moderado: 20, medio: 20, dificil: 20, impossivel: 20 };
// Lotes 004-009 (e 010 com 16/16/16/16/36) completam 200 por nivel = 1.000.
const RAMP_LEVELS = { facil: 19, moderado: 19, medio: 19, dificil: 19, impossivel: 24 };

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

// Lotes a partir do 004: mesma checagem de formato e de nao repeticao
// contra todos os lotes anteriores. Para um lote novo, basta adicionar uma
// linha aqui.
const LATER_BATCHES: { label: string; batch: typeof batch001; expected: Record<string, number> }[] = [
  { label: "lote 004", batch: batch004, expected: RAMP_LEVELS },
  { label: "lote 005", batch: batch005, expected: RAMP_LEVELS },
  { label: "lote 006", batch: batch006, expected: RAMP_LEVELS },
  { label: "lote 007", batch: batch007, expected: RAMP_LEVELS },
  { label: "lote 008", batch: batch008, expected: RAMP_LEVELS },
];

for (const [i, { label, batch, expected }] of LATER_BATCHES.entries()) {
  describe(`banco de perguntas -- ${label}`, () => {
    it("tem 100 perguntas na distribuicao planejada, sem duplicadas internas", () => {
      checkBatchShape(batch, label, expected);
    });

    it("nao repete enunciado nem slug de nenhum lote anterior", () => {
      const previous = [batch001, batch002, batch003, ...LATER_BATCHES.slice(0, i).map((b) => b.batch)].flat();
      const prompts = new Set(previous.map((q) => q.prompt));
      const slugs = new Set(previous.map((q) => q.slug));
      for (const entry of batch) {
        assert.ok(!prompts.has(entry.prompt), `pergunta do ${label} repete lote anterior: ${entry.prompt}`);
        assert.ok(!slugs.has(entry.slug), `slug do ${label} repete lote anterior: ${entry.slug}`);
        assert.ok(entry.explanation?.trim(), `explicacao vazia em ${entry.slug}`);
      }
    });
  });
}

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

describe("banco de perguntas -- slugs aposentados", () => {
  it("remove do banco as perguntas aposentadas e e idempotente", () => {
    const sample = batch003[0];
    const { slug: _slug, ...q } = sample;
    for (const id of RETIRED_SLUGS) insertBankQuestion(id, { ...q, prompt: `antiga ${id}` });
    const count = () =>
      (db.prepare(`SELECT COUNT(*) AS n FROM questions WHERE id IN (${RETIRED_SLUGS.map(() => "?").join(",")})`).get(...RETIRED_SLUGS) as { n: number }).n;
    assert.equal(count(), RETIRED_SLUGS.length);

    const first = loadQuestionBank();
    assert.equal(first.removed, RETIRED_SLUGS.length);
    assert.equal(count(), 0);

    const second = loadQuestionBank();
    assert.equal(second.removed, 0, "a segunda carga nao deveria remover nada");
  });

  it("nenhum lote reaproveita um slug aposentado", () => {
    const retired = new Set(RETIRED_SLUGS);
    for (const entry of [...batch001, ...batch002, ...batch003]) {
      assert.ok(!retired.has(entry.slug), `slug aposentado em uso: ${entry.slug}`);
    }
  });
});
