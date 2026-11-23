import { EventEmitter } from "node:events";
import { nanoid } from "nanoid";
import { answersMatch, generateRoomCode, REVEAL_WORD_MS, type CareerQuestion, type MatchSettings, type MatchState, type Question, type TeamKey } from "@cobra/shared";
import { applyAction, EngineError } from "./engine.js";
import { createInitialMatch } from "./match.js";
import type { EngineAction } from "./actions.js";
import { insertQuestionConsumption, markSeen, pickRandomCareerQuestion, pickRandomQuestion } from "../db/questions.js";
import { persistFinishedMatch } from "../db/matches.js";

export class RoomRuntime {
  match: MatchState;
  snapshotStack: MatchState[] = [];
  questionCache = new Map<string, Question>();
  careerCache = new Map<string, CareerQuestion>();
  usedCareerQuestionIds: string[] = [];
  pendingTimeout: NodeJS.Timeout | null = null;
  /** Proximo passo automatico do jogo (proxima pergunta, proximo clube...). */
  flowTimeout: NodeJS.Timeout | null = null;
  /** Resposta certa mostrada a todos depois que a rodada termina. */
  revealedAnswer: string | null = null;
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

  /** Live numbers for the admin panel. */
  stats(): { rooms: number; playing: number; players: number } {
    let playing = 0;
    let players = 0;
    for (const room of this.rooms.values()) {
      if (room.match.phase !== "lobby" && room.match.phase !== "champion") playing++;
      if (room.match.phase !== "champion") players += room.match.players.length;
    }
    return { rooms: this.rooms.size, playing, players };
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
    if (room.match.phase === "lobby" && room.match.players.length >= room.match.settings.targetCount) {
      throw new EngineError("Sala cheia");
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
    // Ja entra numa equipe (a menor); o anfitriao pode trocar depois.
    if (room.match.phase === "lobby") {
      const a = room.match.players.filter((p) => p.teamId === "A").length;
      const b = room.match.players.filter((p) => p.teamId === "B").length;
      this.dispatch(room, { type: "SET_TEAMS", assignments: { [playerId]: a <= b ? "A" : "B" } });
    }
    // Partida casual: quem criou a sala aperta "Iniciar". Ranqueada (fila
    // automatica, sem anfitriao de verdade): comeca sozinha ao encher.
    if (room.match.phase === "lobby" && room.match.settings.kind === "ranked" && room.match.players.length === room.match.settings.targetCount) {
      this.autoStart(room);
    }
    return { playerId, reconnected: false };
  }

  /**
   * Server-authoritative auto-start: fires exactly once, the moment the
   * lobby reaches its targetCount, so no human "host" has to be present
   * to press start -- the match (and its first question) begins on its
   * own and every player is synchronized by the same state broadcast.
   */
  private autoStart(room: RoomRuntime): void {
    if (room.match.phase !== "lobby") return; // already started; never double-fire
    this.startMatch(room.match.code);
    if (room.match.phase === "lobby") return; // engine refused to start (shouldn't happen here)
    try {
      this.releaseQuestion(room.match.code);
    } catch {
      // No questions available for the chosen filters; the players land on
      // the match screen and the designated host can retry manually.
      return;
    }
    if (room.match.phase === "phase1" || room.match.phase === "semifinal" || room.match.phase === "final") {
      this.armButtons(room.match.code);
    }
    this.afterQuestionOpened(room);
  }

  // ---------------------------------------------------------------------
  // Fluxo automatico (sem apresentador): o servidor confere as respostas,
  // revela os clubes da carreira, encerra pergunta sem resposta e libera a
  // proxima sozinho. Ninguem precisa "julgar" nada.
  // ---------------------------------------------------------------------

  static RESULT_MS = 3500;
  static CLUB_REVEAL_MS = 7000;
  static CAREER_LAST_CLUB_MS = 15000;

  private setFlow(room: RoomRuntime, ms: number, fn: () => void): void {
    if (room.flowTimeout) clearTimeout(room.flowTimeout);
    room.flowTimeout = setTimeout(() => {
      room.flowTimeout = null;
      if (!this.rooms.has(room.match.code)) return;
      try {
        fn();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Fluxo automatico da sala falhou", err);
      }
    }, ms);
    room.flowTimeout.unref?.();
  }

  private clearFlow(room: RoomRuntime): void {
    if (room.flowTimeout) {
      clearTimeout(room.flowTimeout);
      room.flowTimeout = null;
    }
  }

  private setRevealed(room: RoomRuntime, answer: string | null): void {
    room.revealedAnswer = answer;
    this.emit("update", room.match);
  }

  private currentQuestion(room: RoomRuntime): Question | null {
    const m = room.match;
    const id = m.phase === "phase1" ? m.phase1?.currentQuestionId : m.phase === "semifinal" || m.phase === "final" ? m.bracketRound?.currentQuestionId : null;
    return id ? room.questionCache.get(id) ?? null : null;
  }

  private currentCareer(room: RoomRuntime): CareerQuestion | null {
    const id = room.match.phase === "career" ? room.match.career?.careerQuestionId : null;
    return id ? room.careerCache.get(id) ?? null : null;
  }

  /** Abre a proxima pergunta/carreira da fase em que a partida esta. */
  private openNext(room: RoomRuntime): void {
    const m = room.match;
    if (m.phase === "champion" || m.phase === "lobby") return;
    room.revealedAnswer = null;
    if (m.phase === "phase1" && m.phase1?.currentQuestionId) this.dispatch(room, { type: "ADVANCE_PHASE1_QUESTION" });
    if ((m.phase === "semifinal" || m.phase === "final") && m.bracketRound?.currentQuestionId) {
      this.dispatch(room, { type: "ADVANCE_BRACKET_QUESTION" });
    }
    if (room.match.phase === "career" && room.match.career?.careerQuestionId) this.dispatch(room, { type: "END_CAREER_ROUND" });
    try {
      this.releaseQuestion(room.match.code);
    } catch (err) {
      // Acabaram as perguntas: encerra a partida em vez de travar.
      // eslint-disable-next-line no-console
      console.error("Sem pergunta para liberar, encerrando a partida", err);
      this.dispatch(room, { type: "END_MATCH_FORCE", now: Date.now() });
      return;
    }
    if (room.match.phase !== "career") this.armButtons(room.match.code);
    this.afterQuestionOpened(room);
  }

  /** Agenda o que acontece se ninguem apertar o botao. */
  private afterQuestionOpened(room: RoomRuntime): void {
    const m = room.match;
    if (m.phase === "career") {
      this.scheduleClubReveal(room);
      return;
    }
    if (m.phase !== "phase1" && m.phase !== "semifinal" && m.phase !== "final") return;
    const q = this.currentQuestion(room);
    const words = q ? q.prompt.split(/\s+/).filter(Boolean).length : 0;
    const questionId = q?.id ?? null;
    this.setFlow(room, words * REVEAL_WORD_MS + m.settings.answerSeconds * 1000, () => {
      const fresh = room.match;
      const buzz = currentBuzzOf(fresh);
      if (this.currentQuestion(room)?.id !== questionId || !buzz || buzz.firstPlayerId || fresh.lastAnswer) return;
      this.dispatch(room, { type: "AUTO_SKIP" });
      this.setRevealed(room, q?.correctAnswer ?? null);
      this.setFlow(room, RoomManager.RESULT_MS, () => this.openNext(room));
    });
  }

  /** Revela o proximo clube a cada poucos segundos; sem acerto depois do
   * ultimo clube, mostra quem era e passa para a proxima carreira. */
  private scheduleClubReveal(room: RoomRuntime): void {
    const careerId = room.match.career?.careerQuestionId ?? null;
    if (!careerId) return;
    const c = room.careerCache.get(careerId);
    const allRevealed = !!c && (room.match.career?.revealedClubCount ?? 0) >= c.clubs.length;
    this.setFlow(room, allRevealed ? RoomManager.CAREER_LAST_CLUB_MS : RoomManager.CLUB_REVEAL_MS, () => {
      const fresh = room.match;
      if (fresh.phase !== "career" || fresh.career?.careerQuestionId !== careerId) return;
      if (fresh.career.buzz.firstPlayerId) {
        // Alguem esta respondendo: espera o resultado.
        this.scheduleClubReveal(room);
        return;
      }
      if (!allRevealed) {
        this.dispatch(room, { type: "REVEAL_NEXT_CLUB" });
        this.scheduleClubReveal(room);
        return;
      }
      this.setRevealed(room, c?.playerName ?? null);
      this.setFlow(room, RoomManager.RESULT_MS, () => this.openNext(room));
    });
  }

  /** Depois de uma resposta conferida (ou tempo esgotado). */
  private afterJudged(room: RoomRuntime, revealed: string | null): void {
    const m = room.match;
    if (m.phase === "champion") {
      this.clearFlow(room);
      this.setRevealed(room, revealed);
      return;
    }
    if (m.phase === "career" && m.career?.careerQuestionId && !m.lastAnswer?.correct) {
      // Errou na carreira: os outros continuam tentando com os mesmos clubes.
      if (m.career.buzz.armed) {
        this.scheduleClubReveal(room);
      } else {
        this.setRevealed(room, this.currentCareer(room)?.playerName ?? null);
        this.setFlow(room, RoomManager.RESULT_MS, () => this.openNext(room));
      }
      return;
    }
    this.setRevealed(room, revealed);
    this.setFlow(room, RoomManager.RESULT_MS, () => this.openNext(room));
  }

  /** Confere a resposta digitada contra o gabarito e aplica o resultado. */
  private autoJudge(room: RoomRuntime, playerId: string, answer: string): void {
    const q = this.currentQuestion(room);
    const c = this.currentCareer(room);
    let correct = false;
    let revealed: string | null = null;
    if (room.match.phase === "career" && c) {
      correct = answersMatch(answer, c.playerName, c.acceptedAnswers);
      revealed = c.playerName;
    } else if (q) {
      correct = answersMatch(answer, q.correctAnswer, q.acceptedAnswers);
      revealed = q.correctAnswer;
    }
    this.dispatch(room, { type: "HOST_JUDGE", playerId, correct, now: Date.now() });
    this.afterJudged(room, revealed);
  }

  static COUNTDOWN_MS = 10_000;

  /** Anfitriao apertou Iniciar: contagem de 10 s para todos e comeca. */
  startWithCountdown(code: string): void {
    const room = this.mustGet(code);
    const m = room.match;
    if (m.phase !== "lobby") throw new EngineError("Partida ja iniciada");
    if (m.countdownEndsAt) return;
    if (m.players.length < 2) throw new EngineError("Precisa de pelo menos 2 jogadores para comecar");
    const problem = teamsProblem(m);
    if (problem) throw new EngineError(problem);
    this.dispatch(room, { type: "SET_COUNTDOWN", endsAt: Date.now() + RoomManager.COUNTDOWN_MS });
    this.setFlow(room, RoomManager.COUNTDOWN_MS, () => {
      if (room.match.phase !== "lobby") return;
      if (room.match.players.length < 2) {
        this.dispatch(room, { type: "SET_COUNTDOWN", endsAt: null });
        return;
      }
      this.autoStart(room);
    });
  }

  setTeamName(code: string, team: TeamKey, name: string): void {
    const room = this.mustGet(code);
    if (team !== "A" && team !== "B") throw new EngineError("Equipe invalida");
    this.dispatch(room, { type: "SET_TEAM_NAME", team, name: String(name ?? "") });
  }

  movePlayer(code: string, playerId: string, direction: -1 | 1): void {
    const room = this.mustGet(code);
    this.dispatch(room, { type: "MOVE_PLAYER", playerId, direction: direction === -1 ? -1 : 1 });
  }

  /** Anfitriao remove alguem da sala antes de comecar. */
  kickPlayer(code: string, playerId: string, byUserId: string): void {
    const room = this.mustGet(code);
    if (room.match.phase !== "lobby") throw new EngineError("So da para remover jogadores antes de a partida comecar");
    const target = room.match.players.find((p) => p.id === playerId);
    if (!target) return;
    if (target.userId === byUserId) throw new EngineError("Voce nao pode remover a si mesmo");
    this.leavePlayer(code, playerId);
    this.emit("kicked", room.match.code, playerId);
  }

  setConnected(code: string, playerId: string, connected: boolean): void {
    const room = this.mustGet(code);
    this.dispatch(room, { type: "SET_CONNECTED", playerId, connected });
  }

  /** Voluntarily leaves the room pre-start, freeing the slot for someone else. */
  leavePlayer(code: string, playerId: string): void {
    const room = this.mustGet(code);
    this.snapshot(room);
    this.dispatch(room, { type: "LEAVE_PLAYER", playerId });
    for (const [userId, pid] of room.playerIdByUserId) {
      if (pid === playerId) {
        room.playerIdByUserId.delete(userId);
        break;
      }
    }
    if (room.match.countdownEndsAt && room.match.players.length < 2) {
      this.clearFlow(room);
      this.dispatch(room, { type: "SET_COUNTDOWN", endsAt: null });
    }
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
    const userIds = match.players.map((p) => p.userId);
    if (match.phase === "phase1") {
      const q = pickRandomQuestion({
        categories: match.settings.categories,
        difficulties: match.settings.difficulties,
        excludeIds: match.phase1!.usedQuestionIds,
        avoidSeenBy: userIds,
      });
      if (!q) throw new EngineError("Nao ha mais perguntas disponiveis com esses filtros");
      insertQuestionConsumption(q.category, q.difficulty, q.id);
      room.questionCache.set(q.id, q);
      markSeen(userIds, "q", q.id);
      this.dispatch(room, { type: "RELEASE_PHASE1_QUESTION", question: q, now: Date.now() });
    } else if (match.phase === "semifinal" || match.phase === "final") {
      const q = pickRandomQuestion({
        categories: match.settings.categories,
        difficulties: match.settings.difficulties,
        excludeIds: match.bracketRound?.usedQuestionIds ?? [],
        avoidSeenBy: userIds,
      });
      if (!q) throw new EngineError("Nao ha mais perguntas disponiveis com esses filtros");
      insertQuestionConsumption(q.category, q.difficulty, q.id);
      room.questionCache.set(q.id, q);
      markSeen(userIds, "q", q.id);
      this.dispatch(room, { type: "RELEASE_BRACKET_QUESTION", question: q, now: Date.now() });
    } else if (match.phase === "career") {
      const c = pickRandomCareerQuestion({
        themes: match.settings.careerThemes ?? [],
        difficulties: match.settings.difficulties,
        excludeIds: room.usedCareerQuestionIds,
        avoidSeenBy: userIds,
      });
      if (!c) throw new EngineError("Nao ha mais carreiras disponiveis no banco de perguntas");
      room.usedCareerQuestionIds.push(c.id);
      room.careerCache.set(c.id, c);
      markSeen(userIds, "c", c.id);
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

  playerBuzz(code: string, playerId: string, visibleWords?: number): void {
    const room = this.mustGet(code);
    // The reducer is pure and only sees MatchState (no question text), so
    // the word count used to freeze the reveal has to be computed here,
    // from whichever question is actually cached for the active phase --
    // career buzzes don't use word-by-word reveal at all (clubs reveal
    // one at a time instead), so 0 there is inert, never read by the UI.
    const currentQuestionId =
      room.match.phase === "phase1"
        ? room.match.phase1?.currentQuestionId
        : room.match.phase === "semifinal" || room.match.phase === "final"
          ? room.match.bracketRound?.currentQuestionId
          : null;
    const totalWords = currentQuestionId
      ? (room.questionCache.get(currentQuestionId)?.prompt.split(/\s+/).filter(Boolean).length ?? 0)
      : 0;
    this.dispatch(room, { type: "PLAYER_BUZZ", playerId, now: Date.now(), totalWords, visibleWords });
    const buzz = currentBuzzOf(room.match);
    if (buzz?.firstPlayerId === playerId && room.match.timer) {
      this.clearPendingTimeout(room);
      const seconds = room.match.timer.seconds;
      const revealed = room.match.phase === "career" ? this.currentCareer(room)?.playerName ?? null : this.currentQuestion(room)?.correctAnswer ?? null;
      room.pendingTimeout = setTimeout(() => {
        room.pendingTimeout = null;
        const fresh = room.match;
        const b = currentBuzzOf(fresh);
        if (b?.firstPlayerId === playerId && (fresh.lastAnswer === null || fresh.lastAnswer.playerId !== playerId || fresh.lastAnswer.pointsAwardedTo !== null)) {
          this.dispatch(room, { type: "TIMEOUT", now: Date.now() });
          this.afterJudged(room, revealed);
        }
      }, seconds * 1000 + 150);
    }
  }

  submitAnswer(code: string, playerId: string, answer: string): void {
    const room = this.mustGet(code);
    this.clearPendingTimeout(room);
    this.dispatch(room, { type: "SUBMIT_ANSWER", playerId, answer });
    this.autoJudge(room, playerId, answer);
  }

  requestSkip(code: string, playerId: string): void {
    const room = this.mustGet(code);
    this.dispatch(room, { type: "REQUEST_SKIP", playerId });
    if (room.match.lastAnswer?.skipped) {
      this.setRevealed(room, this.currentQuestion(room)?.correctAnswer ?? null);
      this.setFlow(room, RoomManager.RESULT_MS, () => this.openNext(room));
    }
  }

  hostJudge(code: string, playerId: string, correct: boolean): void {
    const room = this.mustGet(code);
    this.snapshot(room);
    this.clearPendingTimeout(room);
    this.dispatch(room, { type: "HOST_JUDGE", playerId, correct, now: Date.now() });
    this.afterJudged(room, this.currentQuestion(room)?.correctAnswer ?? this.currentCareer(room)?.playerName ?? null);
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

/** Com 4+ jogadores as equipes precisam ficar equilibradas (5x5, 4x4, 3x2...). */
export function teamsProblem(match: MatchState): string | null {
  const n = match.players.length;
  if (n < 4) return null;
  const a = match.players.filter((p) => p.teamId === "A").length;
  const b = match.players.filter((p) => p.teamId === "B").length;
  const max = Math.ceil(n / 2);
  if (a > max || b > max) {
    return `Equipes desequilibradas (${a} x ${b}). Com ${n} jogadores, deixe ${max} x ${n - max}.`;
  }
  return null;
}

function currentBuzzOf(match: MatchState) {
  if (match.phase === "phase1") return match.phase1?.buzz ?? null;
  if (match.phase === "career") return match.career?.buzz ?? null;
  if (match.phase === "semifinal" || match.phase === "final") return match.bracketRound?.buzz ?? null;
  return null;
}

export const roomManager = new RoomManager();
