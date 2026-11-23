// Career bank (500 players) + admin summary.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import os from "node:os";

process.env.DB_PATH = `${os.tmpdir()}/cobra-career-admin-test-${process.pid}-${Date.now()}.db`;

const { ALL_BANK_CAREERS, careerSlug, loadCareerBank } = await import("../src/questions/careers/index.js");
const { seedDatabase } = await import("../src/questions/seed.js");
const { listCareerQuestions, pickRandomCareerQuestion } = await import("../src/db/questions.js");
const { buildAdminSummary } = await import("../src/admin/routes.js");
const { touchUser, socketOpened, socketClosed, resetPresence } = await import("../src/admin/presence.js");
const { db } = await import("../src/db/db.js");
const { recordVisit, visitStats, spDay, allowVisit, resetVisitLimits } = await import("../src/admin/visits.js");

describe("banco de carreiras", () => {
  it("tem 500 jogadores, sem repetir, todos com 2+ clubes", () => {
    assert.equal(ALL_BANK_CAREERS.length, 500);
    const slugs = new Set(ALL_BANK_CAREERS.map((c) => careerSlug(c.playerName)));
    assert.equal(slugs.size, 500);
    for (const c of ALL_BANK_CAREERS) {
      assert.ok(c.clubs.length >= 2, c.playerName);
      for (const club of c.clubs) assert.ok(club.trim().length > 0, c.playerName);
    }
  });

  it("carrega uma vez, nao duplica os 13 originais e e idempotente", () => {
    seedDatabase();
    const before = listCareerQuestions().length;
    const first = loadCareerBank();
    const after = listCareerQuestions().length;
    assert.equal(after - before, first.inserted);
    assert.ok(after >= 500, `esperava 500+ carreiras, veio ${after}`);
    const names = listCareerQuestions().map((c) => c.playerName.toLowerCase());
    assert.equal(new Set(names).size, names.length, "jogador repetido no banco");
    const second = loadCareerBank();
    assert.equal(second.inserted, 0);
    assert.equal(listCareerQuestions().length, after);
  });

  it("sorteia sem filtro de tema/dificuldade", () => {
    const c = pickRandomCareerQuestion({ themes: ["aleatorio"], difficulties: [], excludeIds: [] });
    assert.ok(c);
  });
});

describe("painel admin", () => {
  it("conta usuarios, novos e online", () => {
    resetPresence();
    const now = Date.now();
    db.prepare("INSERT INTO users (id, email, password_hash, display_name, created_at) VALUES (?, ?, 'x', ?, ?)").run("u1", "a@x.com", "Ana", now);
    db.prepare("INSERT INTO users (id, email, password_hash, display_name, created_at) VALUES (?, ?, 'x', ?, ?)").run("u2", "b@x.com", "Beto", now - 10 * 86_400_000);
    touchUser("u1");
    socketOpened("u2");
    let s = buildAdminSummary();
    assert.equal(s.usuarios.total, 2);
    assert.equal(s.usuarios.novos24h, 1);
    assert.equal(s.usuarios.novos7d, 1);
    assert.equal(s.atividade.onlineAgora, 2);
    assert.equal(s.ultimosCadastros[0].nome, "Ana");
    socketClosed("u2");
    s = buildAdminSummary();
    assert.equal(s.atividade.onlineAgora, 2, "quem acabou de sair ainda conta nos ultimos 5 min");
  });
});

describe("contador de visitas", () => {
  it("conta visitantes unicos e paginas por dia", () => {
    const now = Date.UTC(2026, 10, 23, 15, 0, 0);
    recordVisit("visitante-aaa", now);
    recordVisit("visitante-aaa", now + 1000);
    recordVisit("visitante-bbb", now);
    recordVisit("visitante-aaa", now - 3 * 86_400_000);
    const s = visitStats(now);
    assert.equal(s.hoje.visitantes, 2);
    assert.equal(s.hoje.paginas, 3);
    assert.equal(s.visitantes7d, 2);
    assert.equal(s.porDia.length, 14);
    assert.equal(s.porDia[13].dia, spDay(now));
  });

  it("usa o dia de Sao Paulo (01h UTC ainda e o dia anterior)", () => {
    assert.equal(spDay(Date.UTC(2026, 10, 24, 1, 0, 0)), "2026-11-23");
  });
});

describe("limite do contador de visitas", () => {
  it("bloqueia spam do mesmo IP", () => {
    resetVisitLimits();
    const now = Date.now();
    let ok = 0;
    for (let i = 0; i < 50; i++) if (allowVisit("1.2.3.4", "visitante-x", now)) ok++;
    assert.equal(ok, 30);
    assert.equal(allowVisit("5.6.7.8", "visitante-y", now), true, "outro IP nao e afetado");
    resetVisitLimits();
    let ids = 0;
    for (let i = 0; i < 400; i++) if (allowVisit("9.9.9.9", `visitante-${i}`, Date.UTC(2026, 10, 23, 4, 0, 0) + i * 61_000)) ids++;
    assert.equal(ids, 300);
  });
});
