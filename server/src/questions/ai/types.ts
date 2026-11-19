import type { Difficulty, Question, QuestionCategory } from "@cobra/shared";

/** Raw shape requested from the model: same as Question minus the id
 * (assigned on insert) plus a mandatory source -- generated content without
 * a checkable source is never accepted, unlike hand-written bank entries. */
export interface GeneratedQuestionCandidate {
  category: QuestionCategory;
  difficulty: Difficulty;
  format: Question["format"];
  prompt: string;
  choices?: string[];
  correctAnswer: string;
  acceptedAnswers?: string[];
  explanation: string;
  sourceUrl: string;
  seasonRef?: string;
}

export type ValidationOutcome =
  | { ok: true }
  | { ok: false; reason: string };

export type DedupeVerdict =
  | { verdict: "unique" }
  | { verdict: "duplicate"; matchId: string; score: number }
  | { verdict: "needs_review"; matchId: string; score: number };
