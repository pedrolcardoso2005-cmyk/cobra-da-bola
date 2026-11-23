// Partida inteira sem apresentador: o servidor confere as respostas,
// cronometra, revela clubes e libera a proxima pergunta sozinho, ate sair
// um campeao. Os tempos do fluxo sao encurtados para o teste rodar rapido.
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import os from "node:os";

process.env.DB_PATH = `${os.tmpdir()}/cobra-auto-flow-test-${process.pid}-${Date.now()}.db`;

const { seedDatabase } = await import("../src/questions/seed.js");
const { loadQuestionBank } = await import("../src/questions/bank/index.js");
const { loadCareerBank } = await import("../src/questions/careers/index.js");
const { roomManager } = await import("../src/game/rooms.js");
const { eligibleBuzzers, activeBuzz } = await import("../src/game/engine.js");

const RM = roomManager.constructor as any;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

before(() => {
  seedDatabase();
  loadQuestionBank();
  loadCareerBank();
  RM.RESULT_MS = 5;
  RM.CLUB_REVEAL_MS = 5;
  RM.CAREER_LAST_CLUB_MS = 5;
});

function settings(targetCount: number) {
  return { answerSeconds: 5 as const, categories: ["aleatorio" as const], difficulties: [], careerThemes: ["aleatorio" as const], kind: "ranked" as const, targetCount };
}

function join(code: string, n: number) {
  for (let i = 0; i < n; i++) {
    roomManager.addOrReconnectPlayer(code, { userId: `${code}-u${i}`, displayName: `Jogador ${i}`, avatarUrl: null });
  }
}

/** Joga respondendo sempre certo com o primeiro jogador habilitado. */
async function playToChampion(code: string, opts: { wrongEvery?: number } = {}) {
  const room = roomManager.getRoom(code)!;
  let answers = 0;
  for (let step = 0; step < 2000 && room.match.phase !== "champion"; step++) {
    const m = room.match;
    const buzz = activeBuzz(m);
    const qid = m.phase1?.currentQuestionId ?? m.bracketRound?.currentQuestionId ?? m.career?.careerQuestionId ?? null;
    if (!buzz || !buzz.armed || buzz.firstPlayerId || !qid || (m.lastAnswer && !m.lastAnswer.skipped && m.lastAnswer.pointsAwardedTo === null)) {
      await sleep(2);
      continue;
    }
    if (m.lastAnswer && (m.lastAnswer.skipped || (m.phase !== "career" && m.lastAnswer.pointsAwardedTo !== null))) {
      await sleep(2); // mostrando o resultado; o servidor avanca sozinho
      continue;
    }
    const player = eligibleBuzzers(m)[0];
    if (!player) {
      await sleep(2);
      continue;
    }
    roomManager.playerBuzz(code, player);
    const truth = m.phase === "career" ? room.careerCache.get(qid)!.playerName : room.questionCache.get(qid)!.correctAnswer;
    answers++;
    const wrong = opts.wrongEvery && answers % opts.wrongEvery === 0;
    roomManager.submitAnswer(code, player, wrong ? "resposta errada qualquer" : truth);
  }
  return answers;
}

describe("fluxo automatico (sem apresentador)", () => {
  it("2 equipes de 2: fase 1 ate a final e campeao, so com o servidor conferindo", async () => {
    const room = roomManager.createRoom("criador-4", settings(4));
    join(room.match.code, 4);
    assert.equal(room.match.phase, "phase1");
    await playToChampion(room.match.code, { wrongEvery: 4 });
    assert.equal(room.match.phase, "champion");
    assert.ok(room.match.winnerUserId);
  });

  it("3 jogadores: carreira (com erro no meio) e final", async () => {
    const room = roomManager.createRoom("criador-3", settings(3));
    join(room.match.code, 3);
    assert.equal(room.match.phase, "career");
    await playToChampion(room.match.code, { wrongEvery: 3 });
    assert.equal(room.match.phase, "champion");
  });

  it("resposta errada e conferida sozinha e mostra a resposta certa", async () => {
    const room = roomManager.createRoom("criador-2", settings(2));
    join(room.match.code, 2);
    const m = room.match;
    const qid = m.bracketRound?.currentQuestionId ?? m.phase1?.currentQuestionId;
    assert.ok(qid, "primeira pergunta ja liberada");
    const truth = room.questionCache.get(qid!)!.correctAnswer;
    const player = eligibleBuzzers(m)[0];
    roomManager.playerBuzz(room.match.code, player);
    assert.ok(room.match.timer?.endsAt, "cronometro correndo para quem apertou");
    roomManager.submitAnswer(room.match.code, player, "xyz errado");
    assert.equal(room.match.lastAnswer?.correct, false);
    assert.notEqual(room.match.lastAnswer?.pointsAwardedTo, null, "ja foi julgada, sem apresentador");
    assert.equal(room.revealedAnswer, truth);
    await sleep(40);
    assert.notEqual(room.match.bracketRound?.currentQuestionId ?? room.match.phase1?.currentQuestionId, qid, "passou para a proxima pergunta sozinho");
  });

  it("ninguem aperta: a pergunta encerra sozinha e mostra a resposta", async () => {
    const room = roomManager.createRoom("criador-idle", settings(2));
    join(room.match.code, 2);
    assert.ok(room.flowTimeout, "tem um encerramento agendado para quando ninguem aperta");
  });

  it("partida casual: espera o anfitriao, equilibra equipes, remove jogador e conta 10 s", async () => {
    const { teamsProblem } = await import("../src/game/rooms.js");
    RM.COUNTDOWN_MS = 30;
    const room = roomManager.createRoom("dono", { ...settings(5), kind: "casual" as const });
    const code = room.match.code;
    roomManager.addOrReconnectPlayer(code, { userId: "dono", displayName: "Dono", avatarUrl: null });
    for (let i = 1; i <= 4; i++) roomManager.addOrReconnectPlayer(code, { userId: `c${i}`, displayName: `C${i}`, avatarUrl: null });
    assert.equal(room.match.phase, "lobby", "casual nao comeca sozinha");
    const a = room.match.players.filter((p) => p.teamId === "A").length;
    const b = room.match.players.filter((p) => p.teamId === "B").length;
    assert.deepEqual([a, b], [3, 2], "quem entra cai na equipe menor");
    // desequilibra: todo mundo na A
    roomManager.setTeams(code, Object.fromEntries(room.match.players.map((p) => [p.id, "A" as const])));
    assert.ok(teamsProblem(room.match));
    assert.throws(() => roomManager.startWithCountdown(code));
    // remove um jogador e equilibra 2 x 2
    const kicked = room.match.players.find((p) => p.userId === "c4")!;
    roomManager.kickPlayer(code, kicked.id, "dono");
    assert.equal(room.match.players.length, 4);
    assert.throws(() => roomManager.kickPlayer(code, room.match.players[0].id, "dono"), "nao remove a si mesmo");
    const ps = room.match.players;
    roomManager.setTeams(code, { [ps[0].id]: "A", [ps[1].id]: "A", [ps[2].id]: "B", [ps[3].id]: "B" });
    roomManager.startWithCountdown(code);
    assert.ok(room.match.countdownEndsAt, "contagem regressiva para todos");
    assert.equal(room.match.phase, "lobby");
    await sleep(80);
    assert.equal(room.match.phase, "phase1");
    assert.deepEqual(room.match.teams!.map((t) => t.playerIds.length), [2, 2]);
    assert.ok(room.match.phase1?.currentQuestionId);
  });
});
