import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth/routes.js";
import { deleteCareerQuestion, deleteQuestion, insertCareerQuestion, insertQuestion, listCareerQuestions, listQuestions, updateQuestion } from "../db/questions.js";

export const questionsRouter = Router();

questionsRouter.get("/", requireAuth, (req, res) => {
  res.json({ questions: listQuestions({ category: req.query.category as any, difficulty: req.query.difficulty as any }) });
});

const questionSchema = z.object({
  category: z.string(),
  difficulty: z.enum(["facil", "moderado", "medio", "dificil", "impossivel"]),
  format: z.enum(["aberta", "verdadeiro_falso", "sequencia", "multipla_escolha"]),
  prompt: z.string().min(3).max(500),
  choices: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1).max(200),
  acceptedAnswers: z.array(z.string()).optional(),
});

questionsRouter.post("/", requireAuth, (req: any, res) => {
  const parsed = questionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados invalidos", details: parsed.error.flatten() });
  const q = insertQuestion(parsed.data as any, req.user.id);
  res.status(201).json({ question: q });
});

questionsRouter.put("/:id", requireAuth, (req, res) => {
  const parsed = questionSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados invalidos" });
  updateQuestion(req.params.id, parsed.data as any);
  res.json({ ok: true });
});

questionsRouter.delete("/:id", requireAuth, (req, res) => {
  deleteQuestion(req.params.id);
  res.json({ ok: true });
});

questionsRouter.get("/carreiras", requireAuth, (_req, res) => {
  res.json({ careerQuestions: listCareerQuestions() });
});

const careerSchema = z.object({
  clubs: z.array(z.string().min(1)).min(2).max(8),
  playerName: z.string().min(2).max(100),
  acceptedAnswers: z.array(z.string()).optional(),
});

questionsRouter.post("/carreiras", requireAuth, (req, res) => {
  const parsed = careerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Dados invalidos" });
  const c = insertCareerQuestion(parsed.data);
  res.status(201).json({ careerQuestion: c });
});

questionsRouter.delete("/carreiras/:id", requireAuth, (req, res) => {
  deleteCareerQuestion(req.params.id);
  res.json({ ok: true });
});
