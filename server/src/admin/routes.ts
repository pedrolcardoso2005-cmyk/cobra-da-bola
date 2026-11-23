// Admin panel data: how many accounts exist and how many people are
// actually using the game. Only reachable by admins (ADMIN_EMAILS or
// users.is_admin=1).
import { Router } from "express";
import { db } from "../db/db.js";
import { requireAdmin, requireAuth } from "../auth/routes.js";
import { roomManager } from "../game/rooms.js";
import { onlineUserIds, seenSince } from "./presence.js";
import { visitStats } from "./visits.js";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

const DAY = 24 * 60 * 60_000;

function count(sql: string, ...params: (string | number)[]): number {
  const row = db.prepare(sql).get(...params) as unknown as { n: number } | undefined;
  return row?.n ?? 0;
}

function idsFrom(sql: string, ...params: (string | number)[]): string[] {
  return (db.prepare(sql).all(...params) as unknown as { id: string }[]).map((r) => r.id);
}

/** Distinct users who played (solo answer or multiplayer match) or were
 * seen online since `since`. */
function activeSince(since: number): number {
  const ids = new Set<string>([
    ...idsFrom("SELECT DISTINCT user_id AS id FROM solo_answer_log WHERE at >= ?", since),
    ...idsFrom(
      "SELECT DISTINCT mp.user_id AS id FROM match_participants mp JOIN matches m ON m.id = mp.match_id WHERE m.started_at >= ?",
      since,
    ),
    ...seenSince(since),
  ]);
  return ids.size;
}

export function buildAdminSummary() {
  const now = Date.now();
  const rooms = roomManager.stats();
  return {
    geradoEm: now,
    visitas: visitStats(now),
    usuarios: {
      total: count("SELECT COUNT(*) AS n FROM users"),
      novos24h: count("SELECT COUNT(*) AS n FROM users WHERE created_at >= ?", now - DAY),
      novos7d: count("SELECT COUNT(*) AS n FROM users WHERE created_at >= ?", now - 7 * DAY),
    },
    atividade: {
      onlineAgora: onlineUserIds().size,
      ativos24h: activeSince(now - DAY),
      ativos7d: activeSince(now - 7 * DAY),
      respostasSolo24h: count("SELECT COUNT(*) AS n FROM solo_answer_log WHERE at >= ?", now - DAY),
    },
    partidas: {
      salasAbertas: rooms.rooms,
      salasJogando: rooms.playing,
      jogadoresEmSalas: rooms.players,
      iniciadas24h: count("SELECT COUNT(*) AS n FROM matches WHERE started_at >= ?", now - DAY),
      total: count("SELECT COUNT(*) AS n FROM matches"),
    },
    ultimosCadastros: (
      db.prepare("SELECT display_name, email, created_at FROM users ORDER BY created_at DESC LIMIT 10").all() as unknown as {
        display_name: string;
        email: string;
        created_at: number;
      }[]
    ).map((u) => ({ nome: u.display_name, email: u.email, criadoEm: u.created_at })),
  };
}

adminRouter.get("/resumo", (_req, res) => {
  res.json(buildAdminSummary());
});
