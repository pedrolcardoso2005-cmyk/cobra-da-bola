// "Meu Historico" (Modo Solo): persists every graded/skipped answer the
// server itself judged (never a client-reported tally), so logging out and
// back in never loses it. A "partida" has no server-tracked lifecycle of
// its own -- the client just tags each answer with a sessionId it
// generates when the player presses Comecar/Reiniciar, purely to group
// rows for per-match stats; a forged sessionId can only mis-group a
// player's own already-correct rows, never fabricate a correct answer.
import { nanoid } from "nanoid";
import { db } from "./db.js";

export type SoloKind = "pergunta" | "carreira";
export type SoloResult = "correct" | "wrong" | "skipped";

/** Mirrors WIN_SCORE in web/src/pages/SoloView.tsx (the "Voce e o Cobra da
 * Bola!" threshold in the Perguntas tab) -- used only to label a past
 * match in the history list, never to compute live scoring. */
const CHAMPION_SCORE = 10;

export function recordSoloAnswer(params: { userId: string; kind: SoloKind; sessionId: string; result: SoloResult }): void {
  db.prepare(`INSERT INTO solo_answer_log (id, user_id, kind, session_id, result, at) VALUES (?, ?, ?, ?, ?, ?)`).run(
    nanoid(),
    params.userId,
    params.kind,
    params.sessionId,
    params.result,
    Date.now(),
  );
}

export interface SoloKindSummary {
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  /** 0-100, rounded to 1 decimal. Computed over graded answers only
   * (correct + wrong) -- a skipped answer was never judged, so it would
   * only dilute (never reflect) the accuracy ratio. 0 when nothing graded yet. */
  accuracy: number;
}

export interface SoloMatchSummary {
  sessionId: string;
  startedAt: number;
  correct: number;
  wrong: number;
  skipped: number;
  reachedChampion: boolean;
}

export interface SoloHistorySummary {
  perguntas: SoloKindSummary & { bestScore: number; matches: SoloMatchSummary[] };
  carreiras: SoloKindSummary;
}

function summarizeKind(userId: string, kind: SoloKind): SoloKindSummary {
  const row = db
    .prepare(
      `SELECT
         COUNT(*) AS total,
         SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END) AS correct,
         SUM(CASE WHEN result = 'wrong' THEN 1 ELSE 0 END) AS wrong,
         SUM(CASE WHEN result = 'skipped' THEN 1 ELSE 0 END) AS skipped
       FROM solo_answer_log WHERE user_id = ? AND kind = ?`,
    )
    .get(userId, kind) as { total: number; correct: number | null; wrong: number | null; skipped: number | null };
  const total = row.total ?? 0;
  const correct = row.correct ?? 0;
  const wrong = row.wrong ?? 0;
  const skipped = row.skipped ?? 0;
  const graded = correct + wrong;
  const accuracy = graded > 0 ? Math.round((correct / graded) * 1000) / 10 : 0;
  return { total, correct, wrong, skipped, accuracy };
}

function matchesForUser(userId: string, limit = 20): SoloMatchSummary[] {
  const rows = db
    .prepare(
      `SELECT session_id AS sessionId,
              MIN(at) AS startedAt,
              SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END) AS correct,
              SUM(CASE WHEN result = 'wrong' THEN 1 ELSE 0 END) AS wrong,
              SUM(CASE WHEN result = 'skipped' THEN 1 ELSE 0 END) AS skipped
       FROM solo_answer_log WHERE user_id = ? AND kind = 'pergunta'
       GROUP BY session_id ORDER BY startedAt DESC LIMIT ?`,
    )
    .all(userId, limit) as { sessionId: string; startedAt: number; correct: number; wrong: number; skipped: number }[];
  return rows.map((r) => ({ ...r, reachedChampion: r.correct >= CHAMPION_SCORE }));
}

export function getSoloHistorySummary(userId: string): SoloHistorySummary {
  const bestScoreRow = db
    .prepare(
      `SELECT MAX(correct) AS best FROM (
         SELECT SUM(CASE WHEN result = 'correct' THEN 1 ELSE 0 END) AS correct
         FROM solo_answer_log WHERE user_id = ? AND kind = 'pergunta' GROUP BY session_id
       )`,
    )
    .get(userId) as { best: number | null };

  return {
    perguntas: { ...summarizeKind(userId, "pergunta"), bestScore: bestScoreRow.best ?? 0, matches: matchesForUser(userId) },
    carreiras: summarizeKind(userId, "carreira"),
  };
}
