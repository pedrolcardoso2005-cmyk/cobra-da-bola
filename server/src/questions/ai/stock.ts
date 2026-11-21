import type { Difficulty, QuestionCategory } from "@cobra/shared";
import { db } from "../../db/db.js";
import { countApprovedByBucket, countConsumptionSince, recentFailureStreak } from "../../db/questions.js";
import { QUESTION_CATEGORIES, DIFFICULTIES } from "./buckets.js";
import type { AiQuestionsConfig } from "./config.js";
import { runGenerationBatch, type RunBatchResult } from "./pipeline.js";

export interface StockBucket {
  category: QuestionCategory;
  difficulty: Difficulty;
  count: number;
}

export function getStockReport(): StockBucket[] {
  const counts = new Map<string, number>();
  for (const row of countApprovedByBucket()) counts.set(`${row.category}::${row.difficulty}`, row.count);
  const report: StockBucket[] = [];
  for (const category of QUESTION_CATEGORIES) {
    for (const difficulty of DIFFICULTIES) {
      report.push({ category, difficulty, count: counts.get(`${category}::${difficulty}`) ?? 0 });
    }
  }
  return report;
}

/** A bucket's min/target stock, honoring the per-difficulty override when
 * one exists and falling back to the single global number otherwise (see
 * config.ts). Exported so the admin report can show "estoque critico"
 * against the same thresholds the watcher itself uses. */
export function minStockFor(config: AiQuestionsConfig, difficulty: Difficulty): number {
  return config.minStockPerDifficulty[difficulty] ?? config.minStockPerBucket;
}
export function targetStockFor(config: AiQuestionsConfig, difficulty: Difficulty): number {
  return config.targetStockPerDifficulty[difficulty] ?? config.targetStockPerBucket;
}

function batchesRunToday(): number {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const row = db
    .prepare("SELECT COUNT(*) as n FROM ai_generation_log WHERE started_at >= ?")
    .get(midnight.getTime()) as { n: number };
  return row.n;
}

export interface DeficitBucket extends StockBucket {
  deficit: number;
  /** Questions served from this bucket in the last config.demandWindowHours
   * -- the demand signal, alongside the static deficit above. */
  recentConsumption: number;
  priority: number;
}

/** Pure, DB-free: ranks deficient buckets by deficit *and* real demand, so
 * a bucket that's below its minimum AND being drained fast outranks one
 * that's below its minimum but barely played. `priority = deficit +
 * demandWeight * (recentConsumption / demandWindowHours)` -- consumption
 * per hour, scaled by demandWeight (0 disables demand weighting entirely,
 * falling back to the pre-existing pure-deficit order). Exported directly
 * for testing without touching the database. */
export function rankBucketsByPriority(
  buckets: { category: QuestionCategory; difficulty: Difficulty; count: number }[],
  consumptionByBucket: Map<string, number>,
  config: Pick<AiQuestionsConfig, "minStockPerDifficulty" | "minStockPerBucket" | "demandWeight" | "demandWindowHours">,
): DeficitBucket[] {
  return buckets
    .map((b) => {
      const min = config.minStockPerDifficulty[b.difficulty] ?? config.minStockPerBucket;
      const recentConsumption = consumptionByBucket.get(`${b.category}::${b.difficulty}`) ?? 0;
      const deficit = min - b.count;
      const ratePerHour = config.demandWindowHours > 0 ? recentConsumption / config.demandWindowHours : 0;
      return { ...b, deficit, recentConsumption, priority: deficit + config.demandWeight * ratePerHour };
    })
    .filter((b) => b.deficit > 0)
    .sort((a, b) => b.priority - a.priority);
}

// In-process guard only: prevents two concurrent generation runs -- a
// boot-time check overlapping a scheduled one, OR either of those
// overlapping an admin's manual "/gerar" call (review-routes.ts acquires
// the same lock before calling runGenerationBatch directly) -- from racing
// on the same bucket or blowing through the daily budget twice at once.
// Fine for the single Railway instance this project runs today; a second
// instance would need a real cross-process lock (see the plan's "riscos e
// limitacoes" section).
let running = false;

/** Claims the single in-process generation slot. Returns false (claims
 * nothing) if another generation -- automatic or manual -- is already
 * running. Callers MUST release via releaseGenerationLock() in a
 * finally block. */
export function acquireGenerationLock(): boolean {
  if (running) return false;
  running = true;
  return true;
}
export function releaseGenerationLock(): void {
  running = false;
}
export function isGenerationBusy(): boolean {
  return running;
}

export interface TopUpSummary {
  skipped: boolean;
  reason?: string;
  batches: { category: string; difficulty: string; result: RunBatchResult }[];
  /** Buckets that were deficient but skipped by the per-bucket circuit
   * breaker (see config.circuitBreakerThreshold) -- still deficient, just
   * not retried this run. Kept separate from `batches` so formatTopUpLog
   * can call them out explicitly instead of silently omitting them. */
  circuitBroken: { category: string; difficulty: string }[];
}

/** Checks every (category, difficulty) bucket and runs at most a handful
 * of generation batches for whichever buckets are furthest below the
 * configured minimum -- never more than the daily cap, and never if the
 * pipeline itself is disabled or missing its API key. Always resolves (never
 * rejects): called fire-and-forget from index.ts at boot, so a failure here
 * must never surface as an unhandled rejection. `maxBucketsPerRun` defaults
 * to config.maxBucketsPerRun; the parameter only exists so tests can override
 * it without touching env vars. */
export async function checkAndTopUp(config: AiQuestionsConfig, maxBucketsPerRun = config.maxBucketsPerRun): Promise<TopUpSummary> {
  if (!config.enabled) return { skipped: true, reason: "AI_QUESTIONS_ENABLED nao e 'true'", batches: [], circuitBroken: [] };
  if (!config.anthropicApiKey) return { skipped: true, reason: "ANTHROPIC_API_KEY ausente", batches: [], circuitBroken: [] };
  if (!acquireGenerationLock()) {
    return { skipped: true, reason: "ja ha uma geracao em andamento (automatica ou manual)", batches: [], circuitBroken: [] };
  }

  try {
    const alreadyToday = batchesRunToday();
    if (alreadyToday >= config.maxBatchesPerDay) {
      return {
        skipped: true,
        reason: `limite diario de lotes atingido (${alreadyToday}/${config.maxBatchesPerDay})`,
        batches: [],
        circuitBroken: [],
      };
    }

    const sinceTs = Date.now() - config.demandWindowHours * 60 * 60 * 1000;
    const consumptionByBucket = new Map<string, number>();
    for (const row of countConsumptionSince(sinceTs)) consumptionByBucket.set(`${row.category}::${row.difficulty}`, row.count);

    const ranked = rankBucketsByPriority(getStockReport(), consumptionByBucket, config);
    if (ranked.length === 0) {
      return { skipped: true, reason: "estoque suficiente -- nenhum bucket abaixo do minimo configurado", batches: [], circuitBroken: [] };
    }

    // Per-bucket circuit breaker: a bucket that's failed
    // config.circuitBreakerThreshold times in a row (see
    // db/questions.ts recentFailureStreak) is left out of this run --
    // still deficient, but not retried blindly until someone looks at it.
    const circuitBroken: TopUpSummary["circuitBroken"] = [];
    const eligible = ranked.filter((b) => {
      if (recentFailureStreak(b.category, b.difficulty, config.circuitBreakerThreshold)) {
        circuitBroken.push({ category: b.category, difficulty: b.difficulty });
        return false;
      }
      return true;
    });

    const remainingBudget = config.maxBatchesPerDay - alreadyToday;
    const toProcess = eligible.slice(0, Math.min(maxBucketsPerRun, remainingBudget));

    const batches: TopUpSummary["batches"] = [];
    for (const bucket of toProcess) {
      const target = Math.min(targetStockFor(config, bucket.difficulty) - bucket.count, config.batchSize);
      if (target <= 0) continue;
      const result = await runGenerationBatch(config, bucket.category, bucket.difficulty, target);
      batches.push({ category: bucket.category, difficulty: bucket.difficulty, result });
    }
    return { skipped: false, batches, circuitBroken };
  } finally {
    releaseGenerationLock();
  }
}

/** Pure formatter (no console calls, so it's directly testable): turns a
 * TopUpSummary into the exact lines that should reach the Railway logs --
 * every skip has an explicit, human-readable reason (never silent), and
 * every bucket processed reports requested/generated/approved/pending/
 * rejected counts plus any error, so "a IA realmente rodou?" is always
 * answerable just by reading the logs. Never includes API keys or any
 * secret -- only numeric counts, category/difficulty labels, and whatever
 * error message the Anthropic call itself returned. */
export function formatTopUpLog(trigger: string, summary: TopUpSummary): string[] {
  const lines: string[] = [];
  if (summary.skipped) {
    lines.push(`[ai-questions] ${trigger}: pulado -- ${summary.reason ?? "motivo desconhecido"}`);
  } else if (summary.batches.length === 0) {
    const why = summary.circuitBroken.length > 0 ? "todos os buckets deficitarios estao com o circuit breaker aberto" : "orcamento diario esgotado no meio da execucao";
    lines.push(`[ai-questions] ${trigger}: executou, mas nao processou nenhum bucket (${why})`);
  } else {
    lines.push(
      ...summary.batches.map(({ category, difficulty, result }) => {
        const base =
          `[ai-questions] ${trigger} ${category}/${difficulty}: ` +
          `pedidas=${result.requested} geradas=${result.generated} ` +
          `aprovadas=${result.autoApproved} pendentes=${result.flaggedForReview} ` +
          `rejeitadas_validacao=${result.rejectedValidation} rejeitadas_duplicata=${result.rejectedDuplicate}`;
        return result.error ? `${base} ERRO="${result.error}"` : base;
      }),
    );
  }
  if (summary.circuitBroken.length > 0) {
    const list = summary.circuitBroken.map((b) => `${b.category}/${b.difficulty}`).join(", ");
    lines.push(`[ai-questions] ${trigger}: circuit breaker aberto, pulados sem tentar -- ${list}`);
  }
  return lines;
}

/** Thin side-effecting wrapper around formatTopUpLog -- the only place in
 * this module that actually calls console.log/console.error. */
export function logTopUpSummary(trigger: string, summary: TopUpSummary): void {
  for (const line of formatTopUpLog(trigger, summary)) {
    // eslint-disable-next-line no-console
    if (line.includes("ERRO=")) console.error(line);
    else console.log(line);
  }
}
