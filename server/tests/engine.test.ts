import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { PlayerRef, Question, CareerQuestion } from "@cobra/shared";
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
  for (let i = 0; i < n; i++) {
    state = applyAction(state, { type: "JOIN_PLAYER", player: mkPlayer(String(i)) });
  }
  return state;
}

describe("n=2: single 1v1 stage goes straight to final", () => {
  it("whoever reaches 10 becomes champion", () => {
    let state = freshMatch(2);
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    assert.equal(state.phase, "final");
    assert.ok(state.final);

    for (let i = 0; i < 10; i++) {
      state = applyAction(state, { type: "RELEASE_BRACKET_QUESTION", question: mkQuestion(`q${i}`), now: Date.now() });
      state = applyAction(state, { type: "ARM_BUTTONS", now: Date.now(), durationSeconds: 10 });
      state = applyAction(state, { type: "PLAYER_BUZZ", playerId: "0", now: Date.now(), totalWords: 10 });
      state = applyAction(state, { type: "HOST_JUDGE", playerId: "0", correct: true, now: Date.now() });
      if (i < 9) state = applyAction(state, { type: "ADVANCE_BRACKET_QUESTION" });
    }
    assert.equal(state.phase, "champion");
    assert.equal(state.winnerUserId, "u-0");
    assert.equal(state.runnerUpUserId, "u-1");
  });
});

describe("n=3: straight to career, top 2 go to final", () => {
  it("first two correct answers classify; third is eliminated", () => {
    let state = freshMatch(3);
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    assert.equal(state.phase, "career");
    assert.deepEqual(eligibleBuzzers(state).sort(), ["0", "1", "2"]);

    state = applyAction(state, { type: "RELEASE_CAREER_QUESTION", careerQuestion: mkCareer("c1") });
    state = applyAction(state, { type: "PLAYER_BUZZ", playerId: "0", now: Date.now(), totalWords: 10 });
    state = applyAction(state, { type: "HOST_JUDGE", playerId: "0", correct: true, now: Date.now() });
    assert.equal(state.phase, "career"); // only 1 of 2 slots filled

    state = applyAction(state, { type: "RELEASE_CAREER_QUESTION", careerQuestion: mkCareer("c2") });
    state = applyAction(state, { type: "PLAYER_BUZZ", playerId: "1", now: Date.now(), totalWords: 10 });
    state = applyAction(state, { type: "HOST_JUDGE", playerId: "1", correct: true, now: Date.now() });

    assert.equal(state.phase, "final");
    assert.ok(state.final);
    assert.deepEqual([state.final!.playerAId, state.final!.playerBId].sort(), ["0", "1"]);
    assert.equal(state.players.find((p) => p.id === "2")!.eliminated, true);
  });

  it("a wrong answer only excludes the player for that career round, not the next", () => {
    let state = freshMatch(3);
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    state = applyAction(state, { type: "RELEASE_CAREER_QUESTION", careerQuestion: mkCareer("c1") });
    state = applyAction(state, { type: "PLAYER_BUZZ", playerId: "0", now: Date.now(), totalWords: 10 });
    state = applyAction(state, { type: "HOST_JUDGE", playerId: "0", correct: false, now: Date.now() });
    assert.ok(eligibleBuzzers(state).includes("1"));
    assert.ok(!eligibleBuzzers(state).includes("0"));

    state = applyAction(state, { type: "RELEASE_CAREER_QUESTION", careerQuestion: mkCareer("c2") });
    assert.ok(eligibleBuzzers(state).includes("0"), "player 0 should be eligible again on a new career question");
  });
});

describe("n=4: two teams of 2, winner skips career and goes straight to the final", () => {
  it("team battle to 10 then direct final with the winning team's two players", () => {
    let state = freshMatch(4);
    state = applyAction(state, { type: "SET_TEAMS", assignments: { "0": "A", "1": "A", "2": "B", "3": "B" } });
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    assert.equal(state.phase, "phase1");
    assert.equal(state.teams!.find((t) => t.id === "A")!.playerIds.length, 2);

    // Team A answers correctly 10 times in a row. The rotation alternates
    // which of team A's two players is the live rep each question, so we
    // must buzz with whichever one is currently eligible.
    for (let i = 0; i < 10; i++) {
      state = applyAction(state, { type: "RELEASE_PHASE1_QUESTION", question: mkQuestion(`q${i}`), now: Date.now() });
      state = applyAction(state, { type: "ARM_BUTTONS", now: Date.now(), durationSeconds: 10 });
      const teamARep = eligibleBuzzers(state).find((id) => ["0", "1"].includes(id))!;
      state = applyAction(state, { type: "PLAYER_BUZZ", playerId: teamARep, now: Date.now(), totalWords: 10 });
      state = applyAction(state, { type: "HOST_JUDGE", playerId: teamARep, correct: true, now: Date.now() });
      if (i < 9) state = applyAction(state, { type: "ADVANCE_PHASE1_QUESTION" });
    }

    assert.equal(state.phase, "final");
    assert.deepEqual([state.final!.playerAId, state.final!.playerBId].sort(), ["0", "1"]);
    assert.equal(state.players.find((p) => p.id === "2")!.eliminated, true);
    assert.equal(state.players.find((p) => p.id === "3")!.eliminated, true);
  });
});

describe("n=8: teams of 4, career seeds semifinals 1v4 and 2v3", () => {
  it("routes the full bracket to champion", () => {
    let state = freshMatch(8);
    state = applyAction(state, {
      type: "SET_TEAMS",
      assignments: { "0": "A", "1": "A", "2": "A", "3": "A", "4": "B", "5": "B", "6": "B", "7": "B" },
    });
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    assert.equal(state.teams!.find((t) => t.id === "A")!.playerIds.length, 4);

    for (let i = 0; i < 10; i++) {
      state = applyAction(state, { type: "RELEASE_PHASE1_QUESTION", question: mkQuestion(`p1-${i}`), now: Date.now() });
      state = applyAction(state, { type: "ARM_BUTTONS", now: Date.now(), durationSeconds: 10 });
      const teamARep = eligibleBuzzers(state).find((id) => ["0", "1", "2", "3"].includes(id))!;
      state = applyAction(state, { type: "PLAYER_BUZZ", playerId: teamARep, now: Date.now(), totalWords: 10 });
      state = applyAction(state, { type: "HOST_JUDGE", playerId: teamARep, correct: true, now: Date.now() });
      if (i < 9) state = applyAction(state, { type: "ADVANCE_PHASE1_QUESTION" });
    }
    assert.equal(state.phase, "career");

    const careerOrder = ["0", "1", "2", "3"];
    for (let i = 0; i < careerOrder.length; i++) {
      state = applyAction(state, { type: "RELEASE_CAREER_QUESTION", careerQuestion: mkCareer(`c${i}`) });
      state = applyAction(state, { type: "PLAYER_BUZZ", playerId: careerOrder[i], now: Date.now(), totalWords: 10 });
      state = applyAction(state, { type: "HOST_JUDGE", playerId: careerOrder[i], correct: true, now: Date.now() });
    }

    assert.equal(state.phase, "semifinal");
    assert.equal(state.semifinal!.length, 2);
    // 1st vs 4th, 2nd vs 3rd
    assert.deepEqual([state.semifinal![0].playerAId, state.semifinal![0].playerBId], ["0", "3"]);
    assert.deepEqual([state.semifinal![1].playerAId, state.semifinal![1].playerBId], ["1", "2"]);

    // Resolve semifinal 1: player 0 wins
    for (let i = 0; i < 10; i++) {
      state = applyAction(state, { type: "RELEASE_BRACKET_QUESTION", question: mkQuestion(`sf1-${i}`), now: Date.now() });
      state = applyAction(state, { type: "ARM_BUTTONS", now: Date.now(), durationSeconds: 10 });
      state = applyAction(state, { type: "PLAYER_BUZZ", playerId: "0", now: Date.now(), totalWords: 10 });
      state = applyAction(state, { type: "HOST_JUDGE", playerId: "0", correct: true, now: Date.now() });
      if (i < 9) state = applyAction(state, { type: "ADVANCE_BRACKET_QUESTION" });
    }
    assert.equal(state.semifinalActiveIndex, 1);

    // Resolve semifinal 2: player 1 wins
    for (let i = 0; i < 10; i++) {
      state = applyAction(state, { type: "RELEASE_BRACKET_QUESTION", question: mkQuestion(`sf2-${i}`), now: Date.now() });
      state = applyAction(state, { type: "ARM_BUTTONS", now: Date.now(), durationSeconds: 10 });
      state = applyAction(state, { type: "PLAYER_BUZZ", playerId: "1", now: Date.now(), totalWords: 10 });
      state = applyAction(state, { type: "HOST_JUDGE", playerId: "1", correct: true, now: Date.now() });
      if (i < 9) state = applyAction(state, { type: "ADVANCE_BRACKET_QUESTION" });
    }
    assert.equal(state.phase, "final");
    assert.deepEqual([state.final!.playerAId, state.final!.playerBId], ["0", "1"]);

    for (let i = 0; i < 10; i++) {
      state = applyAction(state, { type: "RELEASE_BRACKET_QUESTION", question: mkQuestion(`f-${i}`), now: Date.now() });
      state = applyAction(state, { type: "ARM_BUTTONS", now: Date.now(), durationSeconds: 10 });
      state = applyAction(state, { type: "PLAYER_BUZZ", playerId: "0", now: Date.now(), totalWords: 10 });
      state = applyAction(state, { type: "HOST_JUDGE", playerId: "0", correct: true, now: Date.now() });
      if (i < 9) state = applyAction(state, { type: "ADVANCE_BRACKET_QUESTION" });
    }
    assert.equal(state.phase, "champion");
    assert.equal(state.winnerUserId, "u-0");
  });
});

describe("timeout awards the point to the opponent", () => {
  it("phase1: timeout on the responder scores the other team", () => {
    let state = freshMatch(4);
    state = applyAction(state, { type: "SET_TEAMS", assignments: { "0": "A", "1": "A", "2": "B", "3": "B" } });
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    state = applyAction(state, { type: "RELEASE_PHASE1_QUESTION", question: mkQuestion(), now: Date.now() });
    state = applyAction(state, { type: "ARM_BUTTONS", now: Date.now(), durationSeconds: 10 });
    state = applyAction(state, { type: "PLAYER_BUZZ", playerId: "0", now: Date.now(), totalWords: 10 });
    state = applyAction(state, { type: "TIMEOUT", now: Date.now() });
    assert.equal(state.teams!.find((t) => t.id === "B")!.score, 1);
    assert.equal(state.teams!.find((t) => t.id === "A")!.score, 0);
    assert.equal(state.lastAnswer!.timedOut, true);
  });
});

describe("rotation", () => {
  it("advances to the next player per team after each question", () => {
    let state = freshMatch(4);
    state = applyAction(state, { type: "SET_TEAMS", assignments: { "0": "A", "1": "A", "2": "B", "3": "B" } });
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    assert.deepEqual(eligibleBuzzers(state).sort(), ["0", "2"]);
    state = applyAction(state, { type: "ADVANCE_PHASE1_QUESTION" });
    assert.deepEqual(eligibleBuzzers(state).sort(), ["1", "3"]);
    state = applyAction(state, { type: "ADVANCE_PHASE1_QUESTION" });
    assert.deepEqual(eligibleBuzzers(state).sort(), ["0", "2"]);
  });
});

function winPhase1For(state: any, teamId: "A" | "B") {
  const teamIds = state.teams.find((t: any) => t.id === teamId).playerIds as string[];
  for (let i = 0; i < 10; i++) {
    state = applyAction(state, { type: "RELEASE_PHASE1_QUESTION", question: mkQuestion(`q${teamId}${i}`), now: Date.now() });
    state = applyAction(state, { type: "ARM_BUTTONS", now: Date.now(), durationSeconds: 10 });
    const rep = eligibleBuzzers(state).find((id) => teamIds.includes(id))!;
    state = applyAction(state, { type: "PLAYER_BUZZ", playerId: rep, now: Date.now(), totalWords: 10 });
    state = applyAction(state, { type: "HOST_JUDGE", playerId: rep, correct: true, now: Date.now() });
    if (i < 9 && state.phase === "phase1") state = applyAction(state, { type: "ADVANCE_PHASE1_QUESTION" });
  }
  return state;
}

describe("n=5: teams of 3 vs 2", () => {
  it("team of 2 wins -> both go directly to the final, no career", () => {
    let state = freshMatch(5);
    state = applyAction(state, { type: "SET_TEAMS", assignments: { "0": "A", "1": "A", "2": "A", "3": "B", "4": "B" } });
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    assert.equal(state.teams!.find((t) => t.id === "B")!.playerIds.length, 2);
    state = winPhase1For(state, "B");
    assert.equal(state.phase, "final");
    assert.deepEqual([state.final!.playerAId, state.final!.playerBId].sort(), ["3", "4"]);
    assert.equal(state.career, null);
  });

  it("team of 3 wins -> career stage, top 2 go to the final", () => {
    let state = freshMatch(5);
    state = applyAction(state, { type: "SET_TEAMS", assignments: { "0": "A", "1": "A", "2": "A", "3": "B", "4": "B" } });
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    state = winPhase1For(state, "A");
    assert.equal(state.phase, "career");
    assert.deepEqual(eligibleBuzzers(state).sort(), ["0", "1", "2"]);
  });
});

describe("n=9: teams of 5 vs 4", () => {
  it("team of 5 wins -> career with 1 elimination, 4 seeded to semifinals", () => {
    let state = freshMatch(9);
    state = applyAction(state, {
      type: "SET_TEAMS",
      assignments: { "0": "A", "1": "A", "2": "A", "3": "A", "4": "A", "5": "B", "6": "B", "7": "B", "8": "B" },
    });
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    assert.equal(state.teams!.find((t) => t.id === "A")!.playerIds.length, 5);
    state = winPhase1For(state, "A");
    assert.equal(state.phase, "career");

    const order = ["0", "1", "2", "3"]; // player "4" never answers -> gets eliminated
    for (const pid of order) {
      state = applyAction(state, { type: "RELEASE_CAREER_QUESTION", careerQuestion: mkCareer(`c-${pid}`) });
      state = applyAction(state, { type: "PLAYER_BUZZ", playerId: pid, now: Date.now(), totalWords: 10 });
      state = applyAction(state, { type: "HOST_JUDGE", playerId: pid, correct: true, now: Date.now() });
    }
    assert.equal(state.phase, "semifinal");
    assert.equal(state.players.find((p) => p.id === "4")!.eliminated, true);
    assert.deepEqual([state.semifinal![0].playerAId, state.semifinal![0].playerBId], ["0", "3"]);
    assert.deepEqual([state.semifinal![1].playerAId, state.semifinal![1].playerBId], ["1", "2"]);
  });

  it("team of 4 wins -> all 4 advance to semifinals directly (no elimination)", () => {
    let state = freshMatch(9);
    state = applyAction(state, {
      type: "SET_TEAMS",
      assignments: { "0": "A", "1": "A", "2": "A", "3": "A", "4": "A", "5": "B", "6": "B", "7": "B", "8": "B" },
    });
    state = applyAction(state, { type: "START_MATCH", now: Date.now() });
    state = winPhase1For(state, "B");
    assert.equal(state.phase, "career");
    assert.deepEqual(eligibleBuzzers(state).sort(), ["5", "6", "7", "8"]);

    for (const pid of ["5", "6", "7", "8"]) {
      state = applyAction(state, { type: "RELEASE_CAREER_QUESTION", careerQuestion: mkCareer(`c-${pid}`) });
      state = applyAction(state, { type: "PLAYER_BUZZ", playerId: pid, now: Date.now(), totalWords: 10 });
      state = applyAction(state, { type: "HOST_JUDGE", playerId: pid, correct: true, now: Date.now() });
    }
    assert.equal(state.phase, "semifinal");
    for (const pid of ["5", "6", "7", "8"]) {
      assert.equal(state.players.find((p) => p.id === pid)!.eliminated, false);
    }
  });
});
