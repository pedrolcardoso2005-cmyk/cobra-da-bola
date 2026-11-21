import { Router } from "express";
import { z } from "zod";
import type { Difficulty, QuestionCategory } from "@cobra/shared";
import { requireAdmin, requireAuth } from "../../auth/routes.js";
import { approveQuestion, listPendingQuestions, listRecentGenerationLog, rejectQuestion } from "../../db/questions.js";
import { loadAiQuestionsConfig } from "./config.js";
import { acquireGenerationLock, getStockReport, minStockFor, releaseGenerationLock, targetStockFor } from "./stock.js";
import { runGenerationBatch } from "./pipeline.js";
import { QUESTION_CATEGORIES, DIFFICULTIES } from "./buckets.js";

// Mounted under /api/perguntas/ia. Every route here is an administrative
// function (review/approve/reject/generate, and the stock/history reports
// that exist only to support those decisions) -- requireAuth confirms
// *who* is asking, requireAdmin confirms they're allowed to ask for this.
// A regular player authenticated for the game gets 403 here, same as
// before this pipeline existed they'd get for any other admin-only route.
export const aiReviewRouter = Router();
aiReviewRouter.use(requireAuth, requireAdmin);

aiReviewRouter.get("/pendentes", (_req, res) => {
  res.json({ pending: listPendingQuestions() });
});

aiReviewRouter.post("/pendentes/:id/aprovar", (req, res) => {
  try {
    approveQuestion(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : "Erro ao aprovar" });
  }
});

aiReviewRouter.post("/pendentes/:id/rejeitar", (req, res) => {
  try {
    rejectQuestion(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : "Erro ao rejeitar" });
  }
});

// Enriched with the per-difficulty thresholds (config.ts) so the caller
// can flag "estoque critico" (count < min) without re-implementing the
// same lookup the watcher itself uses (see stock.ts minStockFor).
aiReviewRouter.get("/estoque", (_req, res) => {
  const config = loadAiQuestionsConfig();
  const stock = getStockReport().map((b) => {
    const min = minStockFor(config, b.difficulty);
    return { ...b, min, target: targetStockFor(config, b.difficulty), critico: b.count < min };
  });
  res.json({ stock });
});

// Raw feed behind "historico de geracao" / token-consumption reporting --
// newest first, nothing aggregated, so the (future) admin UI decides how
// to group/chart it.
aiReviewRouter.get("/historico", (req, res) => {
  const limit = Math.min(200, Math.max(1, Number(req.query.limit ?? 50)));
  res.json({ log: listRecentGenerationLog(limit) });
});

const triggerSchema = z.object({
  category: z.enum(QUESTION_CATEGORIES as [string, ...string[]]),
  difficulty: z.enum(DIFFICULTIES as [string, ...string[]]),
  count: z.number().int().min(1).max(100).default(20),
});

// Manual/deliberate pre-stocking ("A" in the hybrid A/B strategy): an admin
// explicitly asks for a batch now, instead of waiting for the automatic
// low-stock watcher ("B", see stock.ts) to trigger one on its own.
aiReviewRouter.post("/gerar", async (req, res) => {
  const parsed = triggerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados invalidos", details: parsed.error.flatten() });

  const config = loadAiQuestionsConfig();
  if (!config.anthropicApiKey) {
    return res.status(503).json({ error: "ANTHROPIC_API_KEY nao configurada no servidor" });
  }
  // Shares the exact same lock as the automatic watcher (stock.ts) --
  // without this, a manual trigger fired while the boot/6h check is
  // mid-run would race it on the same bucket or blow through the daily
  // budget twice in the same instant.
  if (!acquireGenerationLock()) {
    return res.status(409).json({ error: "Ja ha uma geracao em andamento (automatica ou manual) -- tente novamente em alguns instantes" });
  }
  try {
    const { category, difficulty, count } = parsed.data;
    const result = await runGenerationBatch(config, category as QuestionCategory, difficulty as Difficulty, count);
    res.json({ result });
  } finally {
    releaseGenerationLock();
  }
});
