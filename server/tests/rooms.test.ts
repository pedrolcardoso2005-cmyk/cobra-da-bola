// Covers the room lobby's auto-start behaviour (server-authoritative, no
// human "host" required to begin the match): the room fills to its exact
// targetCount, starts itself, and releases/arms the first question in the
// same stroke -- plus the guards around it (no overfill, no double start,
// leaving before start frees the slot, can't leave mid-match).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { MatchSettings } from "@cobra/shared";
import { roomManager } from "../src/game/rooms.js";
import { EngineError } from "../src/game/engine.js";

function mkSettings(targetCount: number): MatchSettings {
  return { answerSeconds: 10, categories: ["aleatorio"], difficulties: [], kind: "casual", targetCount };
}

let nextUserId = 0;
function join(code: string, displayName: string) {
  nextUserId += 1;
  return roomManager.addOrReconnectPlayer(code, { userId: `u-${nextUserId}`, displayName, avatarUrl: null });
}

describe("lobby auto-start ao atingir a quantidade exata de jogadores", () => {
  it("n=4: comeca sozinho no 4o jogador, com a 1a pergunta ja liberada e armada para todos", () => {
    const room = roomManager.createRoom("host-a", mkSettings(4));
    const code = room.match.code;

    for (let i = 0; i < 3; i++) {
      join(code, `P${i}`);
      assert.equal(roomManager.getRoom(code)!.match.phase, "lobby", `nao deveria comecar com ${i + 1}/4 jogadores`);
    }

    join(code, "P3");

    const match = roomManager.getRoom(code)!.match;
    assert.equal(match.players.length, 4);
    assert.notEqual(match.phase, "lobby", "a partida devia ter comecado sozinha ao atingir 4/4, sem acao de host");
    assert.ok(match.teams, "4 jogadores formam equipes automaticamente");

    // Sincronizacao: a mesma transicao que iniciou a partida ja deixa a
    // primeira pergunta liberada e os botoes armados no estado que vai ser
    // transmitido a todo mundo -- nenhum jogador fica esperando uma
    // segunda acao manual de alguem para comecar a responder.
    assert.ok(match.phase1?.currentQuestionId, "a 1a pergunta devia estar liberada automaticamente");
    assert.equal(match.phase1?.buzz.armed, true, "os botoes deviam estar liberados automaticamente");
  });

  it("n=2: vai direto para a final e ja libera a 1a pergunta sozinho", () => {
    const room = roomManager.createRoom("host-b", mkSettings(2));
    const code = room.match.code;
    join(code, "A");
    join(code, "B");

    const match = roomManager.getRoom(code)!.match;
    assert.equal(match.phase, "final");
    assert.ok(match.bracketRound?.currentQuestionId);
    assert.equal(match.bracketRound?.buzz.armed, true);
  });

  it("nao deixa mais ninguem entrar depois que a sala enche, nem comecar duas vezes", () => {
    const room = roomManager.createRoom("host-c", mkSettings(2));
    const code = room.match.code;
    join(code, "A");
    join(code, "B");

    assert.throws(() => join(code, "C"), EngineError);
    assert.throws(() => roomManager.startMatch(code), EngineError);
  });

  it("se alguem sair antes de comecar, libera a vaga para outra pessoa", () => {
    const room = roomManager.createRoom("host-d", mkSettings(2));
    const code = room.match.code;
    const { playerId } = join(code, "X");

    roomManager.leavePlayer(code, playerId);
    let match = roomManager.getRoom(code)!.match;
    assert.equal(match.players.length, 0);
    assert.equal(match.phase, "lobby");

    join(code, "Y");
    join(code, "Z");
    match = roomManager.getRoom(code)!.match;
    assert.equal(match.players.length, 2);
    assert.notEqual(match.phase, "lobby");
  });

  it("nao permite sair depois que a partida ja comecou", () => {
    const room = roomManager.createRoom("host-e", mkSettings(2));
    const code = room.match.code;
    const { playerId } = join(code, "M");
    join(code, "N");
    assert.notEqual(roomManager.getRoom(code)!.match.phase, "lobby");
    assert.throws(() => roomManager.leavePlayer(code, playerId), EngineError);
  });
});
