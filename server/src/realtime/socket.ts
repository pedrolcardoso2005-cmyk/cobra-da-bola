import type { Server, Socket } from "socket.io";
import { z } from "zod";
import {
  ANSWER_SECONDS_OPTIONS,
  type ClientToServerEvents,
  type MatchState,
  type ServerToClientEvents,
} from "@cobra/shared";
import { verifyToken } from "../auth/auth.js";
import { findUserById } from "../db/users.js";
import { roomManager } from "../game/rooms.js";
import { matchmakingManager } from "../game/matchmaking.js";
import { EngineError } from "../game/engine.js";
import { buildPlayerView, careerClubsRevealed, toHostQuestionView, toPublicQuestion } from "../game/view.js";
import { socketClosed, socketOpened } from "../admin/presence.js";

interface SocketData {
  userId: string;
  displayName: string;
  code: string | null;
  role: "player" | "screen" | "host" | null;
  playerId: string | null;
}

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

export function registerSocketHandlers(io: Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("unauthorized"));
    const payload = verifyToken(token);
    if (!payload) return next(new Error("unauthorized"));
    const user = findUserById(payload.sub);
    if (!user) return next(new Error("unauthorized"));
    socket.data.userId = user.id;
    socket.data.displayName = user.display_name;
    socket.data.code = null;
    socket.data.role = null;
    socket.data.playerId = null;
    next();
  });

  roomManager.on("update", (match: MatchState) => broadcastRoom(io, match));
  roomManager.on("kicked", (code: string, playerId: string) => {
    const roomName = `${code}:player:${playerId}`;
    io.to(roomName).emit("room:kicked");
    io.in(roomName).socketsLeave([code, roomName]);
  });

  io.on("connection", (socket: AppSocket) => {
    socketOpened(socket.data.userId);
    socket.on("disconnect", () => socketClosed(socket.data.userId));
    socket.on("room:create", (payload, ack) => {
      try {
        const schema = z.object({
          answerSeconds: z.number().refine((v) => (ANSWER_SECONDS_OPTIONS as number[]).includes(v)),
          categories: z.array(z.string()).min(0).optional(),
          difficulties: z.array(z.string()).min(0).optional(),
          careerThemes: z.array(z.string()).min(0).optional(),
          targetCount: z.number().int().min(2).max(12),
        });
        const parsed = schema.parse(payload);
        const room = roomManager.createRoom(socket.data.userId, {
          answerSeconds: parsed.answerSeconds as any,
          // Tema e dificuldade nao sao mais escolhidos: toda partida sorteia
          // do banco inteiro, mesmo que um cliente antigo mande filtros.
          categories: ["aleatorio"],
          difficulties: [],
          careerThemes: ["aleatorio"],
          kind: "casual",
          targetCount: parsed.targetCount,
        });
        ack({ ok: true, code: room.match.code });
      } catch (err) {
        ack({ ok: false, error: errorMessage(err) });
      }
    });

    socket.on("room:join", (payload, ack) => {
      try {
        const room = roomManager.getRoom(payload.code);
        if (!room) {
          ack({ ok: false, error: "Sala nao encontrada" });
          return;
        }
        socket.data.code = room.match.code;
        socket.data.role = payload.role;
        socket.join(room.match.code);

        if (payload.role === "host") {
          if (room.match.hostUserId !== socket.data.userId) {
            ack({ ok: false, error: "Apenas o anfitriao pode abrir o painel do apresentador" });
            return;
          }
          socket.join(`${room.match.code}:host`);
        } else if (payload.role === "screen") {
          socket.join(`${room.match.code}:screen`);
        } else {
          const user = findUserById(socket.data.userId)!;
          const { playerId } = roomManager.addOrReconnectPlayer(room.match.code, {
            userId: user.id,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
          });
          socket.data.playerId = playerId;
          socket.join(`${room.match.code}:player:${playerId}`);
          // Sem apresentador: quem criou a sala e so mais um jogador e nunca
          // recebe o gabarito. O servidor confere as respostas sozinho.
        }
        ack({ ok: true });
        broadcastRoom(io, roomManager.getRoom(room.match.code)!.match);
      } catch (err) {
        ack({ ok: false, error: errorMessage(err) });
      }
    });

    socket.on("room:setTeams", (payload) => guardedHost(socket, () => roomManager.setTeams(socket.data.code!, payload.assignments)));
    socket.on("room:start", () => guardedHost(socket, () => roomManager.startWithCountdown(socket.data.code!)));
    socket.on("room:kick", (payload) =>
      guardedHost(socket, () => roomManager.kickPlayer(socket.data.code!, String(payload?.playerId ?? ""), socket.data.userId)),
    );
    socket.on("room:pause", () => guardedHost(socket, () => roomManager.pause(socket.data.code!)));
    socket.on("room:resume", () => guardedHost(socket, () => roomManager.resume(socket.data.code!)));
    socket.on("room:leave", () =>
      guarded(socket, () => {
        roomManager.leavePlayer(socket.data.code!, socket.data.playerId!);
        socket.leave(socket.data.code!);
        socket.leave(`${socket.data.code}:player:${socket.data.playerId}`);
        socket.data.code = null;
        socket.data.playerId = null;
        socket.data.role = null;
      }),
    );

    socket.on("host:releaseQuestion", () => guardedHost(socket, () => roomManager.releaseQuestion(socket.data.code!)));
    socket.on("host:armButtons", () => guardedHost(socket, () => roomManager.armButtons(socket.data.code!)));
    socket.on("host:revealNextClub", () => guardedHost(socket, () => roomManager.revealNextClub(socket.data.code!)));
    socket.on("host:judge", (payload) => guardedHost(socket, () => roomManager.hostJudge(socket.data.code!, payload.playerId, payload.correct)));
    socket.on("host:endCareerRound", () => guardedHost(socket, () => roomManager.endCareerRound(socket.data.code!)));
    socket.on("host:advance", () => guardedHost(socket, () => roomManager.advance(socket.data.code!)));
    socket.on("host:adjustScore", (payload) => guardedHost(socket, () => roomManager.adjustScore(socket.data.code!, payload.teamOrPlayerId, payload.delta)));
    socket.on("host:undo", () => guardedHost(socket, () => roomManager.undo(socket.data.code!)));
    socket.on("host:endMatch", () => guardedHost(socket, () => roomManager.endMatchForce(socket.data.code!)));

    socket.on("player:buzz", () => guarded(socket, () => roomManager.playerBuzz(socket.data.code!, socket.data.playerId!)));
    socket.on("player:submitAnswer", (payload) =>
      guarded(socket, () => roomManager.submitAnswer(socket.data.code!, socket.data.playerId!, payload.answer)),
    );
    socket.on("player:requestSkip", () => guarded(socket, () => roomManager.requestSkip(socket.data.code!, socket.data.playerId!)));

    socket.on("matchmaking:enter", (payload, ack) => {
      try {
        const count = Math.round(payload.targetCount);
        if (count < 2 || count > 12) throw new EngineError("Numero de participantes deve ser entre 2 e 12");
        if (!(ANSWER_SECONDS_OPTIONS as number[]).includes(payload.answerSeconds)) throw new EngineError("Tempo de resposta invalido");
        matchmakingManager.enter(socket, socket.data.userId, count, payload.answerSeconds);
        ack({ ok: true });
      } catch (err) {
        ack({ ok: false, error: errorMessage(err) });
      }
    });
    socket.on("matchmaking:cancel", () => matchmakingManager.leaveAll(socket.data.userId));

    socket.on("disconnect", () => {
      matchmakingManager.removeSocket(socket.id);
      if (socket.data.code && socket.data.playerId) {
        try {
          const room = roomManager.getRoom(socket.data.code);
          if (room && room.match.phase === "lobby") {
            // Still in the lobby: free the slot so someone else can take it,
            // instead of leaving a permanently-reserved, never-connecting seat.
            roomManager.leavePlayer(socket.data.code, socket.data.playerId);
          } else {
            roomManager.setConnected(socket.data.code, socket.data.playerId, false);
          }
        } catch {
          /* room may already be gone */
        }
      }
    });
  });
}

function guarded(socket: AppSocket, fn: () => void): void {
  try {
    if (!socket.data.code) throw new EngineError("Entre em uma sala primeiro");
    fn();
  } catch (err) {
    socket.emit("error", { message: errorMessage(err) });
  }
}

/** Same as `guarded`, but only lets through the room's actual host
 * (the match's hostUserId) -- regardless of whether they're connected via
 * a dedicated presenter tab or their own player tab. */
function guardedHost(socket: AppSocket, fn: () => void): void {
  guarded(socket, () => {
    const room = roomManager.getRoom(socket.data.code!);
    if (!room || room.match.hostUserId !== socket.data.userId) {
      throw new EngineError("Apenas o anfitriao pode fazer isso");
    }
    fn();
  });
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Erro desconhecido";
}

function broadcastRoom(io: Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>, match: MatchState) {
  const room = roomManager.getRoom(match.code);
  if (!room) return;
  io.to(match.code).emit("room:state", { match });

  const currentQuestionId = match.phase1?.currentQuestionId ?? match.bracketRound?.currentQuestionId ?? null;
  const question = currentQuestionId ? room.questionCache.get(currentQuestionId) ?? null : null;
  const careerQuestion = match.career?.careerQuestionId ? room.careerCache.get(match.career.careerQuestionId) ?? null : null;

  io.to(match.code).emit("room:question", {
    question: question ? toPublicQuestion(question) : null,
    careerClubs: careerClubsRevealed(careerQuestion, match.career?.revealedClubCount ?? 0),
    revealedAnswer: room.revealedAnswer,
  });

  io.to(`${match.code}:host`).emit("host:answerKey", {
    question: question ? toHostQuestionView(question) : null,
    careerPlayerName: careerQuestion?.playerName ?? null,
  });

  const now = Date.now();
  for (const player of match.players) {
    const view = buildPlayerView(match, player.id, question, now);
    io.to(`${match.code}:player:${player.id}`).emit("player:view", view);
  }
}
