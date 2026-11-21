import type { CareerQuestion, CareerTheme, Difficulty, Question, QuestionCategory, QuestionFormat } from "@cobra/shared";
import { nanoid } from "nanoid";
import { db } from "./db.js";

export type QuestionStatus = "approved" | "pending_review" | "rejected";

interface QuestionRow {
  id: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  format: QuestionFormat;
  prompt: string;
  choices_json: string | null;
  correct_answer: string;
  accepted_answers_json: string | null;
  created_by_user_id: string | null;
  created_at: number;
  explanation: string | null;
  source_url: string | null;
  season_ref: string | null;
  status: QuestionStatus;
  generated_by: string | null;
  review_reason: string | null;
}

/** Admin/review-facing view of a question row: the public Question shape
 * plus the bookkeeping fields the game itself never needs to see. */
export interface QuestionWithStatus extends Question {
  status: QuestionStatus;
  generatedBy: string | null;
  createdAt: number;
  reviewReason: string | null;
}

function rowToQuestionWithStatus(r: QuestionRow): QuestionWithStatus {
  return {
    ...rowToQuestion(r),
    status: r.status,
    generatedBy: r.generated_by ?? null,
    createdAt: r.created_at,
    reviewReason: r.review_reason ?? null,
  };
}

function rowToQuestion(r: QuestionRow): Question {
  return {
    id: r.id,
    category: r.category,
    difficulty: r.difficulty,
    format: r.format,
    prompt: r.prompt,
    choices: r.choices_json ? JSON.parse(r.choices_json) : undefined,
    correctAnswer: r.correct_answer,
    acceptedAnswers: r.accepted_answers_json ? JSON.parse(r.accepted_answers_json) : undefined,
    createdByUserId: r.created_by_user_id ?? undefined,
    explanation: r.explanation ?? undefined,
    sourceUrl: r.source_url ?? undefined,
    seasonRef: r.season_ref ?? undefined,
  };
}

export function insertQuestion(q: Omit<Question, "id">, createdByUserId?: string): Question {
  const id = nanoid();
  db.prepare(
    `INSERT INTO questions (id, category, difficulty, format, prompt, choices_json, correct_answer, accepted_answers_json, created_by_user_id, created_at, explanation, source_url, season_ref)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    q.category,
    q.difficulty,
    q.format,
    q.prompt,
    q.choices ? JSON.stringify(q.choices) : null,
    q.correctAnswer,
    q.acceptedAnswers ? JSON.stringify(q.acceptedAnswers) : null,
    createdByUserId ?? null,
    Date.now(),
    q.explanation ?? null,
    q.sourceUrl ?? null,
    q.seasonRef ?? null,
  );
  return rowToQuestion(db.prepare("SELECT * FROM questions WHERE id = ?").get(id) as unknown as QuestionRow);
}

/**
 * Inserts a question bank entry under a caller-chosen stable id (instead of
 * a random nanoid) and ignores it if that id already exists. This is what
 * lets the bank be loaded in repeatable batches across sessions without
 * ever duplicating a question that was already inserted.
 */
export function insertBankQuestion(id: string, q: Omit<Question, "id">): "inserted" | "skipped" {
  const existing = db.prepare("SELECT 1 FROM questions WHERE id = ?").get(id);
  if (existing) return "skipped";
  db.prepare(
    `INSERT INTO questions (id, category, difficulty, format, prompt, choices_json, correct_answer, accepted_answers_json, created_by_user_id, created_at, explanation, source_url, season_ref)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)`,
  ).run(
    id,
    q.category,
    q.difficulty,
    q.format,
    q.prompt,
    q.choices ? JSON.stringify(q.choices) : null,
    q.correctAnswer,
    q.acceptedAnswers ? JSON.stringify(q.acceptedAnswers) : null,
    Date.now(),
    q.explanation ?? null,
    q.sourceUrl ?? null,
    q.seasonRef ?? null,
  );
  return "inserted";
}

/**
 * Deletes the given question ids, ignoring any that don't exist, and
 * returns how many rows were actually removed. Used by the bank loader to
 * retire entries that were replaced. Embeddings go with them via
 * ON DELETE CASCADE.
 */
export function deleteQuestionsByIds(ids: readonly string[]): number {
  if (ids.length === 0) return 0;
  const stmt = db.prepare("DELETE FROM questions WHERE id = ?");
  let removed = 0;
  db.exec("BEGIN");
  try {
    for (const id of ids) removed += Number(stmt.run(id).changes);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
  return removed;
}

export function listQuestions(
  filter: { category?: QuestionCategory; difficulty?: Difficulty; status?: QuestionStatus } = {},
): Question[] {
  // No status filter given -> only "approved" (the pre-existing behavior,
  // from before "status" existed and every row was implicitly usable).
  // Callers that need pending/rejected rows (the AI review queue) pass
  // `status` explicitly.
  let sql = "SELECT * FROM questions WHERE status = ?";
  const params: string[] = [filter.status ?? "approved"];
  if (filter.category && filter.category !== "aleatorio") {
    sql += " AND category = ?";
    params.push(filter.category);
  }
  if (filter.difficulty) {
    sql += " AND difficulty = ?";
    params.push(filter.difficulty);
  }
  const rows = db.prepare(sql).all(...params) as unknown as QuestionRow[];
  return rows.map(rowToQuestion);
}

/** Questions generated by the AI pipeline that are awaiting admin review. */
export function listPendingQuestions(): QuestionWithStatus[] {
  const rows = db.prepare("SELECT * FROM questions WHERE status = 'pending_review' ORDER BY created_at ASC").all() as unknown as QuestionRow[];
  return rows.map(rowToQuestionWithStatus);
}

/** Inserts an AI-generated question as "pending_review": never visible to
 * pickRandomQuestion/the game until an admin approves it. `reviewReason`
 * records why (e.g. "fonte_inacessivel", "dedupe_semantica:score=0.91")
 * so the admin report can explain every pendency instead of just counting
 * them -- see pipeline.ts, the only caller that decides this reason. */
export function insertPendingQuestion(q: Omit<Question, "id">, generatedBy: string, reviewReason: string): QuestionWithStatus {
  const id = nanoid();
  db.prepare(
    `INSERT INTO questions (id, category, difficulty, format, prompt, choices_json, correct_answer, accepted_answers_json, created_by_user_id, created_at, explanation, source_url, season_ref, status, generated_by, review_reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, 'pending_review', ?, ?)`,
  ).run(
    id,
    q.category,
    q.difficulty,
    q.format,
    q.prompt,
    q.choices ? JSON.stringify(q.choices) : null,
    q.correctAnswer,
    q.acceptedAnswers ? JSON.stringify(q.acceptedAnswers) : null,
    Date.now(),
    q.explanation ?? null,
    q.sourceUrl ?? null,
    q.seasonRef ?? null,
    generatedBy,
    reviewReason,
  );
  return rowToQuestionWithStatus(db.prepare("SELECT * FROM questions WHERE id = ?").get(id) as unknown as QuestionRow);
}

/** Inserts an AI-generated question directly as "approved" -- used only
 * when AUTO_APPROVE is on and every automated check already passed. Same
 * shape as insertPendingQuestion, different starting status, so the
 * `generated_by` audit trail is kept either way. */
export function insertApprovedAiQuestion(q: Omit<Question, "id">, generatedBy: string): QuestionWithStatus {
  const id = nanoid();
  db.prepare(
    `INSERT INTO questions (id, category, difficulty, format, prompt, choices_json, correct_answer, accepted_answers_json, created_by_user_id, created_at, explanation, source_url, season_ref, status, generated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, 'approved', ?)`,
  ).run(
    id,
    q.category,
    q.difficulty,
    q.format,
    q.prompt,
    q.choices ? JSON.stringify(q.choices) : null,
    q.correctAnswer,
    q.acceptedAnswers ? JSON.stringify(q.acceptedAnswers) : null,
    Date.now(),
    q.explanation ?? null,
    q.sourceUrl ?? null,
    q.seasonRef ?? null,
    generatedBy,
  );
  return rowToQuestionWithStatus(db.prepare("SELECT * FROM questions WHERE id = ?").get(id) as unknown as QuestionRow);
}

export function approveQuestion(id: string): void {
  const result = db.prepare("UPDATE questions SET status = 'approved' WHERE id = ? AND status = 'pending_review'").run(id);
  if (result.changes === 0) throw new Error("Pergunta nao encontrada ou ja revisada");
}

export function rejectQuestion(id: string): void {
  const result = db.prepare("UPDATE questions SET status = 'rejected' WHERE id = ? AND status = 'pending_review'").run(id);
  if (result.changes === 0) throw new Error("Pergunta nao encontrada ou ja revisada");
}

/** Counts of usable ("approved") questions per category x difficulty, for
 * the stock watcher to decide what needs topping up. */
/** Total rows ever produced by the AI pipeline (approved + pending +
 * rejected, any status) still in the database -- the single number that
 * answers "did AI-generated content survive the last restart/deploy?"
 * without needing to compare boot-to-boot by hand. Logged once at boot
 * (see index.ts) specifically so a silent SQLite reset (no persistent
 * volume -- see the persistence audit) shows up immediately in the
 * Railway logs instead of only being noticed later via /estoque. */
export function countAiGeneratedQuestions(): number {
  const row = db.prepare("SELECT COUNT(*) as n FROM questions WHERE generated_by IS NOT NULL").get() as { n: number };
  return row.n;
}

export function countApprovedByBucket(): { category: QuestionCategory; difficulty: Difficulty; count: number }[] {
  return db
    .prepare("SELECT category, difficulty, COUNT(*) as count FROM questions WHERE status = 'approved' GROUP BY category, difficulty")
    .all() as unknown as { category: QuestionCategory; difficulty: Difficulty; count: number }[];
}

/** Every normalized prompt currently in the bank (any status except
 * rejected), for the cheap textual-dedupe pass -- cross-checking new
 * candidates against drafts still pending review too, not just approved
 * ones, so two generation runs in a row don't both propose the same fact. */
export function listPromptsForDedupe(): { id: string; category: QuestionCategory; prompt: string; correctAnswer: string }[] {
  return db
    .prepare("SELECT id, category, prompt, correct_answer as correctAnswer FROM questions WHERE status != 'rejected'")
    .all() as unknown as { id: string; category: QuestionCategory; prompt: string; correctAnswer: string }[];
}

export interface StoredEmbedding {
  questionId: string;
  model: string;
  category: QuestionCategory;
  embedding: Float32Array;
}

export function saveQuestionEmbedding(questionId: string, model: string, embedding: Float32Array): void {
  db.prepare(
    `INSERT INTO question_embeddings (question_id, model, embedding, created_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(question_id) DO UPDATE SET model = excluded.model, embedding = excluded.embedding, created_at = excluded.created_at`,
  ).run(questionId, model, Buffer.from(embedding.buffer, embedding.byteOffset, embedding.byteLength), Date.now());
}

/** All stored embeddings for questions that are still usable or awaiting
 * review (never rejected ones), for the semantic-dedupe comparison pass. */
export function listEmbeddingsForDedupe(model: string): StoredEmbedding[] {
  const rows = db
    .prepare(
      `SELECT e.question_id as questionId, e.embedding as embedding, q.category as category
       FROM question_embeddings e
       JOIN questions q ON q.id = e.question_id
       WHERE e.model = ? AND q.status != 'rejected'`,
    )
    .all(model) as unknown as { questionId: string; embedding: Buffer; category: QuestionCategory }[];
  return rows.map((r) => ({
    questionId: r.questionId,
    model,
    category: r.category,
    embedding: new Float32Array(r.embedding.buffer, r.embedding.byteOffset, r.embedding.byteLength / 4),
  }));
}

export interface AiGenerationLogEntry {
  category: QuestionCategory;
  difficulty: Difficulty;
  requested: number;
  generated: number;
  rejectedValidation: number;
  rejectedDuplicate: number;
  flaggedForReview: number;
  autoApproved: number;
  model: string;
  error: string | null;
  startedAt: number;
  finishedAt: number;
  /** Token usage for the batch's Anthropic call(s), for cost monitoring.
   * null when the call never happened (e.g. missing API key) or the API
   * response carried no usage block. */
  inputTokens: number | null;
  outputTokens: number | null;
}

export function insertAiGenerationLog(entry: AiGenerationLogEntry): void {
  db.prepare(
    `INSERT INTO ai_generation_log (id, category, difficulty, requested, generated, rejected_validation, rejected_duplicate, flagged_for_review, auto_approved, model, error, started_at, finished_at, input_tokens, output_tokens)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    nanoid(),
    entry.category,
    entry.difficulty,
    entry.requested,
    entry.generated,
    entry.rejectedValidation,
    entry.rejectedDuplicate,
    entry.flaggedForReview,
    entry.autoApproved,
    entry.model,
    entry.error,
    entry.startedAt,
    entry.finishedAt,
    entry.inputTokens,
    entry.outputTokens,
  );
}

interface AiGenerationLogRow {
  id: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  requested: number;
  generated: number;
  rejected_validation: number;
  rejected_duplicate: number;
  flagged_for_review: number;
  auto_approved: number;
  model: string;
  error: string | null;
  started_at: number;
  finished_at: number;
  input_tokens: number | null;
  output_tokens: number | null;
}

/** Most recent generation batches, newest first -- the raw feed for the
 * admin report's "historico de geracao" and token/cost monitoring. */
export function listRecentGenerationLog(limit = 50): (AiGenerationLogEntry & { id: string })[] {
  const rows = db
    .prepare("SELECT * FROM ai_generation_log ORDER BY started_at DESC LIMIT ?")
    .all(limit) as unknown as AiGenerationLogRow[];
  return rows.map((r) => ({
    id: r.id,
    category: r.category,
    difficulty: r.difficulty,
    requested: r.requested,
    generated: r.generated,
    rejectedValidation: r.rejected_validation,
    rejectedDuplicate: r.rejected_duplicate,
    flaggedForReview: r.flagged_for_review,
    autoApproved: r.auto_approved,
    model: r.model,
    error: r.error,
    startedAt: r.started_at,
    finishedAt: r.finished_at,
    inputTokens: r.input_tokens,
    outputTokens: r.output_tokens,
  }));
}

/** True when the last `threshold` attempts at this exact bucket all failed
 * (non-null error), most recent first. Used as a per-bucket circuit
 * breaker (see stock.ts): a bucket repeatedly failing for a structural
 * reason (bad prompt calibration, a provider outage) should stop eating
 * the daily batch budget every single run until someone looks at it,
 * instead of retrying it forever. `threshold <= 0` always returns false
 * (breaker disabled). */
export function recentFailureStreak(category: QuestionCategory, difficulty: Difficulty, threshold: number): boolean {
  if (threshold <= 0) return false;
  const rows = db
    .prepare(
      "SELECT error FROM ai_generation_log WHERE category = ? AND difficulty = ? ORDER BY started_at DESC LIMIT ?",
    )
    .all(category, difficulty, threshold) as unknown as { error: string | null }[];
  return rows.length === threshold && rows.every((r) => r.error !== null);
}

/** Records that an approved question was actually served to a match (the
 * demand side of stock-watching -- see stock.ts). Fire-and-forget from the
 * caller's perspective: never called for career questions, which have
 * their own separate pool and aren't produced by the AI pipeline. */
export function insertQuestionConsumption(category: QuestionCategory, difficulty: Difficulty, questionId: string): void {
  db.prepare(
    "INSERT INTO question_consumption_log (id, category, difficulty, question_id, served_at) VALUES (?, ?, ?, ?, ?)",
  ).run(nanoid(), category, difficulty, questionId, Date.now());
}

/** How many questions each bucket has had served since `sinceTs` -- the
 * consumption-velocity signal stock.ts uses to prioritize replenishment by
 * actual demand, not just by raw deficit (see "prioridade de reposicao"
 * in stock.ts). */
export function countConsumptionSince(sinceTs: number): { category: QuestionCategory; difficulty: Difficulty; count: number }[] {
  return db
    .prepare(
      "SELECT category, difficulty, COUNT(*) as count FROM question_consumption_log WHERE served_at >= ? GROUP BY category, difficulty",
    )
    .all(sinceTs) as unknown as { category: QuestionCategory; difficulty: Difficulty; count: number }[];
}

export function pickRandomQuestion(opts: {
  categories: QuestionCategory[];
  difficulties: Difficulty[];
  excludeIds: string[];
}): Question | null {
  const wantsRandomCategory = opts.categories.length === 0 || opts.categories.includes("aleatorio");
  const all = listQuestions();
  const pool = all.filter((q) => {
    if (opts.excludeIds.includes(q.id)) return false;
    if (!wantsRandomCategory && !opts.categories.includes(q.category)) return false;
    if (opts.difficulties.length > 0 && !opts.difficulties.includes(q.difficulty)) return false;
    return true;
  });
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Single approved question by id -- used by solo mode to judge an answer
 * server-side (the client only ever sees the id + the public fields via
 * pickRandomQuestion/toPublicQuestion, never the correct answer). */
export function getApprovedQuestionById(id: string): Question | null {
  const row = db.prepare("SELECT * FROM questions WHERE id = ? AND status = 'approved'").get(id) as unknown as QuestionRow | undefined;
  return row ? rowToQuestion(row) : null;
}

export function updateQuestion(id: string, patch: Partial<Omit<Question, "id">>): void {
  const current = db.prepare("SELECT * FROM questions WHERE id = ?").get(id) as unknown as QuestionRow | undefined;
  if (!current) throw new Error("Pergunta nao encontrada");
  const merged = { ...rowToQuestion(current), ...patch };
  db.prepare(
    `UPDATE questions SET category=?, difficulty=?, format=?, prompt=?, choices_json=?, correct_answer=?, accepted_answers_json=? WHERE id=?`,
  ).run(
    merged.category,
    merged.difficulty,
    merged.format,
    merged.prompt,
    merged.choices ? JSON.stringify(merged.choices) : null,
    merged.correctAnswer,
    merged.acceptedAnswers ? JSON.stringify(merged.acceptedAnswers) : null,
    id,
  );
}

export function deleteQuestion(id: string): void {
  db.prepare("DELETE FROM questions WHERE id = ?").run(id);
}

interface CareerRow {
  id: string;
  clubs_json: string;
  player_name: string;
  accepted_answers_json: string | null;
  created_at: number;
  theme: CareerTheme | null;
  difficulty: Difficulty | null;
  source_url: string | null;
  season_ref: string | null;
  status: QuestionStatus;
}

function rowToCareer(r: CareerRow): CareerQuestion {
  return {
    id: r.id,
    clubs: JSON.parse(r.clubs_json),
    playerName: r.player_name,
    acceptedAnswers: r.accepted_answers_json ? JSON.parse(r.accepted_answers_json) : undefined,
    theme: r.theme ?? undefined,
    difficulty: r.difficulty ?? undefined,
    sourceUrl: r.source_url ?? undefined,
    seasonRef: r.season_ref ?? undefined,
  };
}

export function insertCareerQuestion(c: Omit<CareerQuestion, "id">): CareerQuestion {
  const id = nanoid();
  db.prepare(
    `INSERT INTO career_questions (id, clubs_json, player_name, accepted_answers_json, created_at, theme, difficulty, source_url, season_ref)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    JSON.stringify(c.clubs),
    c.playerName,
    c.acceptedAnswers ? JSON.stringify(c.acceptedAnswers) : null,
    Date.now(),
    c.theme ?? null,
    c.difficulty ?? null,
    c.sourceUrl ?? null,
    c.seasonRef ?? null,
  );
  return rowToCareer(db.prepare("SELECT * FROM career_questions WHERE id = ?").get(id) as unknown as CareerRow);
}

/** No status filter given -> only "approved", same convention as
 * listQuestions (every pre-existing row defaults to 'approved'). */
export function listCareerQuestions(filter: { status?: QuestionStatus } = {}): CareerQuestion[] {
  return (
    db.prepare("SELECT * FROM career_questions WHERE status = ?").all(filter.status ?? "approved") as unknown as CareerRow[]
  ).map(rowToCareer);
}

/** One-time backfill for rows inserted by an older version of the seed,
 * before theme/difficulty existed as columns: fills them in by player
 * name without ever overwriting a value already set (COALESCE), so an
 * admin's manual edit via the CRUD is never clobbered. Safe to call on
 * every boot -- a no-op once every row is already tagged. */
export function backfillCareerMetadata(playerName: string, theme: CareerTheme | undefined, difficulty: Difficulty | undefined): void {
  db.prepare("UPDATE career_questions SET theme = COALESCE(theme, ?), difficulty = COALESCE(difficulty, ?) WHERE player_name = ?").run(
    theme ?? null,
    difficulty ?? null,
    playerName,
  );
}

export function pickRandomCareerQuestion(opts: {
  themes: CareerTheme[];
  difficulties: Difficulty[];
  excludeIds: string[];
}): CareerQuestion | null {
  const wantsRandomTheme = opts.themes.length === 0 || opts.themes.includes("aleatorio");
  const pool = listCareerQuestions().filter((c) => {
    if (opts.excludeIds.includes(c.id)) return false;
    if (!wantsRandomTheme && (!c.theme || !opts.themes.includes(c.theme))) return false;
    if (opts.difficulties.length > 0 && (!c.difficulty || !opts.difficulties.includes(c.difficulty))) return false;
    return true;
  });
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Single approved career by id -- used by solo mode to judge an answer
 * server-side (the client only ever sees the clubs via the "next career"
 * endpoint, never playerName/acceptedAnswers, until it answers). */
export function getApprovedCareerById(id: string): CareerQuestion | null {
  const row = db.prepare("SELECT * FROM career_questions WHERE id = ? AND status = 'approved'").get(id) as unknown as CareerRow | undefined;
  return row ? rowToCareer(row) : null;
}

export function deleteCareerQuestion(id: string): void {
  db.prepare("DELETE FROM career_questions WHERE id = ?").run(id);
}
