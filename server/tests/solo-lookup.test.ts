// Unit tests for the two DB helpers the solo-mode routes rely on to judge
// an answer server-side without ever sending the correct answer to the
// client beforehand (getApprovedQuestionById / getApprovedCareerById).
// Isolated temp SQLite file -- see ai-pipeline.test.ts for why a *static*
// import of db-touching modules would silently fall back to the real dev
// database instead of this one; dynamic import after setting DB_PATH
// sidesteps that.
import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import os from "node:os";

const dbPath = `${os.tmpdir()}/cobra-solo-lookup-test-${process.pid}-${Date.now()}.db`;
process.env.DB_PATH = dbPath;

const { insertQuestion, insertCareerQuestion, getApprovedQuestionById, getApprovedCareerById } = await import("../src/db/questions.js");
const { db } = await import("../src/db/db.js");

after(() => {
  db.close();
  try {
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${dbPath}${suffix}`, { force: true });
  } catch {
    // best-effort, see ai-pipeline.test.ts
  }
});

describe("getApprovedQuestionById", () => {
  it("retorna a pergunta completa (com correctAnswer) quando aprovada", () => {
    const q = insertQuestion({
      category: "copa_do_mundo",
      difficulty: "facil",
      format: "aberta",
      prompt: "Pergunta de teste para o modo solo",
      correctAnswer: "Resposta certa",
      acceptedAnswers: ["resposta certa alternativa"],
    });
    const found = getApprovedQuestionById(q.id);
    assert.ok(found);
    assert.equal(found!.correctAnswer, "Resposta certa");
  });

  it("retorna null para um id inexistente", () => {
    assert.equal(getApprovedQuestionById("id-que-nao-existe"), null);
  });

  it("retorna null para uma pergunta rejeitada (nao deve vazar para o modo solo)", () => {
    const q = insertQuestion({
      category: "clubes",
      difficulty: "medio",
      format: "aberta",
      prompt: "Pergunta que vai ser rejeitada no teste",
      correctAnswer: "X",
    });
    db.prepare("UPDATE questions SET status = 'rejected' WHERE id = ?").run(q.id);
    assert.equal(getApprovedQuestionById(q.id), null);
  });
});

describe("getApprovedCareerById", () => {
  it("retorna a carreira completa (com playerName) quando aprovada", () => {
    const c = insertCareerQuestion({ clubs: ["Clube 1", "Clube 2"], playerName: "Jogador Teste Solo", theme: "brasileiros", difficulty: "facil" });
    const found = getApprovedCareerById(c.id);
    assert.ok(found);
    assert.equal(found!.playerName, "Jogador Teste Solo");
  });

  it("retorna null para um id inexistente", () => {
    assert.equal(getApprovedCareerById("id-que-nao-existe"), null);
  });
});
