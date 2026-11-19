import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH ?? `${__dirname}/../../data/cobra.db`;
mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at INTEGER NOT NULL,
  rating_overall INTEGER NOT NULL DEFAULT 1000,
  rating_season INTEGER NOT NULL DEFAULT 1000,
  season_id TEXT NOT NULL DEFAULT 'S1',
  matches_played INTEGER NOT NULL DEFAULT 0,
  matches_won INTEGER NOT NULL DEFAULT 0,
  matches_lost INTEGER NOT NULL DEFAULT 0,
  win_streak INTEGER NOT NULL DEFAULT 0,
  best_win_streak INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS password_resets (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  kind TEXT NOT NULL,
  participant_count INTEGER NOT NULL,
  started_at INTEGER NOT NULL,
  finished_at INTEGER,
  winner_user_id TEXT REFERENCES users(id),
  runner_up_user_id TEXT REFERENCES users(id),
  state_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS match_participants (
  match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team TEXT,
  final_position INTEGER,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  wrong_answers INTEGER NOT NULL DEFAULT 0,
  rating_delta INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (match_id, user_id)
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  format TEXT NOT NULL,
  prompt TEXT NOT NULL,
  choices_json TEXT,
  correct_answer TEXT NOT NULL,
  accepted_answers_json TEXT,
  created_by_user_id TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS career_questions (
  id TEXT PRIMARY KEY,
  clubs_json TEXT NOT NULL,
  player_name TEXT NOT NULL,
  accepted_answers_json TEXT,
  created_at INTEGER NOT NULL
);
`);
