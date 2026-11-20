// Tests for the Desafio das Carreiras theme/difficulty filtering added on
// top of the existing career-question storage. Runs against a throwaway
// SQLite file in the OS temp dir -- see ai-pipeline.test.ts for why a
// *static* import of db-touching modules here would silently fall back to
// the real dev database instead of this one; dynamic import after setting
// DB_PATH sidesteps that.
import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import os from "node:os";
import type { CareerQuestion } from "@cobra/shared";

const dbPath = `${os.tmpdir()}/cobra-career-questions-test-${process.pid}-${Date.now()}.db`;
process.env.DB_PATH = dbPath;

const { insertCareerQuestion, pickRandomCareerQuestion, backfillCareerMetadata, listCareerQuestions } = await import(
  "../src/db/questions.js"
);
const { db } = await import("../src/db/db.js");

after(() => {
  db.close();
  try {
    for (const suffix of ["", "-wal", "-shm"]) rmSync(`${dbPath}${suffix}`, { force: true });
  } catch {
    // best-effort, see ai-pipeline.test.ts
  }
});

function career(overrides: Partial<Omit<CareerQuestion, "id">> = {}): Omit<CareerQuestion, "id"> {
  return {
    clubs: ["Clube A", "Clube B"],
    playerName: "Jogador Teste",
    ...overrides,
  };
}

describe("pickRandomCareerQuestion", () => {
  it("sem filtro (themes/difficulties vazios), qualquer carreira aprovada pode sair", () => {
    const a = insertCareerQuestion(career({ playerName: "A", theme: "brasileiros", difficulty: "facil" }));
    const b = insertCareerQuestion(career({ playerName: "B", theme: "europeus", difficulty: "dificil" }));

    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const picked = pickRandomCareerQuestion({ themes: [], difficulties: [], excludeIds: [] });
      assert.ok(picked);
      seen.add(picked!.id);
    }
    assert.ok(seen.has(a.id) || seen.has(b.id));
  });

  it("filtra por tema, ignorando carreiras sem esse tema", () => {
    // Temas usados aqui nao se repetem em nenhum outro teste deste arquivo
    // de proposito: todos os "it" compartilham o mesmo banco temporario
    // (sem limpeza entre eles), entao um tema repetido faria o pool da
    // asercao incluir linhas inseridas por um teste anterior.
    const sa = insertCareerQuestion(career({ playerName: "SA1", theme: "sul_americanos", difficulty: "facil" }));
    insertCareerQuestion(career({ playerName: "NA1", theme: "norte_americanos", difficulty: "facil" }));

    for (let i = 0; i < 10; i++) {
      const picked = pickRandomCareerQuestion({ themes: ["sul_americanos"], difficulties: [], excludeIds: [] });
      assert.equal(picked?.id, sa.id);
    }
  });

  it("'aleatorio' no filtro de tema equivale a nenhum filtro (qualquer tema serve)", () => {
    insertCareerQuestion(career({ playerName: "X1", theme: "asiaticos", difficulty: "medio" }));
    insertCareerQuestion(career({ playerName: "X2", theme: "idolos", difficulty: "medio" }));

    const seen = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const picked = pickRandomCareerQuestion({ themes: ["aleatorio"], difficulties: ["medio"], excludeIds: [] });
      assert.ok(picked);
      seen.add(picked!.playerName);
    }
    assert.ok(seen.has("X1") && seen.has("X2"), "deveria sortear entre os dois temas diferentes");
  });

  it("filtra por dificuldade", () => {
    const facil = insertCareerQuestion(career({ playerName: "FAC", theme: "campeoes", difficulty: "facil" }));
    insertCareerQuestion(career({ playerName: "DIF", theme: "campeoes", difficulty: "dificil" }));

    for (let i = 0; i < 10; i++) {
      const picked = pickRandomCareerQuestion({ themes: ["campeoes"], difficulties: ["facil"], excludeIds: [] });
      assert.equal(picked?.id, facil.id);
    }
  });

  it("carreira sem tema/dificuldade (NULL) nunca sai quando ha filtro ativo", () => {
    insertCareerQuestion(career({ playerName: "SemTema" })); // nem theme nem difficulty
    const picked = pickRandomCareerQuestion({ themes: ["historicos"], difficulties: [], excludeIds: [] });
    assert.equal(picked, null);
  });

  it("respeita excludeIds", () => {
    const only = insertCareerQuestion(career({ playerName: "Unico", theme: "icones_atuais", difficulty: "impossivel" }));
    const picked = pickRandomCareerQuestion({ themes: ["icones_atuais"], difficulties: [], excludeIds: [only.id] });
    assert.equal(picked, null);
  });
});

describe("backfillCareerMetadata", () => {
  it("preenche theme/difficulty so quando estao NULL, sem sobrescrever valor ja definido", () => {
    insertCareerQuestion(career({ playerName: "Backfill1" })); // sem metadata
    const manual = insertCareerQuestion(career({ playerName: "Backfill2", theme: "europeus", difficulty: "medio" }));

    backfillCareerMetadata("Backfill1", "norte_americanos", "impossivel");
    backfillCareerMetadata("Backfill2", "brasileiros", "facil"); // nao deveria mudar nada

    const rows = listCareerQuestions();
    const r1 = rows.find((r) => r.playerName === "Backfill1");
    const r2 = rows.find((r) => r.playerName === "Backfill2");
    assert.equal(r1?.theme, "norte_americanos");
    assert.equal(r1?.difficulty, "impossivel");
    assert.equal(r2?.id, manual.id);
    assert.equal(r2?.theme, "europeus");
    assert.equal(r2?.difficulty, "medio");
  });
});
