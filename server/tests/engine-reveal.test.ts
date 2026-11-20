// Fase 1 do pedido "programa de TV": a revelacao palavra-por-palavra da
// pergunta deixa de confiar no relogio de cada navegador. O servidor
// calcula, no instante exato do primeiro PLAYER_BUZZ, quantas palavras
// estavam visiveis (a partir de buzz.questionOpenedAt, carimbado em
// ARM_BUTTONS/RELEASE_CAREER_QUESTION/REVEAL_NEXT_CLUB) e grava isso em
// buzz.frozenWordCount -- esse e o unico valor que todo cliente deve
// exibir, nunca um calculo local. REVEAL_WORD_MS vem de @cobra/shared
// para o teste usar exatamente o mesmo ritmo que o reducer usa.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { REVEAL_WORD_MS, type PlayerRef, type Question } from "@cobra/shared";
import { applyAction, activeBuzz } from "../src/game/engine.js";
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

describe("congelamento da revelacao -- fase 1 (phase1.buzz)", () => {
  it("frozenWordCount e null antes de qualquer aperto", () => {
    let state = freshMatch(4);
    state = applyAction(state, { type: "SET_TEAMS", assignments: { "0": "A", "1": "A", "2": "B", "3": "B" } });
    state = applyAction(state, { type: "START_MATCH", now: 0 });
    state = applyAction(state, { type: "RELEASE_PHASE1_QUESTION", question: mkQuestion(), now: 0 });
    state = applyAction(state, { type: "ARM_BUTTONS", now: 1000, durationSeconds: 10 });
    assert.equal(activeBuzz(state)!.frozenWordCount, null);
  });

  it("aperto imediato (0ms depois de armar) congela em 1 palavra", () => {
    let state = freshMatch(4);
    state = applyAction(state, { type: "SET_TEAMS", assignments: { "0": "A", "1": "A", "2": "B", "3": "B" } });
    state = applyAction(state, { type: "START_MATCH", now: 0 });
    state = applyAction(state, { type: "RELEASE_PHASE1_QUESTION", question: mkQuestion(), now: 0 });
    state = applyAction(state, { type: "ARM_BUTTONS", now: 1000, durationSeconds: 10 });
    state = applyAction(state, { type: "PLAYER_BUZZ", playerId: "0", now: 1000, totalWords: 10 });
    assert.equal(activeBuzz(state)!.frozenWordCount, 1);
  });

  it("aperto apos N*REVEAL_WORD_MS congela exatamente na palavra correspondente", () => {
    let state = freshMatch(4);
    state = applyAction(state, { type: "SET_TEAMS", assignments: { "0": "A", "1": "A", "2": "B", "3": "B" } });
    state = applyAction(state, { type: "START_MATCH", now: 0 });
    state = applyAction(state, { type: "RELEASE_PHASE1_QUESTION", question: mkQuestion(), now: 0 });
    state = applyAction(state, { type: "ARM_BUTTONS", now: 1000, durationSeconds: 10 });
    // 2 palavras inteiras se passaram (2*REVEAL_WORD_MS) mais uma fracao da 3a.
    const buzzAt = 1000 + 2 * REVEAL_WORD_MS + 50;
    state = applyAction(state, { type: "PLAYER_BUZZ", playerId: "0", now: buzzAt, totalWords: 10 });
    assert.equal(activeBuzz(state)!.frozenWordCount, 3);
  });

  it("nunca excede o total de palavras, mesmo com a pergunta ja totalmente revelada", () => {
    let state = freshMatch(4);
    state = applyAction(state, { type: "SET_TEAMS", assignments: { "0": "A", "1": "A", "2": "B", "3": "B" } });
    state = applyAction(state, { type: "START_MATCH", now: 0 });
    state = applyAction(state, { type: "RELEASE_PHASE1_QUESTION", question: mkQuestion(), now: 0 });
    state = applyAction(state, { type: "ARM_BUTTONS", now: 1000, durationSeconds: 10 });
    state = applyAction(state, { type: "PLAYER_BUZZ", playerId: "0", now: 1000 + 50 * REVEAL_WORD_MS, totalWords: 5 });
    assert.equal(activeBuzz(state)!.frozenWordCount, 5);
  });

  it("o segundo jogador a apertar nao altera o trecho congelado do primeiro", () => {
    let state = freshMatch(4);
    state = applyAction(state, { type: "SET_TEAMS", assignments: { "0": "A", "1": "A", "2": "B", "3": "B" } });
    state = applyAction(state, { type: "START_MATCH", now: 0 });
    state = applyAction(state, { type: "RELEASE_PHASE1_QUESTION", question: mkQuestion(), now: 0 });
    state = applyAction(state, { type: "ARM_BUTTONS", now: 1000, durationSeconds: 10 });
    state = applyAction(state, { type: "PLAYER_BUZZ", playerId: "0", now: 1000 + 1 * REVEAL_WORD_MS, totalWords: 10 });
    const frozenAfterFirst = activeBuzz(state)!.frozenWordCount;
    assert.equal(frozenAfterFirst, 2);

    // "2" (equipe B) aperta bem depois -- so deve ser bloqueado, nunca mudar o trecho.
    state = applyAction(state, { type: "PLAYER_BUZZ", playerId: "2", now: 1000 + 9 * REVEAL_WORD_MS, totalWords: 10 });
    assert.equal(activeBuzz(state)!.frozenWordCount, frozenAfterFirst);
    assert.ok(activeBuzz(state)!.lockedOut.includes("2"));
    assert.equal(activeBuzz(state)!.firstPlayerId, "0");
  });
});

describe("congelamento da revelacao -- final/semifinal (bracketRound.buzz, mesmo codigo que a fase 1)", () => {
  it("congela no trecho exato tambem no bracket (n=2 vai direto para a final)", () => {
    let state = freshMatch(2);
    state = applyAction(state, { type: "START_MATCH", now: 0 });
    assert.equal(state.phase, "final");
    state = applyAction(state, { type: "RELEASE_BRACKET_QUESTION", question: mkQuestion(), now: 0 });
    state = applyAction(state, { type: "ARM_BUTTONS", now: 1000, durationSeconds: 10 });
    state = applyAction(state, { type: "PLAYER_BUZZ", playerId: "0", now: 1000 + 4 * REVEAL_WORD_MS, totalWords: 10 });
    assert.equal(activeBuzz(state)!.frozenWordCount, 5);
  });
});
