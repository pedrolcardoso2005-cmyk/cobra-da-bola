// Fase 4 do pedido "programa de TV": "Meu Historico" do Modo Solo. Cada
// resposta/pulo ja julgado pelo servidor grava uma linha; os agregados
// (total, acertos, erros, puladas, % de acerto, melhor pontuacao, historico
// de partidas) sao recalculados puramente a partir dessas linhas -- nunca
// de um placar que o cliente informa. Isolated temp SQLite file, mesmo
// idioma de import dinamico apos DB_PATH que solo-lookup.test.ts usa.
import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import os from "node:os";

const dbPath = `${os.tmpdir()}/cobra-solo-history-test-${process.pid}-${Date.now()}.db`;
process.env.DB_PATH = dbPath;

const { recordSoloAnswer, getSoloHistorySummary } = await import("../src/db/soloHistory.js");
const { createUser } = await import("../src/db/users.js");
const { db } = await import("../src/db/db.js");

after(() => {
  db.close();
  try {
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${dbPath}${suffix}`, { force: true });
  } catch {
    // best-effort, see ai-pipeline.test.ts
  }
});

let counter = 0;
function mkUser() {
  counter += 1;
  return createUser({ id: `u${counter}`, email: `solo-history-${counter}@teste.local`, passwordHash: "x", displayName: `Jogador ${counter}` }).id;
}

describe("Meu Historico Solo -- agregados de Perguntas", () => {
  it("conta total/acertos/erros/puladas corretamente", () => {
    const userId = mkUser();
    recordSoloAnswer({ userId, kind: "pergunta", sessionId: "s1", result: "correct" });
    recordSoloAnswer({ userId, kind: "pergunta", sessionId: "s1", result: "wrong" });
    recordSoloAnswer({ userId, kind: "pergunta", sessionId: "s1", result: "skipped" });
    const { perguntas } = getSoloHistorySummary(userId);
    assert.equal(perguntas.total, 3);
    assert.equal(perguntas.correct, 1);
    assert.equal(perguntas.wrong, 1);
    assert.equal(perguntas.skipped, 1);
  });

  it("% de acerto considera so respostas julgadas (correct+wrong), nunca as puladas", () => {
    const userId = mkUser();
    recordSoloAnswer({ userId, kind: "pergunta", sessionId: "s1", result: "correct" });
    recordSoloAnswer({ userId, kind: "pergunta", sessionId: "s1", result: "correct" });
    recordSoloAnswer({ userId, kind: "pergunta", sessionId: "s1", result: "wrong" });
    recordSoloAnswer({ userId, kind: "pergunta", sessionId: "s1", result: "skipped" });
    recordSoloAnswer({ userId, kind: "pergunta", sessionId: "s1", result: "skipped" });
    const { perguntas } = getSoloHistorySummary(userId);
    // 2 acertos em 3 julgadas (2 corretas + 1 errada) = 66.7%, puladas fora da conta.
    assert.equal(perguntas.accuracy, 66.7);
  });

  it("% de acerto e 0 quando nada foi julgado ainda (so puladas, ou nada)", () => {
    const userId = mkUser();
    recordSoloAnswer({ userId, kind: "pergunta", sessionId: "s1", result: "skipped" });
    const { perguntas } = getSoloHistorySummary(userId);
    assert.equal(perguntas.accuracy, 0);
  });

  it("melhor pontuacao e o maior numero de acertos entre as partidas (sessoes), nao a soma de todas", () => {
    const userId = mkUser();
    for (let i = 0; i < 3; i++) recordSoloAnswer({ userId, kind: "pergunta", sessionId: "partida-fraca", result: "correct" });
    for (let i = 0; i < 7; i++) recordSoloAnswer({ userId, kind: "pergunta", sessionId: "partida-boa", result: "correct" });
    recordSoloAnswer({ userId, kind: "pergunta", sessionId: "partida-boa", result: "wrong" });
    const { perguntas } = getSoloHistorySummary(userId);
    assert.equal(perguntas.bestScore, 7);
  });

  it("historico de partidas agrupa por sessionId, mais recente primeiro, com reachedChampion a partir de 10 acertos", () => {
    const userId = mkUser();
    for (let i = 0; i < 3; i++) recordSoloAnswer({ userId, kind: "pergunta", sessionId: "primeira", result: "correct" });
    for (let i = 0; i < 10; i++) recordSoloAnswer({ userId, kind: "pergunta", sessionId: "segunda-campea", result: "correct" });
    const { perguntas } = getSoloHistorySummary(userId);
    assert.equal(perguntas.matches.length, 2);
    assert.equal(perguntas.matches[0].sessionId, "segunda-campea");
    assert.equal(perguntas.matches[0].reachedChampion, true);
    assert.equal(perguntas.matches[1].sessionId, "primeira");
    assert.equal(perguntas.matches[1].reachedChampion, false);
  });
});

describe("Meu Historico Solo -- isolamento", () => {
  it("perguntas e desafio das carreiras tem agregados independentes", () => {
    const userId = mkUser();
    recordSoloAnswer({ userId, kind: "pergunta", sessionId: "s1", result: "correct" });
    recordSoloAnswer({ userId, kind: "carreira", sessionId: "c1", result: "wrong" });
    recordSoloAnswer({ userId, kind: "carreira", sessionId: "c1", result: "skipped" });
    const { perguntas, carreiras } = getSoloHistorySummary(userId);
    assert.equal(perguntas.total, 1);
    assert.equal(carreiras.total, 2);
    assert.equal(carreiras.wrong, 1);
    assert.equal(carreiras.skipped, 1);
  });

  it("o historico de um jogador nunca aparece no de outro", () => {
    const userA = mkUser();
    const userB = mkUser();
    for (let i = 0; i < 5; i++) recordSoloAnswer({ userId: userA, kind: "pergunta", sessionId: "a1", result: "correct" });
    recordSoloAnswer({ userId: userB, kind: "pergunta", sessionId: "b1", result: "wrong" });
    const summaryA = getSoloHistorySummary(userA);
    const summaryB = getSoloHistorySummary(userB);
    assert.equal(summaryA.perguntas.correct, 5);
    assert.equal(summaryA.perguntas.wrong, 0);
    assert.equal(summaryB.perguntas.correct, 0);
    assert.equal(summaryB.perguntas.wrong, 1);
  });

  it("um usuario sem nenhuma partida ainda recebe agregados zerados, nao um erro", () => {
    const userId = mkUser();
    const { perguntas, carreiras } = getSoloHistorySummary(userId);
    assert.deepEqual(perguntas, { total: 0, correct: 0, wrong: 0, skipped: 0, accuracy: 0, bestScore: 0, matches: [] });
    assert.deepEqual(carreiras, { total: 0, correct: 0, wrong: 0, skipped: 0, accuracy: 0 });
  });
});
