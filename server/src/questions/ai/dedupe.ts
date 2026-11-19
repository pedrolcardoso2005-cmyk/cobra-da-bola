import { normalizeAnswer } from "@cobra/shared";
import type { QuestionCategory } from "@cobra/shared";
import { listEmbeddingsForDedupe, listPromptsForDedupe, type StoredEmbedding } from "../../db/questions.js";
import { cosineSimilarity } from "./embeddingsClient.js";
import type { DedupeVerdict } from "./types.js";

export interface PromptPoolEntry {
  id: string;
  category: QuestionCategory;
  prompt: string;
}

function trigrams(text: string): Set<string> {
  const padded = `  ${text} `;
  const grams = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) grams.add(padded.slice(i, i + 3));
  return grams;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const g of a) if (b.has(g)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** Pure, DB/network-free: cheap first pass against an in-memory pool of
 * normalized prompts. Catches exact and near-exact rephrasings. Exposed
 * this way (pool passed in, not queried internally) so a generation batch
 * can grow the pool in-memory as candidates are accepted -- two candidates
 * in the *same* batch that duplicate each other must be caught too, not
 * just duplicates of what was already in the database. */
export function textualDuplicateAgainstPool(
  candidatePrompt: string,
  category: QuestionCategory,
  pool: PromptPoolEntry[],
  threshold = 0.82,
): { matchId: string; score: number } | null {
  const candidateGrams = trigrams(normalizeAnswer(candidatePrompt));
  let best: { matchId: string; score: number } | null = null;
  for (const existing of pool) {
    if (existing.category !== category) continue;
    const score = jaccard(candidateGrams, trigrams(normalizeAnswer(existing.prompt)));
    if (score >= threshold && (!best || score > best.score)) best = { matchId: existing.id, score };
  }
  return best;
}

export interface DuplicateThresholds {
  rejectThreshold: number;
  reviewThreshold: number;
}

/** Pure, network-free: compares a precomputed embedding against an
 * in-memory pool of stored embeddings. The embedding itself must be
 * computed upstream (one batched API call for the whole generation run,
 * see pipeline.ts) -- this function never calls out to a provider. */
export function semanticDuplicateAgainstPool(
  candidateEmbedding: Float32Array,
  category: QuestionCategory,
  pool: StoredEmbedding[],
  thresholds: DuplicateThresholds,
): { matchId: string; score: number; verdict: "duplicate" | "needs_review" } | null {
  let best: { matchId: string; score: number } | null = null;
  for (const entry of pool) {
    if (entry.category !== category) continue;
    const score = cosineSimilarity(candidateEmbedding, entry.embedding);
    if (!best || score > best.score) best = { matchId: entry.questionId, score };
  }
  if (!best) return null;
  if (best.score >= thresholds.rejectThreshold) return { ...best, verdict: "duplicate" };
  if (best.score >= thresholds.reviewThreshold) return { ...best, verdict: "needs_review" };
  return null;
}

export function checkDuplicateAgainstPools(
  candidatePrompt: string,
  category: QuestionCategory,
  textPool: PromptPoolEntry[],
  semantic: { embedding: Float32Array; pool: StoredEmbedding[]; thresholds: DuplicateThresholds } | null,
): DedupeVerdict {
  const textual = textualDuplicateAgainstPool(candidatePrompt, category, textPool);
  if (textual) return { verdict: "duplicate", matchId: textual.matchId, score: textual.score };

  if (!semantic) return { verdict: "unique" };
  const result = semanticDuplicateAgainstPool(semantic.embedding, category, semantic.pool, semantic.thresholds);
  if (!result) return { verdict: "unique" };
  return result.verdict === "duplicate"
    ? { verdict: "duplicate", matchId: result.matchId, score: result.score }
    : { verdict: "needs_review", matchId: result.matchId, score: result.score };
}

/** Loads the current textual pool straight from the database -- the
 * starting point for a generation batch, before any in-memory growth. */
export function loadTextPool(): PromptPoolEntry[] {
  return listPromptsForDedupe();
}

/** Loads the current embedding pool for a given model straight from the
 * database -- same role as loadTextPool, for the semantic pass. */
export function loadEmbeddingPool(model: string): StoredEmbedding[] {
  return listEmbeddingsForDedupe(model);
}
