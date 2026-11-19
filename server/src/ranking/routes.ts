import { Router } from "express";
import { requireAuth } from "../auth/routes.js";
import { leaderboard } from "../db/users.js";
import { matchHistoryForUser } from "../db/matches.js";

export const rankingRouter = Router();

rankingRouter.get("/", (req, res) => {
  const scope = req.query.scope === "season" ? "season" : "overall";
  const rows = leaderboard(scope, 50).map((u, idx) => ({
    position: idx + 1,
    displayName: u.display_name,
    avatarUrl: u.avatar_url,
    rating: scope === "season" ? u.rating_season : u.rating_overall,
    matchesPlayed: u.matches_played,
    matchesWon: u.matches_won,
    bestWinStreak: u.best_win_streak,
  }));
  res.json({ scope, ranking: rows });
});

rankingRouter.get("/historico", requireAuth, (req: any, res) => {
  res.json({ matches: matchHistoryForUser(req.user.id) });
});
