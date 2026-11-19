import { db } from "./db.js";

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  avatar_url: string | null;
  created_at: number;
  rating_overall: number;
  rating_season: number;
  season_id: string;
  matches_played: number;
  matches_won: number;
  matches_lost: number;
  win_streak: number;
  best_win_streak: number;
}

export function findUserByEmail(email: string): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email.toLowerCase()) as unknown as UserRow | undefined;
}

export function findUserById(id: string): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as unknown as UserRow | undefined;
}

export function createUser(row: {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
}): UserRow {
  db.prepare(
    `INSERT INTO users (id, email, password_hash, display_name, avatar_url, created_at)
     VALUES (?, ?, ?, ?, NULL, ?)`,
  ).run(row.id, row.email.toLowerCase(), row.passwordHash, row.displayName, Date.now());
  return findUserById(row.id)!;
}

export function updateUserProfile(id: string, patch: { displayName?: string; avatarUrl?: string | null }): void {
  if (patch.displayName !== undefined) {
    db.prepare("UPDATE users SET display_name = ? WHERE id = ?").run(patch.displayName, id);
  }
  if (patch.avatarUrl !== undefined) {
    db.prepare("UPDATE users SET avatar_url = ? WHERE id = ?").run(patch.avatarUrl, id);
  }
}

export function updatePassword(id: string, passwordHash: string): void {
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(passwordHash, id);
}

export function recordMatchResult(
  userId: string,
  opts: { won: boolean; ratingDelta: number; ranked: boolean },
): void {
  const user = findUserById(userId);
  if (!user) return;
  const newStreak = opts.won ? user.win_streak + 1 : 0;
  const bestStreak = Math.max(user.best_win_streak, newStreak);
  if (opts.ranked) {
    db.prepare(
      `UPDATE users SET
        matches_played = matches_played + 1,
        matches_won = matches_won + ?,
        matches_lost = matches_lost + ?,
        rating_overall = rating_overall + ?,
        rating_season = rating_season + ?,
        win_streak = ?,
        best_win_streak = ?
      WHERE id = ?`,
    ).run(opts.won ? 1 : 0, opts.won ? 0 : 1, opts.ratingDelta, opts.ratingDelta, newStreak, bestStreak, userId);
  } else {
    db.prepare(
      `UPDATE users SET
        matches_played = matches_played + 1,
        matches_won = matches_won + ?,
        matches_lost = matches_lost + ?
      WHERE id = ?`,
    ).run(opts.won ? 1 : 0, opts.won ? 0 : 1, userId);
  }
}

export function leaderboard(scope: "overall" | "season", limit = 50): UserRow[] {
  const col = scope === "overall" ? "rating_overall" : "rating_season";
  return db.prepare(`SELECT * FROM users ORDER BY ${col} DESC LIMIT ?`).all(limit) as unknown as UserRow[];
}
