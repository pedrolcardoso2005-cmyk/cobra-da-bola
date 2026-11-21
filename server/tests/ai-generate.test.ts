// Regression tests for two production failures seen in [ai-questions] boot
// logs: (1) submit_questions called with the array sent directly as `input`
// instead of wrapped in `{ questions: [...] }` ("campo questions nao e um
// array"), and (2) large "dificil"/"impossivel" batches hitting
// stop_reason=max_tokens before ever calling the tool. Both are exercised
// by stubbing global.fetch -- no real network access, no API key needed.
import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { generateQuestionBatch } from "../src/questions/ai/generate.js";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

function response(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json" } });
}

function stubToolUse(input: unknown) {
  globalThis.fetch = (async () =>
    response({
      stop_reason: "tool_use",
      content: [{ type: "tool_use", id: "tool_1", name: "submit_questions", input }],
      usage: { input_tokens: 10, output_tokens: 10 },
    })) as typeof fetch;
}

const baseParams = {
  apiKey: "test-key",
  model: "claude-test",
  category: "futebol_brasileiro" as const,
  difficulty: "facil" as const,
  count: 3,
  existingPrompts: [],
  useWebSearch: true,
};

describe("generateQuestionBatch -- extracao do campo questions (tolera o envelope real da Anthropic)", () => {
  it("aceita o formato esperado {questions: [...]}", async () => {
    stubToolUse({ questions: [{ prompt: "p1" }, { prompt: "p2" }] });
    const result = await generateQuestionBatch(baseParams);
    assert.equal(result.candidates.length, 2);
    assert.equal(result.diagnostic, null);
  });

  it("aceita quando o modelo manda o array diretamente na raiz do input, sem o wrapper {questions} (bug real de producao)", async () => {
    stubToolUse([{ prompt: "p1" }, { prompt: "p2" }, { prompt: "p3" }]);
    const result = await generateQuestionBatch(baseParams);
    assert.equal(result.candidates.length, 3);
    assert.equal(result.diagnostic, null);
  });

  it("aceita quando questions vem double-encoded como string JSON em vez de array nativo", async () => {
    stubToolUse({ questions: JSON.stringify([{ prompt: "p1" }]) });
    const result = await generateQuestionBatch(baseParams);
    assert.equal(result.candidates.length, 1);
    assert.equal(result.diagnostic, null);
  });

  it("continua rejeitando com diagnostico explicito quando nao ha array em lugar nenhum (nunca aceita lixo)", async () => {
    stubToolUse({ foo: "bar" });
    const result = await generateQuestionBatch(baseParams);
    assert.equal(result.candidates.length, 0);
    assert.match(result.diagnostic ?? "", /nao e um array/);
  });

  it("continua rejeitando quando questions e uma string que nao e JSON valido", async () => {
    stubToolUse({ questions: "nao e json" });
    const result = await generateQuestionBatch(baseParams);
    assert.equal(result.candidates.length, 0);
    assert.match(result.diagnostic ?? "", /nao e um array/);
  });

  it("continua rejeitando um array vazio como antes (zero perguntas)", async () => {
    stubToolUse({ questions: [] });
    const result = await generateQuestionBatch(baseParams);
    assert.equal(result.candidates.length, 0);
    assert.match(result.diagnostic ?? "", /zero perguntas/);
  });
});

describe("generateQuestionBatch -- orcamento de max_tokens escala com dificuldade/tamanho do lote", () => {
  it("usa um max_tokens bem maior para um lote 'impossivel' grande do que para um lote 'facil' pequeno", async () => {
    const requests: Record<string, unknown>[] = [];
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      requests.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
      return response({
        stop_reason: "tool_use",
        content: [{ type: "tool_use", name: "submit_questions", input: { questions: [] } }],
        usage: null,
      });
    }) as typeof fetch;

    await generateQuestionBatch({ ...baseParams, difficulty: "facil", count: 5 });
    await generateQuestionBatch({ ...baseParams, difficulty: "impossivel", count: 20 });

    const facilTokens = requests[0].max_tokens as number;
    const impossivelTokens = requests[1].max_tokens as number;
    assert.ok(
      impossivelTokens > facilTokens,
      `esperava impossivel(${impossivelTokens}) > facil(${facilTokens})`,
    );
    // O valor antigo (count*400) teria dado so 8000 para um lote de 20 --
    // exatamente o cenario que estourou max_tokens em producao.
    assert.ok(impossivelTokens > 8000, `orcamento para impossivel/20 deveria superar o antigo count*400=8000, veio ${impossivelTokens}`);
  });

  it("nunca excede o teto de seguranca mesmo para o maior lote permitido", async () => {
    const requests: Record<string, unknown>[] = [];
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      requests.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
      return response({
        stop_reason: "tool_use",
        content: [{ type: "tool_use", name: "submit_questions", input: { questions: [] } }],
        usage: null,
      });
    }) as typeof fetch;

    await generateQuestionBatch({ ...baseParams, difficulty: "impossivel", count: 100 });
    assert.ok((requests[0].max_tokens as number) <= 64000);
  });
});
