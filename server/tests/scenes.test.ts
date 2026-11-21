// Fase 6 ("programa de TV"): phase1Lineup/careerLineup/bracketDuel (shared/src/scenes.ts)
// sao os dados puros que os cenarios visuais do telao usam para saber
// exatamente quem desenhar. Exigencia explicita do usuario: nenhuma
// composicao pode inventar um personagem, omitir um participante real, ou
// quebrar para nenhuma quantidade valida (2 a 12). Cobre n=2..12.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { PlayerRef, Question, CareerQuestion } from "@cobra/shared";
import { phase1Lineup, careerLineup, bracketDuel } from "@cobra/shared";
import { applyAction, eligibleBuzzers } from "../src/game/engine.js";
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
  return { id, category: "aleatorio", difficulty: "facil", format: "aberta", prompt: "Pergunta?", correctAnswer: "resposta" };
}

function mkCareer(id = "c1"): CareerQuestion {
  return { id, clubs: ["Clube A", "Clube B", "Clube C"], playerName: "Jogador X" };
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

function winPhase1For(state: any, teamId: "A" | "B") {
  const teamIds = state.teams.find((t: any) => t.id === teamId).playerIds as string[];
  for (let i = 0; i < 10; i++) {
    state = applyAction(state, { type: "RELEASE_PHASE1_QUESTION", question: mkQuestion(`q${teamId}${i}`), now: Date.now() });
    state = applyAction(state, { type: "ARM_BUTTONS", now: Date.now(), durationSeconds: 10 });
    const rep = eligibleBuzzers(state).find((id: string) => teamIds.includes(id))!;
    state = applyAction(state, { type: "PLAYER_BUZZ", playerId: rep, now: Date.now(), totalWords: 10 });
    state = applyAction(state, { type: "HOST_JUDGE", playerId: rep, correct: true, now: Date.now() });
    if (i < 9 && state.phase === "phase1") state = applyAction(state, { type: "ADVANCE_PHASE1_QUESTION" });
  }
  return state;
}

describe("phase1Lineup -- n=2 e n=3 nunca tem fase 1 (a cena nao se aplica, nunca aparece quebrada)", () => {
  it("n=2 vai direto para a final -- phase1Lineup e null", () => {
    let state = freshMatch(2);
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    assert.equal(state.phase, "final");
    assert.equal(phase1Lineup(state), null);
  });

  it("n=3 vai direto para a carreira -- phase1Lineup e null", () => {
    let state = freshMatch(3);
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    assert.equal(state.phase, "career");
    assert.equal(phase1Lineup(state), null);
  });
});

describe("phase1Lineup -- equipes e representante da vez reais (n=4)", () => {
  it("reflete exatamente os 2v2 reais, representante da vez = rotationIndex 0", () => {
    let state = freshMatch(4);
    state = applyAction(state, { type: "SET_TEAMS", assignments: { "0": "A", "1": "A", "2": "B", "3": "B" } });
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    const lineup = phase1Lineup(state)!;
    assert.deepEqual(lineup.teamA.map((p) => p.id), ["0", "1"]);
    assert.deepEqual(lineup.teamB.map((p) => p.id), ["2", "3"]);
    assert.equal(lineup.onDeckAId, "0");
    assert.equal(lineup.onDeckBId, "2");
  });
});

describe("phase1Lineup -- tamanho das equipes bate com planForParticipantCount, nunca inventa/omite (n=4..12)", () => {
  for (const n of [4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    it(`n=${n}: todos os ${n} jogadores aparecem exatamente uma vez, divididos nas 2 equipes`, () => {
      let state = freshMatch(n);
      state = applyAction(state, { type: "START_MATCH", now: Date.now() });
      const lineup = phase1Lineup(state);
      assert.ok(lineup, `phase1Lineup nao deveria ser null para n=${n}`);
      const allIds = [...lineup!.teamA, ...lineup!.teamB].map((p) => p.id);
      const expectedIds = Array.from({ length: n }, (_, i) => String(i));
      assert.deepEqual(allIds.slice().sort(), expectedIds.slice().sort());
      assert.equal(new Set(allIds).size, n, "nenhum jogador duplicado");
      assert.ok(lineup!.teamA.length > 0 && lineup!.teamB.length > 0, "nenhuma equipe fica vazia");
      assert.ok(lineup!.onDeckAId && lineup!.teamA.some((p) => p.id === lineup!.onDeckAId));
      assert.ok(lineup!.onDeckBId && lineup!.teamB.some((p) => p.id === lineup!.onDeckBId));
    });
  }
});

describe("careerLineup -- cohort reflete exatamente os participantes reais, nunca inventa", () => {
  it("n=3: cohort direto de 3, ninguem classificado ou excluido ainda", () => {
    let state = freshMatch(3);
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    const lineup = careerLineup(state)!;
    assert.deepEqual(lineup.stillCompeting.map((p) => p.id).sort(), ["0", "1", "2"]);
    assert.deepEqual(lineup.classified, []);
    assert.deepEqual(lineup.excludedThisRound, []);
  });

  it("cohort de 3 vindo da fase 1 (n=5, equipe de 3 vence) -- a cena da fase 1 some depois que ela termina", () => {
    let state = freshMatch(5);
    state = applyAction(state, { type: "SET_TEAMS", assignments: { "0": "A", "1": "A", "2": "A", "3": "B", "4": "B" } });
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    state = winPhase1For(state, "A");
    assert.equal(state.phase, "career");
    const lineup = careerLineup(state)!;
    assert.deepEqual(lineup.stillCompeting.map((p) => p.id).sort(), ["0", "1", "2"]);
    assert.equal(phase1Lineup(state), null);
  });

  it("cohort de 4 vindo da fase 1 (n=8, equipe de 4 vence)", () => {
    let state = freshMatch(8);
    state = applyAction(state, {
      type: "SET_TEAMS",
      assignments: { "0": "A", "1": "A", "2": "A", "3": "A", "4": "B", "5": "B", "6": "B", "7": "B" },
    });
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    state = winPhase1For(state, "A");
    assert.equal(state.phase, "career");
    const lineup = careerLineup(state)!;
    assert.deepEqual(lineup.stillCompeting.map((p) => p.id).sort(), ["0", "1", "2", "3"]);
  });

  it("distingue classificado e excluido-nesta-rodada corretamente", () => {
    let state = freshMatch(3);
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    state = applyAction(state, { type: "RELEASE_CAREER_QUESTION", careerQuestion: mkCareer("c1") });
    state = applyAction(state, { type: "PLAYER_BUZZ", playerId: "0", now: Date.now(), totalWords: 10 });
    state = applyAction(state, { type: "HOST_JUDGE", playerId: "0", correct: true, now: Date.now() });
    state = applyAction(state, { type: "RELEASE_CAREER_QUESTION", careerQuestion: mkCareer("c2") });
    state = applyAction(state, { type: "PLAYER_BUZZ", playerId: "1", now: Date.now(), totalWords: 10 });
    state = applyAction(state, { type: "HOST_JUDGE", playerId: "1", correct: false, now: Date.now() });
    const lineup = careerLineup(state)!;
    assert.deepEqual(lineup.classified.map((p) => p.id), ["0"]);
    assert.deepEqual(lineup.excludedThisRound.map((p) => p.id), ["1"]);
    assert.deepEqual(lineup.stillCompeting.map((p) => p.id), ["2"]);
  });
});

describe("bracketDuel -- mostra so os 2 jogadores do confronto ATIVO, nunca eliminados nem de outro confronto", () => {
  it("final (n=2): os 2 jogadores reais, placar 0x0 no inicio, sem semifinal", () => {
    let state = freshMatch(2);
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    const duel = bracketDuel(state, "final")!;
    assert.deepEqual([duel.playerA.id, duel.playerB.id].sort(), ["0", "1"]);
    assert.equal(duel.scoreA, 0);
    assert.equal(duel.scoreB, 0);
    assert.equal(bracketDuel(state, "semifinal"), null);
  });

  it("semifinal (n=9): so os 2 do confronto ativo -- nao os 2 esperando a outra semifinal, nem o eliminado", () => {
    let state = freshMatch(9);
    state = applyAction(state, {
      type: "SET_TEAMS",
      assignments: { "0": "A", "1": "A", "2": "A", "3": "A", "4": "A", "5": "B", "6": "B", "7": "B", "8": "B" },
    });
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    state = winPhase1For(state, "A");
    for (const pid of ["0", "1", "2", "3"]) {
      state = applyAction(state, { type: "RELEASE_CAREER_QUESTION", careerQuestion: mkCareer(`c-${pid}`) });
      state = applyAction(state, { type: "PLAYER_BUZZ", playerId: pid, now: Date.now(), totalWords: 10 });
      state = applyAction(state, { type: "HOST_JUDGE", playerId: pid, correct: true, now: Date.now() });
    }
    assert.equal(state.phase, "semifinal");
    const duel = bracketDuel(state, "semifinal")!;
    assert.deepEqual([duel.playerA.id, duel.playerB.id].sort(), ["0", "3"]);
    assert.equal(bracketDuel(state, "final"), null);
  });
});
