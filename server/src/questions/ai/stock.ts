import type { Difficulty, QuestionCategory } from "@cobra/shared";
import { db } from "../../db/db.js";
import { countApprovedByBucket } from "../../db/questions.js";
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

function batchesRunToday(): number {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const row = db
    .prepare("SELECT COUNT(*) as n FROM ai_generation_log WHERE started_at >= ?")
    .get(midnight.getTime()) as { n: number };
  return row.n;
}

// In-process guard only: prevents two concurrent checkAndTopUp runs (e.g. a
// boot-time check overlapping a scheduled one) from racing on the same
// bucket. Fine for the single Railway instance this project runs today; a
// second instance would need a real cross-process lock (see the plan's
// "riscos e limitacoes" section).
let running = false;

export interface TopUpSummary {
  skipped: boolean;
  reason?: string;
  batches: { category: string; difficulty: string; result: RunBatchResult }[];
}

/** Checks every (category, difficulty) bucket and runs at most a handful
 * of generation batches for whichever buckets are furthest below the
 * configured minimum -- never more than the daily cap, and never if the
 * pipeline itself is disabled or missing its API key. Always resolves (never
 * rejects): called fire-and-forget from index.ts at boot, so a failure here
 * must never surface as an unhandled rejection. */
export async function checkAndTopUp(config: AiQuestionsConfig, maxBucketsPerRun = 3): Promise<TopUpSummary> {
  if (!config.enabled) return { skipped: true, reason: "AI_QUESTIONS_ENABLED nao e 'true'", batches: [] };
  if (!config.anthropicApiKey) return { skipped: true, reason: "ANTHROPIC_API_KEY ausente", batches: [] };
  if (running) return { skipped: true, reason: "ja ha uma verificacao de estoque em andamento", batches: [] };

  running = true;
  try {
    const alreadyToday = batchesRunToday();
    if (alreadyToday >= config.maxBatchesPerDay) {
      return { skipped: true, reason: `limite diario de lotes atingido (${alreadyToday}/${config.maxBatchesPerDay})`, batches: [] };
    }

    const report = getStockReport()
      .map((b) => ({ ...b, deficit: config.minStockPerBucket - b.count }))
      .filter((b) => b.deficit > 0)
      .sort((a, b) => b.deficit - a.deficit);

    const remainingBudget = config.maxBatchesPerDay - alreadyToday;
    const toProcess = report.slice(0, Math.min(maxBucketsPerRun, remainingBudget));

    const batches: TopUpSummary["batches"] = [];
    for (const bucket of toProcess) {
      const target = Math.min(config.targetStockPerBucket - bucket.count, config.batchSize);
      if (target <= 0) continue;
      const result = await runGenerationBatch(config, bucket.category, bucket.difficulty, target);
      batches.push({ category: bucket.category, difficulty: bucket.difficulty, result });
    }
    return { skipped: false, batches };
  } finally {
    running = false;
  }
}
