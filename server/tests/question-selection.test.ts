// Fase pos-6 ("por que as perguntas repetem / perguntas pendentes entrando
// no jogo"): pickRandomQuestion e a selecao de verdade usada tanto pelo
// multiplayer quanto pelo Modo Solo. A investigacao ja tinha confirmado por
// leitura que ele so olha status='approved' e respeita excludeIds, mas isso
// nunca tinha um teste direto -- este arquivo fecha essa lacuna.
import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import os from "node:os";

const dbPath = `${os.tmpdir()}/cobra-question-selection-test-${process.pid}-${Date.now()}.db`;
process.env.DB_PATH = dbPath;

const { insertQuestion, pickRandomQuestion } = await import("../src/db/questions.js");
const { db } = await import("../src/db/db.js");

after(() => {
  db.close();
  try {
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${dbPath}${suffix}`, { force: true });
  } catch {
    // best-effort, see ai-pipeline.test.ts
  }
});

function mkApproved(prompt: string, overrides: Partial<Parameters<typeof insertQuestion>[0]> = {}) {
  return insertQuestion({
    category: "clubes",
    difficulty: "facil",
    format: "aberta",
    prompt,
    correctAnswer: "Resposta",
    ...overrides,
  });
}

describe("pickRandomQuestion -- perguntas pendentes/rejeitadas nunca entram na partida", () => {
  it("uma pergunta pending_review nunca e selecionada, mesmo batendo categoria e dificuldade", () => {
    const pending = mkApproved("Pergunta que vai virar pendente de revisao, unica o bastante.");
    db.prepare("UPDATE questions SET status = 'pending_review' WHERE id = ?").run(pending.id);

    for (let i = 0; i < 30; i++) {
      const picked = pickRandomQuestion({ categories: ["clubes"], difficulties: ["facil"], excludeIds: [] });
      assert.notEqual(picked?.id, pending.id, "uma pergunta pending_review foi selecionada para a partida");
    }
  });

  it("uma pergunta rejected nunca e selecionada", () => {
    const rejected = mkApproved("Pergunta que vai ser rejeitada, unica o bastante para passar na validacao.");
    db.prepare("UPDATE questions SET status = 'rejected' WHERE id = ?").run(rejected.id);

    for (let i = 0; i < 30; i++) {
      const picked = pickRandomQuestion({ categories: ["clubes"], difficulties: ["facil"], excludeIds: [] });
      assert.notEqual(picked?.id, rejected.id, "uma pergunta rejected foi selecionada para a partida");
    }
  });
});

describe("pickRandomQuestion -- exclusao e variedade", () => {
  it("excludeIds e sempre respeitado -- a mesma pergunta nunca repete dentro de uma sequencia de selecoes", () => {
    const ids = [
      mkApproved("Pergunta variedade 1, unica o bastante para passar na validacao.").id,
      mkApproved("Pergunta variedade 2, unica o bastante para passar na validacao.").id,
      mkApproved("Pergunta variedade 3, unica o bastante para passar na validacao.").id,
    ];
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      const picked = pickRandomQuestion({ categories: ["clubes"], difficulties: ["facil"], excludeIds: seen });
      assert.ok(picked, `deveria ter encontrado uma pergunta na rodada ${i}`);
      assert.ok(!seen.includes(picked!.id), "selecionou uma pergunta ja excluida");
      seen.push(picked!.id);
    }
    assert.deepEqual(seen.sort(), ids.sort(), "deveria ter passado pelas 3 perguntas, sem repetir nenhuma");
  });

  it("retorna null (nunca reaproveita uma pergunta ja excluida) quando o pool se esgota", () => {
    const only = mkApproved("Unica pergunta deste bucket isolado, unica o bastante.", { category: "concacaf", difficulty: "impossivel" });
    const picked = pickRandomQuestion({ categories: ["concacaf"], difficulties: ["impossivel"], excludeIds: [only.id] });
    assert.equal(picked, null);
  });

  it("filtra por dificuldade -- nunca devolve uma pergunta de outra dificuldade", () => {
    mkApproved("Pergunta facil de um bucket so para este teste, unica.", { category: "jogadores", difficulty: "facil" });
    const impossivel = mkApproved("Pergunta impossivel do mesmo bucket para este teste, unica.", { category: "jogadores", difficulty: "impossivel" });
    for (let i = 0; i < 20; i++) {
      const picked = pickRandomQuestion({ categories: ["jogadores"], difficulties: ["impossivel"], excludeIds: [] });
      assert.equal(picked?.id, impossivel.id);
    }
  });

  it('categoria "aleatorio" (ou lista vazia) ignora o filtro de categoria, mas nunca a dificuldade', () => {
    mkApproved("Pergunta de clubes para o teste de categoria aleatoria, unica.", { category: "clubes", difficulty: "medio" });
    mkApproved("Pergunta de selecoes para o teste de categoria aleatoria, unica.", { category: "selecoes", difficulty: "medio" });
    mkApproved("Pergunta de clubes com outra dificuldade, nao deveria aparecer aqui.", { category: "clubes", difficulty: "facil" });

    const categoriesSeen = new Set<string>();
    for (let i = 0; i < 40; i++) {
      const picked = pickRandomQuestion({ categories: ["aleatorio"], difficulties: ["medio"], excludeIds: [] });
      assert.ok(picked);
      assert.equal(picked!.difficulty, "medio");
      categoriesSeen.add(picked!.category);
    }
    assert.ok(categoriesSeen.has("clubes") && categoriesSeen.has("selecoes"), "deveria ter sorteado as duas categorias ao longo de 40 tentativas");
  });

  it("a selecao nao e sempre a mesma pergunta quando ha varias disponiveis (sem seed fixa)", () => {
    mkApproved("Pergunta aleatoriedade 1, unica o bastante para passar na validacao.", { category: "libertadores", difficulty: "moderado" });
    mkApproved("Pergunta aleatoriedade 2, unica o bastante para passar na validacao.", { category: "libertadores", difficulty: "moderado" });
    mkApproved("Pergunta aleatoriedade 3, unica o bastante para passar na validacao.", { category: "libertadores", difficulty: "moderado" });

    const picks = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const picked = pickRandomQuestion({ categories: ["libertadores"], difficulties: ["moderado"], excludeIds: [] });
      picks.add(picked!.id);
    }
    assert.ok(picks.size > 1, "30 selecoes seguidas sempre devolveram a mesma pergunta -- nao parece aleatorio de verdade");
  });
});
