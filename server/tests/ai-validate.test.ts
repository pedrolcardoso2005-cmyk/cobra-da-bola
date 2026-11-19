// Structural validation for AI-generated question candidates
// (questions/ai/validate.ts) -- no network involved for
// validateCandidateShape; isSourceReachable is exercised with a stubbed
// global.fetch so this file never makes a real HTTP request. validate.ts
// has no dependency on db.ts, so unlike the other ai-*.test.ts files this
// one needs no DB_PATH isolation.
import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import { isSourceReachable, validateCandidateShape } from "../src/questions/ai/validate.js";
import type { GeneratedQuestionCandidate } from "../src/questions/ai/types.js";

function baseCandidate(overrides: Partial<GeneratedQuestionCandidate> = {}): GeneratedQuestionCandidate {
  return {
    category: "copa_do_mundo",
    difficulty: "facil",
    format: "aberta",
    prompt: "Em que ano o Brasil conquistou seu primeiro titulo mundial?",
    correctAnswer: "1958",
    explanation: "O Brasil venceu a Suecia na final de 1958.",
    sourceUrl: "https://example.com/copa-1958",
    ...overrides,
  };
}

describe("validateCandidateShape", () => {
  it("aceita uma pergunta aberta bem formada", () => {
    assert.equal(validateCandidateShape(baseCandidate()).ok, true);
  });

  it("rejeita prompt vazio ou curto demais", () => {
    const result = validateCandidateShape(baseCandidate({ prompt: "Quem?" }));
    assert.equal(result.ok, false);
  });

  it("rejeita quando sourceUrl nao e uma URL", () => {
    const result = validateCandidateShape(baseCandidate({ sourceUrl: "fonte confiavel" }));
    assert.equal(result.ok, false);
  });

  it("rejeita quando falta explanation", () => {
    const result = validateCandidateShape(baseCandidate({ explanation: "" }));
    assert.equal(result.ok, false);
  });

  it("multipla_escolha exige correctAnswer entre as choices", () => {
    const bad = validateCandidateShape(
      baseCandidate({ format: "multipla_escolha", choices: ["Uruguai", "Argentina", "Italia"], correctAnswer: "Brasil" }),
    );
    assert.equal(bad.ok, false);

    const good = validateCandidateShape(
      baseCandidate({ format: "multipla_escolha", choices: ["Uruguai", "Argentina", "Brasil"], correctAnswer: "Brasil" }),
    );
    assert.equal(good.ok, true);
  });

  it("verdadeiro_falso so aceita 'verdadeiro' ou 'falso' como correctAnswer", () => {
    const bad = validateCandidateShape(baseCandidate({ format: "verdadeiro_falso", correctAnswer: "sim" }));
    assert.equal(bad.ok, false);

    const good = validateCandidateShape(baseCandidate({ format: "verdadeiro_falso", correctAnswer: "verdadeiro" }));
    assert.equal(good.ok, true);
  });

  it("rejeita categoria/dificuldade/formato fora do enum", () => {
    assert.equal(validateCandidateShape(baseCandidate({ difficulty: "muito_dificil" as any })).ok, false);
    assert.equal(validateCandidateShape(baseCandidate({ format: "livre" as any })).ok, false);
  });

  it("rejeita campos extras nao esperados (saida do modelo fora do schema)", () => {
    const result = validateCandidateShape({ ...baseCandidate(), extraCampoInventado: "x" });
    assert.equal(result.ok, false);
  });
});

describe("isSourceReachable", () => {
  const originalFetch = global.fetch;
  after(() => {
    global.fetch = originalFetch;
  });

  it("retorna true quando a resposta e ok", async () => {
    global.fetch = (async () => ({ ok: true }) as Response) as typeof fetch;
    assert.equal(await isSourceReachable("https://example.com/qualquer"), true);
  });

  it("retorna false quando a resposta nao e ok", async () => {
    global.fetch = (async () => ({ ok: false }) as Response) as typeof fetch;
    assert.equal(await isSourceReachable("https://example.com/404"), false);
  });

  it("retorna false (nunca lanca) quando a rede falha", async () => {
    global.fetch = (async () => {
      throw new Error("network down");
    }) as typeof fetch;
    assert.equal(await isSourceReachable("https://example.com/sem-rede"), false);
  });
});
