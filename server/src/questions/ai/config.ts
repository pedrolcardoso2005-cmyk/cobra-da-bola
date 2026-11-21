// Central place for every env var the AI question-generation pipeline
// reads. Nothing here is ever sent to web/ -- these are process.env lookups
// on the server only, same pattern as JWT_SECRET/SMTP_* in auth/.
//
// Safety default: the whole pipeline is OFF unless AI_QUESTIONS_ENABLED is
// explicitly "true". Deploying this code must never, by itself, start
// spending money or calling an external API (requirement from the project
// owner: nothing changes in production without an explicit opt-in).
export interface AiQuestionsConfig {
  enabled: boolean;
  anthropicApiKey: string | null;
  anthropicModel: string;
  openaiApiKey: string | null;
  embeddingModel: string;
  minStockPerBucket: number;
  targetStockPerBucket: number;
  batchSize: number;
  maxBatchesPerDay: number;
  maxBucketsPerRun: number;
  autoApprove: boolean;
  duplicateRejectThreshold: number;
  duplicateReviewThreshold: number;
}

export function loadAiQuestionsConfig(): AiQuestionsConfig {
  return {
    enabled: process.env.AI_QUESTIONS_ENABLED === "true",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? null,
    anthropicModel: process.env.AI_QUESTIONS_MODEL ?? "claude-sonnet-4-5",
    openaiApiKey: process.env.OPENAI_API_KEY ?? null,
    embeddingModel: process.env.AI_QUESTIONS_EMBEDDING_MODEL ?? "text-embedding-3-small",
    minStockPerBucket: Number(process.env.AI_QUESTIONS_MIN_STOCK ?? 15),
    targetStockPerBucket: Number(process.env.AI_QUESTIONS_TARGET_STOCK ?? 40),
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
