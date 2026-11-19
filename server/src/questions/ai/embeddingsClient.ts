// Thin wrapper around the OpenAI embeddings endpoint, used only for the
// semantic-duplicate check in dedupe.ts. Plain `fetch`, no SDK dependency.
// Entirely optional: if OPENAI_API_KEY is not set, dedupe.ts skips this and
// falls back to the textual-similarity pass alone (see dedupe.ts).
const OPENAI_EMBEDDINGS_URL = "https://api.openai.com/v1/embeddings";

export async function createEmbeddings(opts: {
  apiKey: string;
  model: string;
  texts: string[];
  timeoutMs?: number;
}): Promise<Float32Array[]> {
  if (opts.texts.length === 0) return [];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), opts.timeoutMs ?? 30_000);
  try {
    const res = await fetch(OPENAI_EMBEDDINGS_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify({ model: opts.model, input: opts.texts }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`OpenAI embeddings API respondeu ${res.status}: ${body.slice(0, 500)}`);
    }
    const data = (await res.json()) as { data: { embedding: number[]; index: number }[] };
    const sorted = [...data.data].sort((a, b) => a.index - b.index);
    return sorted.map((d) => Float32Array.from(d.embedding));
  } finally {
    clearTimeout(timeout);
  }
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
