import type { AnswerSeconds, CareerQuestion, PlayerRef, Question, TeamKey } from "@cobra/shared";

export type EngineAction =
  | { type: "JOIN_PLAYER"; player: PlayerRef }
  | { type: "LEAVE_PLAYER"; playerId: string }
  | { type: "SET_CONNECTED"; playerId: string; connected: boolean }
  | { type: "SET_TEAMS"; assignments: Record<string, TeamKey> }
  | { type: "START_MATCH"; now: number }
  | { type: "RELEASE_PHASE1_QUESTION"; question: Question; now: number }
  | { type: "RELEASE_BRACKET_QUESTION"; question: Question; now: number }
  | { type: "RELEASE_CAREER_QUESTION"; careerQuestion: CareerQuestion }
  | { type: "ARM_BUTTONS"; now: number; durationSeconds: AnswerSeconds }
  | { type: "REVEAL_NEXT_CLUB" }
  | { type: "PLAYER_BUZZ"; playerId: string; now: number }
  | { type: "SUBMIT_ANSWER"; playerId: string; answer: string }
  | { type: "TIMEOUT"; now: number }
  | { type: "HOST_JUDGE"; playerId: string; correct: boolean; now: number }
  | { type: "ADVANCE_PHASE1_QUESTION" }
  | { type: "ADVANCE_BRACKET_QUESTION" }
  | { type: "END_CAREER_ROUND" }
  | { type: "ADJUST_SCORE"; teamOrPlayerId: string; delta: number }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "END_MATCH_FORCE"; now: number };
