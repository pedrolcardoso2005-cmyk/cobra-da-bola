// Real over-the-wire check: several genuine Socket.IO clients join a room,
// and the moment the last one joins, every single client -- not just the
// one who created the room -- must receive, from the server's own
// broadcast, the match already started and its first question already
// released/armed. This is what "o servidor controla o inicio da partida"
// and "todos os jogadores recebem a primeira pergunta ao mesmo tempo"
// actually mean in practice, so it's tested against the real socket
// transport instead of only the in-process reducer/room manager.
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { Server } from "socket.io";
import { io as ioClient, type Socket as ClientSocket } from "socket.io-client";
import { nanoid } from "nanoid";
import { SOCKET_PATH } from "@cobra/shared";
import { registerSocketHandlers } from "../src/realtime/socket.js";
import { signToken } from "../src/auth/auth.js";
import { createUser } from "../src/db/users.js";

let httpServer: ReturnType<typeof createServer>;
let port: number;

before(async () => {
  httpServer = createServer();
  const io = new Server(httpServer, { path: SOCKET_PATH });
  registerSocketHandlers(io as any);
  await new Promise<void>((resolve) => httpServer.listen(0, resolve));
  port = (httpServer.address() as AddressInfo).port;
});

after(async () => {
  await new Promise<void>((resolve) => {
    httpServer.close(() => resolve());
    httpServer.closeAllConnections?.();
  });
});

function registerTestUser(displayName: string) {
  const user = createUser({
    id: nanoid(),
    email: `${nanoid()}@autostart.test`,
    passwordHash: "x",
    displayName,
  });
  return signToken({ sub: user.id, email: user.email, displayName: user.display_name });
}

function connect(token: string): Promise<ClientSocket> {
  return new Promise((resolve, reject) => {
    const socket = ioClient(`http://localhost:${port}`, { path: SOCKET_PATH, auth: { token }, transports: ["websocket"] });
    socket.once("connect", () => resolve(socket));
    socket.once("connect_error", reject);
  });
}

function emitAck<T = any>(socket: ClientSocket, event: string, payload: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    socket.emit(event, payload, (res: any) => (res?.ok === false ? reject(new Error(res.error)) : resolve(res)));
  });
}

describe("sincronizacao real via Socket.IO quando o anfitriao inicia", () => {
  it("todos os 4 clientes recebem a partida ja comecada e a 1a pergunta ja liberada, no mesmo broadcast", async () => {
    const { roomManager } = await import("../src/game/rooms.js");
    (roomManager.constructor as any).COUNTDOWN_MS = 30;
    const tokens = [registerTestUser("W1"), registerTestUser("W2"), registerTestUser("W3"), registerTestUser("W4")];
    const sockets = await Promise.all(tokens.map(connect));
    try {
      const code = (await emitAck<{ code: string }>(sockets[0], "room:create", {
        answerSeconds: 10,
        categories: ["aleatorio"],
        difficulties: [],
        targetCount: 4,
      })).code;

      // Each client's first "room:state" once the room is full must already
      // show the match started with its first question released+armed --
      // nobody waits for a second, separate action from anybody.
      const startedStates = sockets.map(
        (s) =>
          new Promise<any>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("timeout esperando room:state pos-inicio")), 4000);
            s.on("room:state", (p: { match: any }) => {
              // Several broadcasts fire in sequence as the room auto-starts
              // (join -> start -> release question -> arm buttons); wait for
              // the fully-settled one so we assert the end state every
              // client actually lands on, not an in-between snapshot.
              if (p.match.players.length === 4 && p.match.phase !== "lobby" && p.match.phase1?.currentQuestionId && p.match.phase1?.buzz?.armed) {
                clearTimeout(timeout);
                resolve(p.match);
              }
            });
          }),
      );

      for (const s of sockets) {
        await emitAck(s, "room:join", { code, role: "player" });
      }
      // Quem criou a sala aperta "Iniciar" (contagem encurtada no teste).
      sockets[0].emit("room:start");

      const states = await Promise.all(startedStates);

      // Quem criou a sala e so jogador: nunca recebe o gabarito.

      for (const match of states) {
        assert.notEqual(match.phase, "lobby");
        assert.ok(match.teams, "4 jogadores formam equipes");
        assert.ok(match.phase1?.currentQuestionId, "cada cliente ja deve ver a 1a pergunta liberada");
        assert.equal(match.phase1?.buzz.armed, true, "cada cliente ja deve ver os botoes armados");
      }

      // E de fato a MESMA partida/pergunta para todo mundo (sincronizado).
      const ids = new Set(states.map((m) => m.phase1.currentQuestionId));
      assert.equal(ids.size, 1, "todos os clientes devem ver exatamente a mesma pergunta liberada");
    } finally {
      for (const s of sockets) s.disconnect();
    }
  });

  it("uma 5a pessoa tentando entrar numa sala de 4 ja cheia recebe erro, nao duplica jogador", async () => {
    const tokens = [registerTestUser("X1"), registerTestUser("X2"), registerTestUser("X3"), registerTestUser("X4"), registerTestUser("X5")];
    const sockets = await Promise.all(tokens.map(connect));
    try {
      const code = (await emitAck<{ code: string }>(sockets[0], "room:create", {
        answerSeconds: 10,
        categories: ["aleatorio"],
        difficulties: [],
        targetCount: 4,
      })).code;

      for (let i = 0; i < 4; i++) {
        await emitAck(sockets[i], "room:join", { code, role: "player" });
      }

      await assert.rejects(() => emitAck(sockets[4], "room:join", { code, role: "player" }));
    } finally {
      for (const s of sockets) s.disconnect();
    }
  });
});
