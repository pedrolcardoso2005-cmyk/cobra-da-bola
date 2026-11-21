// Central place for every env var the AI question-generation pipeline
// reads. Nothing here is ever sent to web/ -- these are process.env lookups
// on the server only, same pattern as JWT_SECRET/SMTP_* in auth/.
//
// Safety default: the whole pipeline is OFF unless AI_QUESTIONS_ENABLED is
// explicitly "true". Deploying this code must never, by itself, start
// spending money or calling an external API (requirement from the project
// owner: nothing changes in production without an explicit opt-in).
import type { Difficulty } from "@cobra/shared";

export interface AiQuestionsConfig {
  enabled: boolean;
  anthropicApiKey: string | null;
  anthropicModel: string;
  openaiApiKey: string | null;
  embeddingModel: string;
  /** Fallback min/target used for any difficulty without its own override
   * below. Kept so existing env vars/tests keep working unchanged. */
  minStockPerBucket: number;
  targetStockPerBucket: number;
  /** Per-difficulty overrides of the two numbers above -- the reference
   * stock goal (~3000 total: 750 each for facil/moderado/medio, 750 split
   * across dificil+impossivel) only makes sense per difficulty, since
   * "impossivel" content is both harder to source and rarer in real
   * matches than "facil". A category x difficulty bucket's min/target is
   * minStockPerDifficulty[difficulty] ?? minStockPerBucket (see
   * stock.ts's minStockFor/targetStockFor). Configurable instead of
   * hardcoded, per env var AI_QUESTIONS_MIN_STOCK_<DIFFICULTY>. */
  minStockPerDifficulty: Partial<Record<Difficulty, number>>;
  targetStockPerDifficulty: Partial<Record<Difficulty, number>>;
  batchSize: number;
  maxBatchesPerDay: number;
  maxBucketsPerRun: number;
  autoApprove: boolean;
  duplicateRejectThreshold: number;
  duplicateReviewThreshold: number;
  /** A bucket with this many consecutive failed generation attempts
   * (see db/questions.ts recentFailureStreak) is skipped by checkAndTopUp
   * until someone looks at it, instead of burning the daily budget on a
   * structurally broken bucket forever. 0 disables the breaker. */
  circuitBreakerThreshold: number;
  /** How far back (hours) checkAndTopUp looks at question_consumption_log
   * to weigh "how fast is this bucket being drained" into replenishment
   * priority, alongside the static deficit. */
  demandWindowHours: number;
  /** How many deficit-points one consumption-per-hour in that window is
   * worth, when ranking which deficient buckets to replenish first (see
   * stock.ts prioritizeBuckets). 0 disables demand weighting entirely
   * (falls back to pure deficit order, the pre-existing behavior). */
  demandWeight: number;
}

const DIFFICULTIES: Difficulty[] = ["facil", "moderado", "medio", "dificil", "impossivel"];

// Reference goal from the project owner: ~3000 questions total, 750 each
// for facil/moderado/medio and 750 split across dificil+impossivel (375
// each), spread over QUESTION_CATEGORIES.length (14) categories. 750/14
// and 375/14, rounded up so the sum of per-bucket targets never falls
// short of the stated goal.
const DEFAULT_TARGET_PER_DIFFICULTY: Record<Difficulty, number> = {
  facil: 54,
  moderado: 54,
  medio: 54,
  dificil: 27,
  impossivel: 27,
};
// Safety floor (the stock watcher's trigger to replenish at all) -- lower
// than the target on purpose, so a bucket isn't re-topped every single
// run the moment it drops one question below the target.
const DEFAULT_MIN_PER_DIFFICULTY: Record<Difficulty, number> = {
  facil: 20,
  moderado: 20,
  medio: 20,
  dificil: 10,
  impossivel: 10,
};

function perDifficultyFromEnv(prefix: string, defaults: Record<Difficulty, number>): Record<Difficulty, number> {
  const out = {} as Record<Difficulty, number>;
  for (const d of DIFFICULTIES) {
    const envVar = `${prefix}_${d.toUpperCase()}`;
    out[d] = Number(process.env[envVar] ?? defaults[d]);
  }
  return out;
}

export function loadAiQuestionsConfig(): AiQuestionsConfig {
  return {
    enabled: process.env.AI_QUESTIONS_ENABLED === "true",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? null,
    anthropicModel: process.env.AI_QUESTIONS_MODEL ?? "claude-sonnet-5-5",
    openaiApiKey: process.env.OPENAI_API_KEY ?? null,
    embeddingModel: process.env.AI_QUESTIONS_EMBEDDING_MODEL ?? "text-embedding-3-small",
    minStockPerBucket: Number(process.env.AI_QUESTIONS_MIN_STOCK ?? 15),
    targetStockPerBucket: Number(process.env.AI_QUESTIONS_TARGET_STOCK ?? 40),
    minStockPerDifficulty: perDifficultyFromEnv("AI_QUESTIONS_MIN_STOCK", DEFAULT_MIN_PER_DIFFICULTY),
    targetStockPerDifficulty: perDifficultyFromEnv("AI_QUESTIONS_TARGET_STOCK", DEFAULT_TARGET_PER_DIFFICULTY),
    circuitBreakerThreshold: Number(process.env.AI_QUESTIONS_CIRCUIT_BREAKER_THRESHOLD ?? 3),
    demandWindowHours: Number(process.env.AI_QUESTIONS_DEMAND_WINDOW_HOURS ?? 24),
    demandWeight: Number(process.env.AI_QUESTIONS_DEMAND_WEIGHT ?? 2),
    batchSize: Number(process.env.AI_QUESTIONS_BATCH_SIZE ?? 20),
    // 70 buckets no total (14 categorias x 5 dificuldades). Com 4 por
    // execucao e ate 12 lotes/dia, um bucket deficitario qualquer e
    // alcancado em no maximo ~6 dias (70/12), e cada lote pedido custa no
    // maximo "batchSize" perguntas -- crescimento prudente, nunca "gerar
    // tudo de uma vez".
    maxBatchesPerDay: Number(process.env.AI_QUESTIONS_MAX_BATCHES_PER_DAY ?? 12),
    maxBucketsPerRun: Number(process.env.AI_QUESTIONS_MAX_BUCKETS_PER_RUN ?? 4),
    autoApprove: process.env.AI_QUESTIONS_AUTO_APPROVE === "true",
    duplicateRejectThreshold: Number(process.env.AI_QUESTIONS_DUP_REJECT_THRESHOLD ?? 0.95),
    duplicateReviewThreshold: Number(process.env.AI_QUESTIONS_DUP_REVIEW_THRESHOLD ?? 0.85),
  };
}
