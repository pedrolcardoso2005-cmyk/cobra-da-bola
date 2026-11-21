import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { callAnthropicForStructuredOutput } from "../src/questions/ai/anthropicClient.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function response(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

const baseOptions = {
  apiKey: "test-key",
  model: "claude-test",
  system: "system",
  userMessage: "gere perguntas",
  toolName: "submit_questions",
  toolInputSchema: { type: "object" },
  useWebSearch: true,
  timeoutMs: 5_000,
};

describe("callAnthropicForStructuredOutput", () => {
  it("continua a mesma conversa depois de pause_turn e captura submit_questions", async () => {
    const requests: Record<string, unknown>[] = [];
    let call = 0;
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      requests.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
      call++;
      if (call === 1) {
        return response({
          stop_reason: "pause_turn",
          content: [{ type: "server_tool_use", id: "srv_1", name: "web_search", input: { query: "futebol" } }],
          usage: { input_tokens: 100, output_tokens: 50 },
        });
      }
      return response({
        stop_reason: "tool_use",
        content: [{ type: "tool_use", id: "tool_1", name: "submit_questions", input: { questions: [{ prompt: "Pergunta teste" }] } }],
        usage: { input_tokens: 120, output_tokens: 60 },
      });
    }) as typeof fetch;

    const result = await callAnthropicForStructuredOutput(baseOptions);

    assert.equal(call, 2);
    assert.deepEqual(result.toolInput, { questions: [{ prompt: "Pergunta teste" }] });
    assert.equal(result.stopReason, "tool_use");
    assert.equal(result.continuationCount, 1);
    assert.deepEqual(result.usage, { inputTokens: 220, outputTokens: 110 });

    const messages = requests[1].messages as { role: string; content: unknown }[];
    assert.equal(messages.length, 3);
    assert.equal(messages[0].role, "user");
    assert.equal(messages[1].role, "assistant");
    assert.deepEqual(messages[1].content, [{ type: "server_tool_use", id: "srv_1", name: "web_search", input: { query: "futebol" } }]);
    assert.equal((requests[1].tools as unknown[]).length, 2);
  });

  it("retorna stop_reason quando a ferramenta estruturada nao foi chamada", async () => {
    globalThis.fetch = (async () => response({
      stop_reason: "end_turn",
      content: [{ type: "text", text: "Nao consegui confirmar fatos suficientes." }],
      usage: { input_tokens: 10, output_tokens: 20 },
    })) as typeof fetch;

    const result = await callAnthropicForStructuredOutput(baseOptions);
    assert.equal(result.toolInput, null);
    assert.equal(result.stopReason, "end_turn");
    assert.equal(result.continuationCount, 0);
  });

  it("nao continua indefinidamente se a Anthropic repetir pause_turn", async () => {
    let call = 0;
    globalThis.fetch = (async () => {
      call++;
      return response({
        stop_reason: "pause_turn",
        content: [{ type: "server_tool_use", id: "srv_" + call, name: "web_search", input: { query: "futebol" } }],
        usage: { input_tokens: 1, output_tokens: 1 },
      });
    }) as typeof fetch;

    const result = await callAnthropicForStructuredOutput(baseOptions);
    assert.equal(call, 5);
    assert.equal(result.toolInput, null);
    assert.equal(result.stopReason, "pause_turn");
    assert.equal(result.continuationCount, 4);
  });
});
