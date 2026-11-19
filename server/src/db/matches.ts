import type { MatchState } from "@cobra/shared";
import { db } from "./db.js";
import { findUserById, recordMatchResult } from "./users.js";
import { eloDelta } from "../ranking/elo.js";

export function persistFinishedMatch(match: MatchState): void {
  const ranked = match.settings.kind === "ranked";
  let winnerDelta = 0;
  if (ranked && match.final?.winnerId) {
    const winnerPlayer = match.players.find((p) => p.id === match.final!.winnerId);
    const loserId = match.final.playerAId === match.final.winnerId ? match.final.playerBId : match.final.playerAId;
    const loserPlayer = match.players.find((p) => p.id === loserId);
    if (winnerPlayer && loserPlayer) {
      const winnerUser = findUserById(winnerPlayer.userId);
      const loserUser = findUserById(loserPlayer.userId);
      if (winnerUser && loserUser) {
        winnerDelta = eloDelta(winnerUser.rating_overall, loserUser.rating_overall);
      }
    }
  }

  for (const player of match.players) {
    const isWinner = player.userId === match.winnerUserId;
    const isRunnerUp = player.userId === match.runnerUpUserId;
    const delta = isWinner ? winnerDelta : isRunnerUp ? -winnerDelta : 0;
    recordMatchResult(player.userId, { won: isWinner, ratingDelta: delta, ranked });
  }

  db.prepare(
    `INSERT INTO matches (id, code, kind, participant_count, started_at, finished_at, winner_user_id, runner_up_user_id, state_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET finished_at = excluded.finished_at, winner_user_id = excluded.winner_user_id,
       runner_up_user_id = excluded.runner_up_user_id, state_json = excluded.state_json`,
  ).run(
    match.id,
    match.code,
    match.settings.kind,
    match.participantCount,
    match.createdAt,
    Date.now(),
    match.winnerUserId,
    match.runnerUpUserId,
    JSON.stringify(match),
  );

  for (const player of match.players) {
    db.prepare(
      `INSERT INTO match_participants (match_id, user_id, team, final_position, correct_answers, wrong_answers, rating_delta)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(match_id, user_id) DO UPDATE SET correct_answers = excluded.correct_answers, wrong_answers = excluded.wrong_answers`,
    ).run(
      match.id,
      player.userId,
      player.teamId,
      player.careerRank,
      player.correctAnswers,
      player.wrongAnswers,
      player.userId === match.winnerUserId ? winnerDelta : player.userId === match.runnerUpUserId ? -winnerDelta : 0,
    );
  }
}

export function matchHistoryForUser(userId: string, limit = 20) {
  return db
    .prepare(
      `SELECT m.id, m.code, m.kind, m.participant_count, m.started_at, m.finished_at, m.winner_user_id, m.runner_up_user_id,
              mp.team, mp.final_position, mp.correct_answers, mp.wrong_answers, mp.rating_delta
       FROM matches m JOIN match_participants mp ON mp.match_id = m.id
       WHERE mp.user_id = ? ORDER BY m.started_at DESC LIMIT ?`,
    )
    .all(userId, limit);
}
