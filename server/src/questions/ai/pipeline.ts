import type { Difficulty, QuestionCategory } from "@cobra/shared";
import {
  insertAiGenerationLog,
  insertApprovedAiQuestion,
  insertPendingQuestion,
  saveQuestionEmbedding,
  type QuestionWithStatus,
} from "../../db/questions.js";
import type { AiQuestionsConfig } from "./config.js";
import { checkDuplicateAgainstPools, loadEmbeddingPool, loadTextPool, type PromptPoolEntry } from "./dedupe.js";
import { createEmbeddings } from "./embeddingsClient.js";
import { generateQuestionBatch } from "./generate.js";
import { isSourceReachable, toQuestionInput, validateCandidateShape } from "./validate.js";
import type { StoredEmbedding } from "../../db/questions.js";

export interface RunBatchResult {
  insertedIds: string[];
  requested: number;
  generated: number;
  rejectedValidation: number;
  rejectedDuplicate: number;
  flaggedForReview: number;
  autoApproved: number;
  error: string | null;
  /** Token usage for the single Anthropic generation call in this batch
   * (not the embeddings call), for rough cost estimation -- null if the
   * call never happened or didn't return usage. */
  usage: { inputTokens: number; outputTokens: number } | null;
}

/**
 * Generates one batch for a single (category, difficulty) bucket, and runs
 * every candidate through validation + dedupe before it ever reaches the
 * questions table. Never throws past this point for request-level issues
 * (API errors, bad model output): callers (stock.ts, the manual admin
 * trigger route) get a result object with `error` set instead, because a
 * failed generation run must never take the game process down or block a
 * match -- matches only ever read already-approved rows (see rooms.ts).
 */
export async function runGenerationBatch(
  config: AiQuestionsConfig,
  category: QuestionCategory,
  difficulty: Difficulty,
  count: number,
): Promise<RunBatchResult> {
  const startedAt = Date.now();
  const base: RunBatchResult = {
    insertedIds: [],
    requested: count,
    generated: 0,
    rejectedValidation: 0,
    rejectedDuplicate: 0,
    flaggedForReview: 0,
    autoApproved: 0,
    error: null,
    usage: null,
  };

  if (!config.anthropicApiKey) {
    const result = { ...base, error: "ANTHROPIC_API_KEY nao configurada" };
    logResult(config, category, difficulty, result, startedAt);
    return result;
  }

  let candidates: Awaited<ReturnType<typeof generateQuestionBatch>>["candidates"] = [];
  let usage: RunBatchResult["usage"] = null;
  let generationDiagnostic: string | null = null;
  try {
    const textPoolForPrompt = loadTextPool()
      .filter((p) => p.category === category)
      .map((p) => p.prompt)
      .slice(0, 200);
    const generation = await generateQuestionBatch({
      apiKey: config.anthropicApiKey,
      model: config.anthropicModel,
      category,
      difficulty,
      count,
      existingPrompts: textPoolForPrompt,
      useWebSearch: true,
    });
    candidates = generation.candidates;
    usage = generation.usage;
    generationDiagnostic = generation.diagnostic;
  } catch (err) {
    const result = { ...base, error: err instanceof Error ? err.message : String(err) };
    logResult(config, category, difficulty, result, startedAt);
    return result;
  }

  const textPool: PromptPoolEntry[] = loadTextPool();
  let embeddingPool: StoredEmbedding[] = [];
  let candidateEmbeddings: Float32Array[] = [];
  const useSemanticDedupe = Boolean(config.openaiApiKey);

  if (useSemanticDedupe) {
    try {
      embeddingPool = loadEmbeddingPool(config.embeddingModel);
      candidateEmbeddings = await createEmbeddings({
        apiKey: config.openaiApiKey!,
        model: config.embeddingModel,
        texts: candidates.map((c) => c.prompt ?? ""),
      });
    } catch {
      // Embeddings are an optional enhancement (see embeddingsClient.ts) --
      // if the provider call fails, fall back to textual-only dedupe for
      // this batch instead of discarding every candidate.
      candidateEmbeddings = [];
    }
  }

  let rejectedValidation = 0;
  let rejectedDuplicate = 0;
  let flaggedForReview = 0;
  let autoApproved = 0;
  const insertedIds: string[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const shapeCheck = validateCandidateShape(candidate);
    if (!shapeCheck.ok) {
      rejectedValidation++;
      continue;
    }

    const embedding = candidateEmbeddings[i];
    const verdict = checkDuplicateAgainstPools(
      candidate.prompt,
      candidate.category,
      textPool,
      embedding && embedding.length > 0
        ? {
            embedding,
            pool: embeddingPool,
            thresholds: { rejectThreshold: config.duplicateRejectThreshold, reviewThreshold: config.duplicateReviewThreshold },
          }
        : null,
    );

    if (verdict.verdict === "duplicate") {
      rejectedDuplicate++;
      continue;
    }

    const sourceOk = await isSourceReachable(candidate.sourceUrl).catch(() => false);
    const needsReview = verdict.verdict === "needs_review" || !sourceOk;

    const input = toQuestionInput(candidate);
    let row: QuestionWithStatus;
    if (!config.autoApprove || needsReview) {
      row = insertPendingQuestion(input, config.anthropicModel);
      flaggedForReview++;
    } else {
      row = insertApprovedAiQuestion(input, config.anthropicModel);
      autoApproved++;
    }
    const insertedId = row.id;
    insertedIds.push(insertedId);

    // Grow the in-memory pools so later candidates in this same batch are
    // checked against earlier ones too, not just against what was already
    // in the database before this run started.
    textPool.push({ id: insertedId, category: candidate.category, prompt: candidate.prompt });
    if (embedding && embedding.length > 0) {
      try {
        saveQuestionEmbedding(insertedId, config.embeddingModel, embedding);
        embeddingPool.push({ questionId: insertedId, model: config.embeddingModel, category: candidate.category, embedding });
      } catch {
        // Non-fatal: the question is still inserted and usable/reviewable,
        // it just won't be compared against semantically until the next
        // batch recomputes embeddings for existing rows that lack one.
      }
    }
  }

  const result: RunBatchResult = {
    insertedIds,
    requested: count,
    generated: candidates.length,
    rejectedValidation,
    rejectedDuplicate,
    flaggedForReview,
    autoApproved,
    error: generationDiagnostic,
    usage,
  };
  logResult(config, category, difficulty, result, startedAt);
  return result;
}

function logResult(
  config: AiQuestionsConfig,
  category: QuestionCategory,
  difficulty: Difficulty,
  result: RunBatchResult,
  startedAt: number,
): void {
  insertAiGenerationLog({
    category,
    difficulty,
    requested: result.requested,
    generated: result.generated,
    rejectedValidation: result.rejectedValidation,
    rejectedDuplicate: result.rejectedDuplicate,
    flaggedForReview: result.flaggedForReview,
    autoApproved: result.autoApproved,
    model: config.anthropicModel,
    error: result.error,
    startedAt,
    finishedAt: Date.now(),
  });
}

