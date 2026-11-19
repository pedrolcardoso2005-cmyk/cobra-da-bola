import { EventEmitter } from "node:events";
import { nanoid } from "nanoid";
import { generateRoomCode, type CareerQuestion, type MatchSettings, type MatchState, type Question, type TeamKey } from "@cobra/shared";
import { applyAction, EngineError } from "./engine.js";
import { createInitialMatch } from "./match.js";
import type { EngineAction } from "./actions.js";
import { pickRandomCareerQuestion, pickRandomQuestion } from "../db/questions.js";
import { persistFinishedMatch } from "../db/matches.js";

export class RoomRuntime {
  match: MatchState;
  snapshotStack: MatchState[] = [];
  questionCache = new Map<string, Question>();
  careerCache = new Map<string, CareerQuestion>();
  usedCareerQuestionIds: string[] = [];
  pendingTimeout: NodeJS.Timeout | null = null;
  playerIdByUserId = new Map<string, string>();

  constructor(match: MatchState) {
    this.match = match;
  }
}

class RoomManager extends EventEmitter {
  private rooms = new Map<string, RoomRuntime>();

  createRoom(hostUserId: string, settings: MatchSettings): RoomRuntime {
    let code = generateRoomCode();
    while (this.rooms.has(code)) code = generateRoomCode();
    const match = createInitialMatch({ id: nanoid(), code, hostUserId, settings });
    const room = new RoomRuntime(match);
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code: string): RoomRuntime | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  private dispatch(room: RoomRuntime, action: EngineAction): void {
    room.match = applyAction(room.match, action);
    this.emit("update", room.match);
    if (room.match.phase === "champion" && !(room as any).__persisted) {
      (room as any).__persisted = true;
      try {
        persistFinishedMatch(room.match);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Falha ao persistir partida finalizada", err);
      }
    }
  }

  private snapshot(room: RoomRuntime): void {
    room.snapshotStack.push(structuredClone(room.match));
    if (room.snapshotStack.length > 25) room.snapshotStack.shift();
  }

  private clearPendingTimeout(room: RoomRuntime): void {
    if (room.pendingTimeout) {
      clearTimeout(room.pendingTimeout);
      room.pendingTimeout = null;
    }
  }

  addOrReconnectPlayer(
    code: string,
    opts: { userId: string; displayName: string; avatarUrl: string | null },
  ): { playerId: string; reconnected: boolean } {
    const room = this.mustGet(code);
    const existingPlayerId = room.playerIdByUserId.get(opts.userId);
    if (existingPlayerId) {
      this.dispatch(room, { type: "SET_CONNECTED", playerId: existingPlayerId, connected: true });
      return { playerId: existingPlayerId, reconnected: true };
    }
    const playerId = nanoid();
    room.playerIdByUserId.set(opts.userId, playerId);
    this.dispatch(room, {
      type: "JOIN_PLAYER",
      player: {
        id: playerId,
        userId: opts.userId,
        displayName: opts.displayName,
        avatarUrl: opts.avatarUrl,
        connected: true,
        teamId: null,
        eliminated: false,
        qualified: false,
        careerRank: null,
        correctAnswers: 0,
        wrongAnswers: 0,
      },
    });
    return { playerId, reconnected: false };
  }

  setConnected(code: string, playerId: string, connected: boolean): void {
    const room = this.mustGet(code);
    this.dispatch(room, { type: "SET_CONNECTED", playerId, connected });
  }

  setTeams(code: string, assignments: Record<string, TeamKey>): void {
    const room = this.mustGet(code);
    this.snapshot(room);
    this.dispatch(room, { type: "SET_TEAMS", assignments });
  }

  startMatch(code: string): void {
    const room = this.mustGet(code);
    this.snapshot(room);
    this.dispatch(room, { type: "START_MATCH", now: Date.now() });
  }

  releaseQuestion(code: string): void {
    const room = this.mustGet(code);
    this.snapshot(room);
    const { match } = room;
    if (match.phase === "phase1") {
      const q = pickRandomQuestion({
        categories: match.settings.categories,
        difficulties: match.settings.difficulties,
        excludeIds: match.phase1!.usedQuestionIds,
      });
      if (!q) throw new EngineError("Nao ha mais perguntas disponiveis com esses filtros");
      room.questionCache.set(q.id, q);
      this.dispatch(room, { type: "RELEASE_PHASE1_QUESTION", question: q, now: Date.now() });
    } else if (match.phase === "semifinal" || match.phase === "final") {
      const q = pickRandomQuestion({
        categories: match.settings.categories,
        difficulties: match.settings.difficulties,
        excludeIds: match.bracketRound?.usedQuestionIds ?? [],
      });
      if (!q) throw new EngineError("Nao ha mais perguntas disponiveis com esses filtros");
      room.questionCache.set(q.id, q);
      this.dispatch(room, { type: "RELEASE_BRACKET_QUESTION", question: q, now: Date.now() });
    } else if (match.phase === "career") {
      const c = pickRandomCareerQuestion(room.usedCareerQuestionIds);
      if (!c) throw new EngineError("Nao ha mais carreiras disponiveis no banco de perguntas");
      room.usedCareerQuestionIds.push(c.id);
      room.careerCache.set(c.id, c);
      this.dispatch(room, { type: "RELEASE_CAREER_QUESTION", careerQuestion: c });
    } else {
      throw new EngineError("Fase atual nao aceita liberar pergunta");
    }
  }

  armButtons(code: string): void {
    const room = this.mustGet(code);
    this.dispatch(room, { type: "ARM_BUTTONS", now: Date.now(), durationSeconds: room.match.settings.answerSeconds });
  }

  revealNextClub(code: string): void {
    const room = this.mustGet(code);
    this.dispatch(room, { type: "REVEAL_NEXT_CLUB" });
  }

  playerBuzz(code: string, playerId: string): void {
    const room = this.mustGet(code);
    this.dispatch(room, { type: "PLAYER_BUZZ", playerId, now: Date.now() });
    const buzz = currentBuzzOf(room.match);
    if (buzz?.firstPlayerId === playerId && room.match.timer && (room.match.phase === "phase1" || room.match.phase === "semifinal" || room.match.phase === "final")) {
      this.clearPendingTimeout(room);
      const seconds = room.match.timer.seconds;
      room.pendingTimeout = setTimeout(() => {
        const fresh = room.match;
        const b = currentBuzzOf(fresh);
        if (b?.firstPlayerId === playerId && fresh.lastAnswer === null) {
          this.dispatch(room, { type: "TIMEOUT", now: Date.now() });
        }
      }, seconds * 1000 + 150);
    }
  }

  submitAnswer(code: string, playerId: string, answer: string): void {
    const room = this.mustGet(code);
    this.clearPendingTimeout(room);
    this.dispatch(room, { type: "SUBMIT_ANSWER", playerId, answer });
  }

  hostJudge(code: string, playerId: string, correct: boolean): void {
    const room = this.mustGet(code);
    this.snapshot(room);
    this.clearPendingTimeout(room);
    this.dispatch(room, { type: "HOST_JUDGE", playerId, correct, now: Date.now() });
  }

  advance(code: string): void {
    const room = this.mustGet(code);
    this.snapshot(room);
    if (room.match.phase === "phase1") this.dispatch(room, { type: "ADVANCE_PHASE1_QUESTION" });
    else if (room.match.phase === "semifinal" || room.match.phase === "final") this.dispatch(room, { type: "ADVANCE_BRACKET_QUESTION" });
  }

  endCareerRound(code: string): void {
    const room = this.mustGet(code);
    this.snapshot(room);
    this.dispatch(room, { type: "END_CAREER_ROUND" });
  }

  adjustScore(code: string, teamOrPlayerId: string, delta: number): void {
    const room = this.mustGet(code);
    this.snapshot(room);
    this.dispatch(room, { type: "ADJUST_SCORE", teamOrPlayerId, delta });
  }

  undo(code: string): void {
    const room = this.mustGet(code);
    const previous = room.snapshotStack.pop();
    if (!previous) return;
    room.match = previous;
    this.emit("update", room.match);
  }

  pause(code: string): void {
    const room = this.mustGet(code);
    this.dispatch(room, { type: "PAUSE" });
  }

  resume(code: string): void {
    const room = this.mustGet(code);
    this.dispatch(room, { type: "RESUME" });
  }

  endMatchForce(code: string): void {
    const room = this.mustGet(code);
    this.snapshot(room);
    this.dispatch(room, { type: "END_MATCH_FORCE", now: Date.now() });
  }

  private mustGet(code: string): RoomRuntime {
    const room = this.getRoom(code);
    if (!room) throw new EngineError("Sala nao encontrada");
    return room;
  }
}

function currentBuzzOf(match: MatchState) {
  if (match.phase === "phase1") return match.phase1?.buzz ?? null;
  if (match.phase === "career") return match.career?.buzz ?? null;
  if (match.phase === "semifinal" || match.phase === "final") return match.bracketRound?.buzz ?? null;
  return null;
}

export const roomManager = new RoomManager();
