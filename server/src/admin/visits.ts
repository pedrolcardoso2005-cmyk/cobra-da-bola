// Anonymous visit counter (people who opened the site, logged in or not).
import { Router } from "express";
import { db } from "../db/db.js";

/** Calendar day in Sao Paulo (UTC-3, no DST since 2019), as YYYY-MM-DD. */
export function spDay(ts: number): string {
  return new Date(ts - 3 * 60 * 60_000).toISOString().slice(0, 10);
}

const VISITOR_ID = /^[A-Za-z0-9-]{8,64}$/;

export function recordVisit(visitorId: string, now = Date.now()): void {
  db.prepare(
    `INSERT INTO site_visits (day, visitor_id, views, first_at, last_at) VALUES (?, ?, 1, ?, ?)
     ON CONFLICT(day, visitor_id) DO UPDATE SET views = views + 1, last_at = excluded.last_at`,
  ).run(spDay(now), visitorId, now, now);
}

export function visitStats(now = Date.now()) {
  const days: string[] = [];
  for (let i = 13; i >= 0; i--) days.push(spDay(now - i * 86_400_000));
  const rows = db
    .prepare("SELECT day, COUNT(*) AS visitantes, SUM(views) AS paginas FROM site_visits WHERE day >= ? GROUP BY day")
    .all(spDay(now - 29 * 86_400_000)) as unknown as { day: string; visitantes: number; paginas: number }[];
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const uniq = (since: string) =>
    (db.prepare("SELECT COUNT(DISTINCT visitor_id) AS n FROM site_visits WHERE day >= ?").get(since) as unknown as { n: number }).n;
  const today = spDay(now);
  return {
    hoje: { visitantes: byDay.get(today)?.visitantes ?? 0, paginas: byDay.get(today)?.paginas ?? 0 },
    visitantes7d: uniq(spDay(now - 6 * 86_400_000)),
    visitantes30d: uniq(spDay(now - 29 * 86_400_000)),
    total: (db.prepare("SELECT COUNT(DISTINCT visitor_id) AS n FROM site_visits").get() as unknown as { n: number }).n,
    porDia: days.map((d) => ({ dia: d, visitantes: byDay.get(d)?.visitantes ?? 0, paginas: byDay.get(d)?.paginas ?? 0 })),
  };
}

// Simple in-memory limit so nobody can inflate the numbers by spamming
// this public endpoint: at most 30 pings per IP per minute and at most
// 300 distinct visitor ids per IP per day are counted.
const perMinute = new Map<string, { windowStart: number; n: number }>();
const idsPerDay = new Map<string, Set<string>>();

export function allowVisit(ip: string, visitorId: string, now = Date.now()): boolean {
  const m = perMinute.get(ip);
  if (!m || now - m.windowStart >= 60_000) perMinute.set(ip, { windowStart: now, n: 1 });
  else if (++m.n > 30) return false;
  const key = `${spDay(now)}|${ip}`;
  let ids = idsPerDay.get(key);
  if (!ids) {
    if (idsPerDay.size > 50_000) idsPerDay.clear();
    ids = new Set();
    idsPerDay.set(key, ids);
  }
  if (!ids.has(visitorId)) {
    if (ids.size >= 300) return false;
    ids.add(visitorId);
  }
  return true;
}

export function resetVisitLimits(): void {
  perMinute.clear();
  idsPerDay.clear();
}

export const visitRouter = Router();
visitRouter.post("/", (req, res) => {
  const id = typeof req.body?.visitorId === "string" ? req.body.visitorId : "";
  if (!VISITOR_ID.test(id)) return res.status(400).json({ error: "visitorId invalido" });
  const ip = String(req.headers["x-forwarded-for"] ?? req.socket.remoteAddress ?? "").split(",")[0].trim();
  if (allowVisit(ip, id)) recordVisit(id);
  res.status(204).end();
});
