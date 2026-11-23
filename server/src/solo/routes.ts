// Solo mode: a single player answering questions / playing the Desafio das
// Carreiras without a room, Socket.IO, or an opponent. Deliberately a thin
// REST layer over the exact same selection functions the multiplayer game
// uses (pickRandomQuestion/pickRandomCareerQuestion, answersMatch) -- no
// second question/career engine, no AI call of any kind, only content
// already stored and approved (same pool the game itself reads from).
import { Router } from "express";
import { z } from "zod";
import { answersMatch } from "@cobra/shared";
import { requireAuth } from "../auth/routes.js";
import {
  getApprovedCareerById,
  getApprovedQuestionById,
  pickRandomCareerQuestion,
  pickRandomQuestion,
} from "../db/questions.js";
import { toPublicCareer, toPublicQuestion } from "../game/view.js";
import { getSoloHistorySummary, recordSoloAnswer, type SoloKind, type SoloResult } from "../db/soloHistory.js";

export const soloRouter = Router();

function csv(value: unknown): string[] {
  if (typeof value !== "string" || value.trim() === "") return [];
  return value.split(",").filter(Boolean);
}

/** Never lets a history-logging hiccup fail the answer/skip response the
 * player is actually waiting on -- "Meu Historico" is a record of the
 * match, not a gate on playing it. */
function logSoloAnswer(userId: string, kind: SoloKind, sessionId: unknown, result: SoloResult): void {
  try {
    recordSoloAnswer({ userId, kind, sessionId: typeof sessionId === "string" && sessionId ? sessionId : "sem-sessao", result });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Falha ao registrar historico solo", err);
  }
}

soloRouter.get("/historico", requireAuth, (req: any, res) => {
  res.json(getSoloHistorySummary(req.user.id));
});

soloRouter.get("/pergunta", requireAuth, (req, res) => {
  // Sem filtro de tema/dificuldade: sorteia do banco inteiro.
  const excludeIds = csv(req.query.excludeIds);
  const q = pickRandomQuestion({ categories: ["aleatorio"], difficulties: [], excludeIds });
  res.json({ question: q ? toPublicQuestion(q) : null });
});

const answerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string(),
  sessionId: z.string().min(1).optional(),
});

soloRouter.post("/pergunta/responder", requireAuth, (req: any, res) => {
  const parsed = answerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados invalidos" });
  const q = getApprovedQuestionById(parsed.data.questionId);
  if (!q) return res.status(404).json({ error: "Pergunta nao encontrada" });
  const correct = answersMatch(parsed.data.answer, q.correctAnswer, q.acceptedAnswers);
  logSoloAnswer(req.user.id, "pergunta", parsed.data.sessionId, correct ? "correct" : "wrong");
  res.json({ correct, correctAnswer: q.correctAnswer, acceptedAnswers: q.acceptedAnswers, explanation: q.explanation ?? null });
});

const skipQuestionSchema = z.object({ questionId: z.string().min(1), sessionId: z.string().min(1).optional() });

soloRouter.post("/pergunta/pular", requireAuth, (req: any, res) => {
  const parsed = skipQuestionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados invalidos" });
  const q = getApprovedQuestionById(parsed.data.questionId);
  if (!q) return res.status(404).json({ error: "Pergunta nao encontrada" });
  logSoloAnswer(req.user.id, "pergunta", parsed.data.sessionId, "skipped");
  res.json({ correctAnswer: q.correctAnswer, acceptedAnswers: q.acceptedAnswers, explanation: q.explanation ?? null });
});

soloRouter.get("/carreira", requireAuth, (req, res) => {
  const excludeIds = csv(req.query.excludeIds);
  const c = pickRandomCareerQuestion({ themes: ["aleatorio"], difficulties: [], excludeIds });
  res.json({ career: c ? toPublicCareer(c) : null });
});

const careerAnswerSchema = z.object({
  careerId: z.string().min(1),
  answer: z.string(),
  sessionId: z.string().min(1).optional(),
});

soloRouter.post("/carreira/responder", requireAuth, (req: any, res) => {
  const parsed = careerAnswerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados invalidos" });
  const c = getApprovedCareerById(parsed.data.careerId);
  if (!c) return res.status(404).json({ error: "Carreira nao encontrada" });
  const correct = answersMatch(parsed.data.answer, c.playerName, c.acceptedAnswers);
  logSoloAnswer(req.user.id, "carreira", parsed.data.sessionId, correct ? "correct" : "wrong");
  res.json({ correct, playerName: c.playerName, acceptedAnswers: c.acceptedAnswers ?? null });
});

const skipCareerSchema = z.object({ careerId: z.string().min(1), sessionId: z.string().min(1).optional() });

soloRouter.post("/carreira/pular", requireAuth, (req: any, res) => {
  const parsed = skipCareerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados invalidos" });
  const c = getApprovedCareerById(parsed.data.careerId);
  if (!c) return res.status(404).json({ error: "Carreira nao encontrada" });
  logSoloAnswer(req.user.id, "carreira", parsed.data.sessionId, "skipped");
  res.json({ playerName: c.playerName, acceptedAnswers: c.acceptedAnswers ?? null });
});
