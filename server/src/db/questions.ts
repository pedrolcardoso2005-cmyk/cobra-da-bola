import type { CareerQuestion, Difficulty, Question, QuestionCategory, QuestionFormat } from "@cobra/shared";
import { nanoid } from "nanoid";
import { db } from "./db.js";

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
  };
}

export function insertQuestion(q: Omit<Question, "id">, createdByUserId?: string): Question {
  const id = nanoid();
  db.prepare(
    `INSERT INTO questions (id, category, difficulty, format, prompt, choices_json, correct_answer, accepted_answers_json, created_by_user_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
  );
  return rowToQuestion(db.prepare("SELECT * FROM questions WHERE id = ?").get(id) as unknown as QuestionRow);
}

export function listQuestions(filter: { category?: QuestionCategory; difficulty?: Difficulty } = {}): Question[] {
  let sql = "SELECT * FROM questions WHERE 1=1";
  const params: string[] = [];
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
}

function rowToCareer(r: CareerRow): CareerQuestion {
  return {
    id: r.id,
    clubs: JSON.parse(r.clubs_json),
    playerName: r.player_name,
    acceptedAnswers: r.accepted_answers_json ? JSON.parse(r.accepted_answers_json) : undefined,
  };
}

export function insertCareerQuestion(c: Omit<CareerQuestion, "id">): CareerQuestion {
  const id = nanoid();
  db.prepare(
    `INSERT INTO career_questions (id, clubs_json, player_name, accepted_answers_json, created_at) VALUES (?, ?, ?, ?, ?)`,
  ).run(id, JSON.stringify(c.clubs), c.playerName, c.acceptedAnswers ? JSON.stringify(c.acceptedAnswers) : null, Date.now());
  return rowToCareer(db.prepare("SELECT * FROM career_questions WHERE id = ?").get(id) as unknown as CareerRow);
}

export function listCareerQuestions(): CareerQuestion[] {
  return (db.prepare("SELECT * FROM career_questions").all() as unknown as CareerRow[]).map(rowToCareer);
}

export function pickRandomCareerQuestion(excludeIds: string[]): CareerQuestion | null {
  const pool = listCareerQuestions().filter((c) => !excludeIds.includes(c.id));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function deleteCareerQuestion(id: string): void {
  db.prepare("DELETE FROM career_questions WHERE id = ?").run(id);
}
