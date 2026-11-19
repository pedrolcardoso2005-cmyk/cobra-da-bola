import type { Difficulty, QuestionCategory } from "@cobra/shared";
import { callAnthropicForStructuredOutput } from "./anthropicClient.js";
import type { GeneratedQuestionCandidate } from "./types.js";

const TOOL_NAME = "submit_questions";

const QUESTION_ITEM_SCHEMA = {
  type: "object",
  required: ["category", "difficulty", "format", "prompt", "correctAnswer", "explanation", "sourceUrl"],
  properties: {
    category: { type: "string" },
    difficulty: { type: "string", enum: ["facil", "moderado", "medio", "dificil", "impossivel"] },
    format: { type: "string", enum: ["aberta", "verdadeiro_falso", "sequencia", "multipla_escolha"] },
    prompt: { type: "string" },
    choices: { type: "array", items: { type: "string" } },
    correctAnswer: { type: "string" },
    acceptedAnswers: { type: "array", items: { type: "string" } },
    explanation: { type: "string" },
    sourceUrl: { type: "string" },
    seasonRef: { type: "string" },
  },
} as const;

const TOOL_INPUT_SCHEMA = {
  type: "object",
  required: ["questions"],
  properties: {
    questions: { type: "array", items: QUESTION_ITEM_SCHEMA },
  },
} as const;

const SYSTEM_PROMPT = `Voce gera perguntas de quiz de futebol em portugues do Brasil para o jogo "Cobra da Bola".

Regras obrigatorias:
- NUNCA invente ou arredonde fatos. Use a ferramenta de busca na web para confirmar cada fato antes de incluir a pergunta.
- Toda pergunta precisa de uma "sourceUrl" real e especifica (a pagina onde o fato foi confirmado), nunca uma URL generica ou inventada.
- Prefira fatos bem documentados e estaveis (resultados historicos, campeoes, recordes consolidados) a estatisticas que mudam com frequencia. Quando a pergunta depender de uma temporada/ano especifico, preencha "seasonRef".
- Nao repita nenhum fato (mesmo pergunta reformulada, mesmo evento, mesma resposta no mesmo contexto) que ja apareca na lista de perguntas existentes fornecida pelo usuario.
- "correctAnswer" deve ser a resposta canonica; use "acceptedAnswers" para variacoes aceitas (sem acento, abreviacoes comuns).
- Para "multipla_escolha", preencha "choices" com 4 opcoes incluindo a correta. Para "verdadeiro_falso", "correctAnswer" deve ser exatamente "verdadeiro" ou "falso".
- "explanation" e uma frase curta com o contexto do fato, para o apresentador.
- Ao terminar a pesquisa, chame a ferramenta "${TOOL_NAME}" exatamente uma vez com o array completo de perguntas geradas. Nao chame a ferramenta antes de confirmar os fatos.`;

export interface GenerateBatchParams {
  apiKey: string;
  model: string;
  category: QuestionCategory;
  difficulty: Difficulty;
  count: number;
  existingPrompts: string[];
  useWebSearch: boolean;
}

export interface GenerateBatchResult {
  candidates: GeneratedQuestionCandidate[];
  stopReason: string | null;
}

export async function generateQuestionBatch(params: GenerateBatchParams): Promise<GenerateBatchResult> {
  const existingList =
    params.existingPrompts.length > 0
      ? params.existingPrompts.map((p, i) => `${i + 1}. ${p}`).join("\n")
      : "(nenhuma ainda para esta categoria)";

  const userMessage = `Gere ${params.count} perguntas novas, categoria "${params.category}", dificuldade "${params.difficulty}".

Perguntas que JA existem nesta categoria (nao repita o mesmo fato, nem reformulado):
${existingList}

Responda chamando a ferramenta "${TOOL_NAME}" com exatamente ${params.count} perguntas (ou menos, se nao conseguir confirmar fatos suficientes -- prefira gerar menos e corretas do que completar a cota com algo nao verificado).`;

  const result = await callAnthropicForStructuredOutput({
    apiKey: params.apiKey,
    model: params.model,
    system: SYSTEM_PROMPT,
    userMessage,
    toolName: TOOL_NAME,
    toolInputSchema: TOOL_INPUT_SCHEMA,
    useWebSearch: params.useWebSearch,
    maxTokens: Math.max(4000, params.count * 400),
  });

  if (!result.toolInput || typeof result.toolInput !== "object") {
    return { candidates: [], stopReason: result.stopReason };
  }
  const questions = (result.toolInput as { questions?: unknown }).questions;
  if (!Array.isArray(questions)) return { candidates: [], stopReason: result.stopReason };

  return { candidates: questions as GeneratedQuestionCandidate[], stopReason: result.stopReason };
}
