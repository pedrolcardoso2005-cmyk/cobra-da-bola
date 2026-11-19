import type { AnswerSeconds } from "@cobra/shared";
import { findUserById } from "../db/users.js";
import { roomManager } from "./rooms.js";

interface QueueEntry {
  userId: string;
  socketId: string;
  answerSeconds: AnswerSeconds;
  joinedAt: number;
  rating: number;
}

export interface MatchmakingSocketLike {
  id: string;
  emit(event: "matchmaking:queued", payload: { targetCount: number; waiting: number }): void;
  emit(event: "matchmaking:found", payload: { code: string; isHost: boolean }): void;
}

/** A player who has waited this long gets matched on the next entry/exit even if that makes the match less balanced. */
const MAX_WAIT_BEFORE_FORCED_MS = 20_000;

/**
 * One queue per participant count (2..12, matching the format table).
 * Pairing is skill-aware: once a queue has enough players, it matches the
 * group of `targetCount` with the smallest rating spread (using seasonal
 * Elo) instead of strict first-come-first-served, so ranked matches stay
 * competitive. A long-waiting player still forces a match to form around
 * them so nobody is permanently skipped by closer-rated latecomers.
 *
 * Every ranked match still needs someone to run the presenter panel, so
 * the lowest-rated player in the formed group becomes that match's host
 * (they can open /apresentador in addition to /jogador); this reuses the
 * exact same room/host machinery as a private match instead of inventing
 * a second, hostless game loop.
 */
class MatchmakingManager {
  private queues = new Map<number, QueueEntry[]>();
  private sockets = new Map<string, MatchmakingSocketLike>();

  enter(socket: MatchmakingSocketLike, userId: string, targetCount: number, answerSeconds: AnswerSeconds): void {
    this.leaveAll(userId);
    this.sockets.set(socket.id, socket);
    const user = findUserById(userId);
    const rating = user?.rating_season ?? 1000;
    const queue = this.queues.get(targetCount) ?? [];
    queue.push({ userId, socketId: socket.id, answerSeconds, joinedAt: Date.now(), rating });
    this.queues.set(targetCount, queue);

    for (const entry of queue) {
      this.sockets.get(entry.socketId)?.emit("matchmaking:queued", { targetCount, waiting: queue.length });
    }

    this.tryFormMatch(targetCount);
  }

  leaveAll(userId: string): void {
    for (const [count, queue] of this.queues) {
      const next = queue.filter((e) => e.userId !== userId);
      this.queues.set(count, next);
    }
  }

  removeSocket(socketId: string): void {
    this.sockets.delete(socketId);
    for (const [count, queue] of this.queues) {
      this.queues.set(count, queue.filter((e) => e.socketId !== socketId));
    }
  }

  private tryFormMatch(targetCount: number): void {
    const queue = this.queues.get(targetCount) ?? [];
    if (queue.length < targetCount) return;

    const group = this.pickBalancedGroup(queue, targetCount);
    this.formMatch(targetCount, group);
  }

  /** Picks the `targetCount` entries with the smallest rating spread, anchored on whoever has waited the longest once they pass the forced-match threshold. */
  private pickBalancedGroup(queue: QueueEntry[], targetCount: number): QueueEntry[] {
    const sorted = [...queue].sort((a, b) => a.rating - b.rating);

    let bestWindow = sorted.slice(0, targetCount);
    let bestSpread = bestWindow[bestWindow.length - 1].rating - bestWindow[0].rating;
    for (let i = 1; i + targetCount <= sorted.length; i++) {
      const window = sorted.slice(i, i + targetCount);
      const spread = window[window.length - 1].rating - window[0].rating;
      if (spread < bestSpread) {
        bestSpread = spread;
        bestWindow = window;
      }
    }

    const now = Date.now();
    const oldest = queue.reduce((a, b) => (a.joinedAt < b.joinedAt ? a : b));
    if (now - oldest.joinedAt > MAX_WAIT_BEFORE_FORCED_MS && !bestWindow.includes(oldest)) {
      const oldestIndex = sorted.indexOf(oldest);
      const start = Math.max(0, Math.min(oldestIndex - Math.floor(targetCount / 2), sorted.length - targetCount));
      return sorted.slice(start, start + targetCount);
    }
    return bestWindow;
  }

  private formMatch(targetCount: number, group: QueueEntry[]): void {
    const queue = this.queues.get(targetCount) ?? [];
    this.queues.set(targetCount, queue.filter((e) => !group.includes(e)));

    // Lowest-rated player in the group runs the presenter panel; this is an
    // arbitrary but deterministic tie-breaker, not a skill judgement.
    const hostEntry = [...group].sort((a, b) => a.rating - b.rating)[0];
    const hostUser = findUserById(hostEntry.userId);
    if (!hostUser) return;

    const room = roomManager.createRoom(hostUser.id, {
      answerSeconds: hostEntry.answerSeconds,
      categories: ["aleatorio"],
      difficulties: [],
      kind: "ranked",
      targetCount,
    });

    for (const entry of group) {
      const user = findUserById(entry.userId);
      if (!user) continue;
      roomManager.addOrReconnectPlayer(room.match.code, {
        userId: user.id,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
      });
      this.sockets.get(entry.socketId)?.emit("matchmaking:found", {
        code: room.match.code,
        isHost: entry.userId === hostUser.id,
      });
    }
  }
}

export const matchmakingManager = new MatchmakingManager();
