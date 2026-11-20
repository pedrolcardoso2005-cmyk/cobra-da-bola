// Solo mode: a single player answering questions / playing the Desafio das
// Carreiras without a room, Socket.IO, or an opponent. Deliberately a thin
// REST layer over the exact same selection functions the multiplayer game
// uses (pickRandomQuestion/pickRandomCareerQuestion, answersMatch) -- no
// second question/career engine, no AI call of any kind, only content
// already stored and approved (same pool the game itself reads from).
import { Router } from "express";
import { z } from "zod";
import { answersMatch, type CareerTheme, type Difficulty, type QuestionCategory } from "@cobra/shared";
import { requireAuth } from "../auth/routes.js";
import {
  getApprovedCareerById,
  getApprovedQuestionById,
  pickRandomCareerQuestion,
  pickRandomQuestion,
} from "../db/questions.js";
import { toPublicCareer, toPublicQuestion } from "../game/view.js";

export const soloRouter = Router();

function csv(value: unknown): string[] {
  if (typeof value !== "string" || value.trim() === "") return [];
  return value.split(",").filter(Boolean);
}

soloRouter.get("/pergunta", requireAuth, (req, res) => {
  const categories = csv(req.query.categories) as QuestionCategory[];
  const difficulties = csv(req.query.difficulties) as Difficulty[];
  const excludeIds = csv(req.query.excludeIds);
  const q = pickRandomQuestion({ categories, difficulties, excludeIds });
  res.json({ question: q ? toPublicQuestion(q) : null });
});

const answerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string(),
});

soloRouter.post("/pergunta/responder", requireAuth, (req, res) => {
  const parsed = answerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados invalidos" });
  const q = getApprovedQuestionById(parsed.data.questionId);
  if (!q) return res.status(404).json({ error: "Pergunta nao encontrada" });
  const correct = answersMatch(parsed.data.answer, q.correctAnswer, q.acceptedAnswers);
  res.json({ correct, correctAnswer: q.correctAnswer, acceptedAnswers: q.acceptedAnswers, explanation: q.explanation ?? null });
});

soloRouter.get("/carreira", requireAuth, (req, res) => {
  const themes = csv(req.query.themes) as CareerTheme[];
  const difficulties = csv(req.query.difficulties) as Difficulty[];
  const excludeIds = csv(req.query.excludeIds);
  const c = pickRandomCareerQuestion({ themes, difficulties, excludeIds });
  res.json({ career: c ? toPublicCareer(c) : null });
});

const careerAnswerSchema = z.object({
  careerId: z.string().min(1),
  answer: z.string(),
});

soloRouter.post("/carreira/responder", requireAuth, (req, res) => {
  const parsed = careerAnswerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados invalidos" });
  const c = getApprovedCareerById(parsed.data.careerId);
  if (!c) return res.status(404).json({ error: "Carreira nao encontrada" });
  const correct = answersMatch(parsed.data.answer, c.playerName, c.acceptedAnswers);
  res.json({ correct, playerName: c.playerName, acceptedAnswers: c.acceptedAnswers ?? null });
});
