// Investigacao pos-Fase-6: perguntas "impossivel" nao pareciam mais dificeis
// que "dificil" porque o prompt enviado a IA so continha a palavra solta da
// dificuldade, sem nenhuma calibracao -- o modelo nao tinha como saber o
// quanto mais extremo "impossivel" deveria ser. generate.ts agora exporta
// DIFFICULTY_GUIDANCE (uma descricao concreta por nivel, usada tanto no
// system prompt quanto na mensagem de cada chamada); este teste garante que
// cada nivel tem uma descricao distinta e que "impossivel" realmente pede
// algo mais extremo que "dificil" -- sem precisar chamar a API de verdade.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Difficulty } from "@cobra/shared";
import { DIFFICULTY_GUIDANCE } from "../src/questions/ai/generate.js";

const DIFFICULTIES: Difficulty[] = ["facil", "moderado", "medio", "dificil", "impossivel"];

describe("DIFFICULTY_GUIDANCE -- calibracao do prompt de geracao por IA", () => {
  it("toda dificuldade tem uma descricao concreta (nunca vazia)", () => {
    for (const d of DIFFICULTIES) {
      assert.ok(DIFFICULTY_GUIDANCE[d] && DIFFICULTY_GUIDANCE[d].trim().length > 20, `dificuldade "${d}" sem descricao concreta`);
    }
  });

  it("as 5 descricoes sao todas distintas entre si (nenhuma reaproveitada de outro nivel)", () => {
    const values = DIFFICULTIES.map((d) => DIFFICULTY_GUIDANCE[d]);
    assert.equal(new Set(values).size, values.length);
  });

  it('"impossivel" pede algo genuinamente mais extremo que "dificil", nao apenas o mesmo rotulo trocado', () => {
    assert.notEqual(DIFFICULTY_GUIDANCE.impossivel, DIFFICULTY_GUIDANCE.dificil);
    // A descricao de "impossivel" precisa dizer explicitamente que nao pode
    // ser uma pergunta "dificil" reformulada -- a causa raiz do problema
    // relatado era exatamente essa ambiguidade no prompt antigo.
    assert.match(DIFFICULTY_GUIDANCE.impossivel.toLowerCase(), /dificil.*reformulada|nunca.*dificil/);
  });
});
