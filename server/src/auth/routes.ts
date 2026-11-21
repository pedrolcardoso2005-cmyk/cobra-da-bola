import { Router } from "express";
import { z } from "zod";
import { nanoid } from "nanoid";
import { createUser, findUserByEmail, findUserById, updatePassword, updateUserProfile } from "../db/users.js";
import { hashPassword, signToken, verifyPassword, verifyToken } from "./auth.js";
import { sendPasswordResetEmail } from "./mailer.js";
import { db } from "../db/db.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(200),
  displayName: z.string().trim().min(2).max(40),
});

authRouter.post("/registrar", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Dados invalidos", details: parsed.error.flatten() });
  }
  const { email, password, displayName } = parsed.data;
  if (findUserByEmail(email)) {
    return res.status(409).json({ error: "Ja existe uma conta com este e-mail" });
  }
  const user = createUser({ id: nanoid(), email, passwordHash: await hashPassword(password), displayName });
  const token = signToken({ sub: user.id, email: user.email, displayName: user.display_name });
  res.status(201).json({ token, user: publicUser(user) });
});

const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Dados invalidos" });
  }
  const user = findUserByEmail(parsed.data.email);
  if (!user || !(await verifyPassword(parsed.data.password, user.password_hash))) {
    return res.status(401).json({ error: "E-mail ou senha incorretos" });
  }
  const token = signToken({ sub: user.id, email: user.email, displayName: user.display_name });
  res.json({ token, user: publicUser(user) });
});

const forgotSchema = z.object({ email: z.string().trim().email() });

authRouter.post("/esqueci-senha", async (req, res) => {
  const parsed = forgotSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "E-mail invalido" });
  const user = findUserByEmail(parsed.data.email);
  // Always respond 200 regardless of whether the account exists, to avoid
  // leaking which e-mails are registered.
  if (!user) return res.json({ ok: true });
  const token = nanoid(32);
  db.prepare("INSERT INTO password_resets (token, user_id, expires_at) VALUES (?, ?, ?)").run(
    token,
    user.id,
    Date.now() + 1000 * 60 * 30,
  );
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/redefinir-senha?token=${token}`;
  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (err) {
    // The reset token is already saved; a transient provider failure
    // shouldn't hang the request or leak whether the address exists.
    // eslint-disable-next-line no-console
    console.error("[esqueci-senha] falha ao enviar e-mail:", err instanceof Error ? err.message : err);
  }
  res.json({ ok: true });
});

const resetSchema = z.object({ token: z.string().min(10), password: z.string().min(8).max(200) });

authRouter.post("/redefinir-senha", async (req, res) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados invalidos" });
  const row = db
    .prepare("SELECT * FROM password_resets WHERE token = ?")
    .get(parsed.data.token) as { token: string; user_id: string; expires_at: number; used: number } | undefined;
  if (!row || row.used || row.expires_at < Date.now()) {
    return res.status(400).json({ error: "Link invalido ou expirado" });
  }
  await updatePassword(row.user_id, await hashPassword(parsed.data.password));
  db.prepare("UPDATE password_resets SET used = 1 WHERE token = ?").run(row.token);
  res.json({ ok: true });
});

export function requireAuth(req: any, res: any, next: any) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Nao autenticado" });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Token invalido" });
  const user = findUserById(payload.sub);
  if (!user) return res.status(401).json({ error: "Usuario nao encontrado" });
  req.user = user;
  next();
}

// Comma-separated allowlist (ADMIN_EMAILS="pedro@example.com,outro@x.com")
// -- checked at request time, so promoting an account to admin takes
// effect on that account's very next request, no server restart needed.
// `users.is_admin` (see db.ts) exists for a future admin UI to grant
// access without touching env vars, but isn't required for this to work.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/** Mount AFTER requireAuth. Rejects any authenticated player who isn't an
 * admin -- the AI review/generation routes (review-routes.ts) must never
 * be reachable by a regular player, only by someone listed in
 * ADMIN_EMAILS or flagged is_admin=1 in the database. */
export function requireAdmin(req: any, res: any, next: any) {
  const isAdmin = req.user?.is_admin === 1 || ADMIN_EMAILS.includes(String(req.user?.email ?? "").toLowerCase());
  if (!isAdmin) return res.status(403).json({ error: "Acesso restrito a administradores" });
  next();
}

authRouter.get("/me", requireAuth, (req: any, res) => {
  res.json({ user: publicUser(req.user) });
});

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(40).optional(),
  avatarUrl: z.string().url().max(500).nullable().optional(),
});

authRouter.put("/perfil", requireAuth, (req: any, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados invalidos" });
  updateUserProfile(req.user.id, parsed.data);
  res.json({ user: publicUser(findUserById(req.user.id)!) });
});

function publicUser(user: ReturnType<typeof findUserById> & object) {
  return {
    id: user!.id,
    email: user!.email,
    displayName: user!.display_name,
    avatarUrl: user!.avatar_url,
    ratingOverall: user!.rating_overall,
    ratingSeason: user!.rating_season,
    matchesPlayed: user!.matches_played,
    matchesWon: user!.matches_won,
    matchesLost: user!.matches_lost,
    winStreak: user!.win_streak,
    bestWinStreak: user!.best_win_streak,
  };
}
