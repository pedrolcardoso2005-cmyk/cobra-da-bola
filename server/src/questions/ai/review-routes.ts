import { Router } from "express";
import { z } from "zod";
import type { Difficulty, QuestionCategory } from "@cobra/shared";
import { requireAuth } from "../../auth/routes.js";
import { approveQuestion, listPendingQuestions, rejectQuestion } from "../../db/questions.js";
import { loadAiQuestionsConfig } from "./config.js";
import { getStockReport } from "./stock.js";
import { runGenerationBatch } from "./pipeline.js";
import { QUESTION_CATEGORIES, DIFFICULTIES } from "./buckets.js";

// Mounted under /api/perguntas/ia. Uses the same requireAuth as the rest of
// questions/routes.ts -- this project has no separate admin role today
// (any authenticated user can already create/edit/delete questions via the
// existing CRUD routes), so this follows the same convention rather than
// introducing a new permission concept on its own.
export const aiReviewRouter = Router();

aiReviewRouter.get("/pendentes", requireAuth, (_req, res) => {
  res.json({ pending: listPendingQuestions() });
});

aiReviewRouter.post("/pendentes/:id/aprovar", requireAuth, (req, res) => {
  try {
    approveQuestion(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : "Erro ao aprovar" });
  }
});

aiReviewRouter.post("/pendentes/:id/rejeitar", requireAuth, (req, res) => {
  try {
    rejectQuestion(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(404).json({ error: err instanceof Error ? err.message : "Erro ao rejeitar" });
  }
});

aiReviewRouter.get("/estoque", requireAuth, (_req, res) => {
  res.json({ stock: getStockReport() });
});

const triggerSchema = z.object({
  category: z.enum(QUESTION_CATEGORIES as [string, ...string[]]),
  difficulty: z.enum(DIFFICULTIES as [string, ...string[]]),
  count: z.number().int().min(1).max(100).default(20),
});

// Manual/deliberate pre-stocking ("A" in the hybrid A/B strategy): an admin
// explicitly asks for a batch now, instead of waiting for the automatic
// low-stock watcher ("B", see stock.ts) to trigger one on its own.
aiReviewRouter.post("/gerar", requireAuth, async (req, res) => {
  const parsed = triggerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados invalidos", details: parsed.error.flatten() });

  const config = loadAiQuestionsConfig();
  if (!config.anthropicApiKey) {
    return res.status(503).json({ error: "ANTHROPIC_API_KEY nao configurada no servidor" });
  }
  const { category, difficulty, count } = parsed.data;
  const result = await runGenerationBatch(config, category as QuestionCategory, difficulty as Difficulty, count);
  res.json({ result });
});
