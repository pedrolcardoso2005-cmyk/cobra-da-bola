// Fase 3 do pedido "programa de TV": pular uma pergunta no multiplayer (fase
// 1/semifinal/final) exige consentimento mutuo dos 2 representantes da
// rodada, so e oferecido antes de alguem apertar a campainha, e nunca
// trava a partida -- se um representante some (desconecta) com um pedido
// pendente do outro, o pulo e resolvido automaticamente. O Desafio das
// Carreiras nao entra aqui: o apresentador ja tem END_CAREER_ROUND para
// "ninguem soube".
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { PlayerRef, Question } from "@cobra/shared";
import { applyAction, activeBuzz, EngineError } from "../src/game/engine.js";
import { createInitialMatch } from "../src/game/match.js";

function mkPlayer(id: string): PlayerRef {
  return {
    id,
    userId: `u-${id}`,
    displayName: `Jogador ${id}`,
    avatarUrl: null,
    connected: true,
    teamId: null,
    eliminated: false,
    qualified: false,
    careerRank: null,
    correctAnswers: 0,
    wrongAnswers: 0,
  };
}

function mkQuestion(id = "q1"): Question {
  return { id, category: "aleatorio", difficulty: "facil", format: "aberta", prompt: "Pergunta de teste", correctAnswer: "resposta" };
}

function freshMatch(n: number) {
  let state = createInitialMatch({
    id: "m1",
    code: "ABCDE",
    hostUserId: "host",
    settings: { answerSeconds: 10, categories: [], difficulties: [], kind: "casual", targetCount: n },
  });
  for (let i = 0; i < n; i++) state = applyAction(state, { type: "JOIN_PLAYER", player: mkPlayer(String(i)) });
  return state;
}

/** n=4, teams balanced 2x2, phase1 armed with a question -- representatives
 * are always playerIds[rotationIndex] per team, i.e. "0" (equipe A) and
 * "2" (equipe B) at rotationIndex 0. */
function armedPhase1() {
  let state = freshMatch(4);
  state = applyAction(state, { type: "SET_TEAMS", assignments: { "0": "A", "1": "A", "2": "B", "3": "B" } });
  state = applyAction(state, { type: "START_MATCH", now: 0 });
  state = applyAction(state, { type: "RELEASE_PHASE1_QUESTION", question: mkQuestion(), now: 0 });
  state = applyAction(state, { type: "ARM_BUTTONS", now: 1000, durationSeconds: 10 });
  return state;
}

describe("pular pergunta por consentimento mutuo -- fase 1", () => {
  it("um unico pedido nao resolve nada -- so fica registrado, aguardando o outro representante", () => {
    let state = armedPhase1();
    state = applyAction(state, { type: "REQUEST_SKIP", playerId: "0" });
    assert.equal(state.lastAnswer, null);
    assert.deepEqual(activeBuzz(state)!.skipRequestedBy, ["0"]);
  });

  it("quando ambos representantes pedem, a pergunta e pulada sem pontos para ninguem", () => {
    let state = armedPhase1();
    state = applyAction(state, { type: "REQUEST_SKIP", playerId: "0" });
    state = applyAction(state, { type: "REQUEST_SKIP", playerId: "2" });
    assert.equal(state.lastAnswer!.skipped, true);
    assert.equal(state.lastAnswer!.pointsAwardedTo, null);
    // Fase 6: Lucas Tilt reage com humor ao pulo -- a dica de apresentacao
    // muda para "skipped", nunca fica "idle" nem herda a dica anterior.
    assert.deepEqual(state.presenterCue, { type: "skipped" });
    assert.equal(state.lastAnswer!.playerId, null);
    assert.equal(state.teams![0].score, 0);
    assert.equal(state.teams![1].score, 0);
    // a rodada de campainha fica limpa, pronta para a proxima pergunta
    assert.equal(activeBuzz(state)!.armed, false);
    assert.deepEqual(activeBuzz(state)!.skipRequestedBy, []);
  });

  it("pedir duas vezes pelo mesmo jogador nao conta como os dois concordando", () => {
    let state = armedPhase1();
    state = applyAction(state, { type: "REQUEST_SKIP", playerId: "0" });
    state = applyAction(state, { type: "REQUEST_SKIP", playerId: "0" });
    assert.equal(state.lastAnswer, null);
    assert.deepEqual(activeBuzz(state)!.skipRequestedBy, ["0"]);
  });

  it("um jogador que nao e representante desta rodada nao pode pedir para pular", () => {
    const state = armedPhase1();
    assert.throws(() => applyAction(state, { type: "REQUEST_SKIP", playerId: "1" }), EngineError);
  });

  it("nao e possivel pedir para pular depois que alguem ja apertou a campainha", () => {
    let state = armedPhase1();
    state = applyAction(state, { type: "PLAYER_BUZZ", playerId: "0", now: 1000, totalWords: 5 });
    assert.throws(() => applyAction(state, { type: "REQUEST_SKIP", playerId: "2" }), EngineError);
  });

  it("nao e possivel pedir para pular antes de a pergunta estar sendo apresentada", () => {
    let state = freshMatch(4);
    state = applyAction(state, { type: "SET_TEAMS", assignments: { "0": "A", "1": "A", "2": "B", "3": "B" } });
    state = applyAction(state, { type: "START_MATCH", now: 0 });
    state = applyAction(state, { type: "RELEASE_PHASE1_QUESTION", question: mkQuestion(), now: 0 });
    // Pergunta liberada, mas botoes ainda nao armados -- sem questionOpenedAt.
    assert.throws(() => applyAction(state, { type: "REQUEST_SKIP", playerId: "0" }), EngineError);
  });

  it("se o outro representante desconectar com um pedido pendente, o pulo resolve sozinho (nunca trava a partida)", () => {
    let state = armedPhase1();
    state = applyAction(state, { type: "REQUEST_SKIP", playerId: "0" });
    assert.equal(state.lastAnswer, null);
    state = applyAction(state, { type: "SET_CONNECTED", playerId: "2", connected: false });
    assert.equal(state.lastAnswer!.skipped, true);
    assert.equal(state.lastAnswer!.pointsAwardedTo, null);
  });

  it("desconectar sem nenhum pedido pendente nao pula nada", () => {
    let state = armedPhase1();
    state = applyAction(state, { type: "SET_CONNECTED", playerId: "2", connected: false });
    assert.equal(state.lastAnswer, null);
  });
});

describe("pular pergunta por consentimento mutuo -- final/semifinal (bracketRound, mesmo codigo da fase 1)", () => {
  it("funciona igual no bracket (n=2 vai direto para a final)", () => {
    let state = freshMatch(2);
    state = applyAction(state, { type: "START_MATCH", now: 0 });
    assert.equal(state.phase, "final");
    state = applyAction(state, { type: "RELEASE_BRACKET_QUESTION", question: mkQuestion(), now: 0 });
    state = applyAction(state, { type: "ARM_BUTTONS", now: 1000, durationSeconds: 10 });
    state = applyAction(state, { type: "REQUEST_SKIP", playerId: "0" });
    assert.equal(state.lastAnswer, null);
    state = applyAction(state, { type: "REQUEST_SKIP", playerId: "1" });
    assert.equal(state.lastAnswer!.skipped, true);
    assert.equal(state.final!.scoreA, 0);
    assert.equal(state.final!.scoreB, 0);
  });
});
