// Thin wrapper around the Anthropic Messages API -- plain fetch, no SDK dependency.
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_TIMEOUT_MS = 300_000;
const MAX_PAUSE_TURN_CONTINUATIONS = 4;

type AnthropicContentBlock = {
  type: string;
  name?: string;
  input?: unknown;
  [key: string]: unknown;
};

export interface AnthropicToolUseResult {
  toolInput: unknown | null;
  stopReason: string | null;
  usage: { inputTokens: number; outputTokens: number } | null;
  continuationCount: number;
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

  // Anthropic requires continuing the same turn after pause_turn by appending
  // the complete assistant response and resending the same tools.
  const messages: { role: "user" | "assistant"; content: string | AnthropicContentBlock[] }[] = [
    { role: "user", content: opts.userMessage },
  ];
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const deadline = Date.now() + timeoutMs;
  let continuationCount = 0;
  let stopReason: string | null = null;
  let inputTokens = 0;
  let outputTokens = 0;
  let receivedUsage = false;

  for (let attempt = 0; attempt <= MAX_PAUSE_TURN_CONTINUATIONS; attempt++) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      throw new Error("Tempo limite de " + timeoutMs + "ms excedido ao consultar a Anthropic (continuacoes=" + continuationCount + ")");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), remainingMs);
    let res: Response;
    try {
      res = await fetch(ANTHROPIC_API_URL, {
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
          messages,
          tools,
          tool_choice: { type: "auto" },
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error("Anthropic API respondeu " + res.status + ": " + body.slice(0, 500));
    }

    const data = (await res.json()) as {
      content?: AnthropicContentBlock[];
      stop_reason?: string;
      usage?: { input_tokens: number; output_tokens: number };
    };
    stopReason = data.stop_reason ?? null;
    if (data.usage) {
      receivedUsage = true;
      inputTokens += data.usage.input_tokens;
      outputTokens += data.usage.output_tokens;
    }

    const content = data.content ?? [];
    const toolUse = content.find((block) => block.type === "tool_use" && block.name === opts.toolName);
    if (toolUse) {
      return {
        toolInput: toolUse.input ?? null,
        stopReason,
        usage: receivedUsage ? { inputTokens, outputTokens } : null,
        continuationCount,
      };
    }

    if (stopReason !== "pause_turn") {
      return {
        toolInput: null,
        stopReason,
        usage: receivedUsage ? { inputTokens, outputTokens } : null,
        continuationCount,
      };
    }

    if (attempt === MAX_PAUSE_TURN_CONTINUATIONS) break;

    // Preserve the exact assistant response, including server-tool activity.
    messages.push({ role: "assistant", content });
    continuationCount++;
  }

  return {
    toolInput: null,
    stopReason,
    usage: receivedUsage ? { inputTokens, outputTokens } : null,
    continuationCount,
  };
}
