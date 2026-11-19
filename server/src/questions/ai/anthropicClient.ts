// Thin wrapper around the Anthropic Messages API -- plain `fetch`, no SDK
// dependency added for a single call site. The API key is read once by the
// caller from process.env (see config.ts) and passed in here; it is never
// logged, never echoed back, and this module has no other way to obtain it.
//
// NOTE: the exact tool name/version for Anthropic's server-side web search
// tool ("web_search_20250305" below) and the `anthropic-version` header
// value can change between API releases. Verify both against the current
// https://docs.anthropic.com before turning AI_QUESTIONS_ENABLED=true
// against a real account -- this client fails closed (throws, caught by
// the pipeline) rather than silently if the request is rejected.
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export interface AnthropicToolUseResult {
  /** Parsed `input` of the first tool_use block matching `toolName`, or
   * null if the model never called it (treated upstream as "generated
   * nothing this round" rather than a crash). */
  toolInput: unknown | null;
  stopReason: string | null;
  usage: { inputTokens: number; outputTokens: number } | null;
}

export async function callAnthropicForStructuredOutput(opts: {
  apiKey: string;
  model: string;
  system: string;
  userMessage: string;
  toolName: string;
  toolInputSchema: Record<string, unknown>;
  useWebSearch: boolean;
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<AnthropicToolUseResult> {
  const tools: Record<string, unknown>[] = [
    {
      name: opts.toolName,
      description: "Envia o resultado final, ja validado internamente, da geracao de perguntas.",
      input_schema: opts.toolInputSchema,
    },
  ];
  if (opts.useWebSearch) {
    tools.unshift({ type: "web_search_20250305", name: "web_search", max_uses: 10 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 120_000);
  try {
    const res = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": opts.apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: opts.model,
        max_tokens: opts.maxTokens ?? 8000,
        system: opts.system,
        messages: [{ role: "user", content: opts.userMessage }],
        tools,
        tool_choice: { type: "auto" },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Anthropic API respondeu ${res.status}: ${body.slice(0, 500)}`);
    }

    const data = (await res.json()) as {
      content?: { type: string; name?: string; input?: unknown }[];
      stop_reason?: string;
      usage?: { input_tokens: number; output_tokens: number };
    };

    const toolUse = (data.content ?? []).find((b) => b.type === "tool_use" && b.name === opts.toolName);
    return {
      toolInput: toolUse?.input ?? null,
      stopReason: data.stop_reason ?? null,
      usage: data.usage ? { inputTokens: data.usage.input_tokens, outputTokens: data.usage.output_tokens } : null,
    };
  } finally {
    clearTimeout(timeout);
  }
}
