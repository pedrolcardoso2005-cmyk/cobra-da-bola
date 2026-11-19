import { z } from "zod";
import type { GeneratedQuestionCandidate, ValidationOutcome } from "./types.js";

// Mirrors questionsRouter's questionSchema (questions/routes.ts) plus the
// fields that are mandatory for AI-generated content specifically: a
// hand-written bank entry can omit a source, a generated one never can.
const candidateSchema = z
  .object({
    category: z.string().min(1),
    difficulty: z.enum(["facil", "moderado", "medio", "dificil", "impossivel"]),
    format: z.enum(["aberta", "verdadeiro_falso", "sequencia", "multipla_escolha"]),
    prompt: z.string().trim().min(10).max(500),
    choices: z.array(z.string().trim().min(1)).optional(),
    correctAnswer: z.string().trim().min(1).max(200),
    acceptedAnswers: z.array(z.string().trim().min(1)).optional(),
    explanation: z.string().trim().min(5).max(400),
    sourceUrl: z.string().trim().url(),
    seasonRef: z.string().trim().min(1).max(50).optional(),
  })
  .strict();

/** Structural/shape validation only -- no network calls. Catches malformed
 * output from the model before it ever reaches the dedupe/insert steps. */
export function validateCandidateShape(candidate: unknown): ValidationOutcome {
  const parsed = candidateSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, reason: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  }
  const q = parsed.data;

  if (q.format === "multipla_escolha") {
    if (!q.choices || q.choices.length < 2) return { ok: false, reason: "multipla_escolha precisa de pelo menos 2 choices" };
    if (!q.choices.some((c) => c.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase())) {
      return { ok: false, reason: "correctAnswer nao esta entre as choices" };
    }
  }
  if (q.format === "verdadeiro_falso") {
    const norm = q.correctAnswer.trim().toLowerCase();
    if (norm !== "verdadeiro" && norm !== "falso") {
      return { ok: false, reason: 'verdadeiro_falso exige correctAnswer "verdadeiro" ou "falso"' };
    }
  }
  return { ok: true };
}

/** Lightweight grounding check: confirms the claimed source URL actually
 * resolves. This is NOT a fact-check (it can't confirm the page supports
 * the specific claim) -- it only catches invented/dead URLs, which is why
 * a failure here routes the question to manual review instead of hard
 * rejecting it (see pipeline.ts). Never throws: network issues are treated
 * as "could not confirm", not as a crash. */
export async function isSourceReachable(url: string, timeoutMs = 8000): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export function toQuestionInput(candidate: GeneratedQuestionCandidate) {
  return {
    category: candidate.category,
    difficulty: candidate.difficulty,
    format: candidate.format,
    prompt: candidate.prompt.trim(),
    choices: candidate.choices,
    correctAnswer: candidate.correctAnswer.trim(),
    acceptedAnswers: candidate.acceptedAnswers,
    explanation: candidate.explanation.trim(),
    sourceUrl: candidate.sourceUrl.trim(),
    seasonRef: candidate.seasonRef?.trim(),
  };
}
