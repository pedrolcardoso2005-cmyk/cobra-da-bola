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

// Cada nivel precisa de uma descricao concreta e distinta -- sem isso, o
// modelo recebia so a palavra solta ("impossivel", "dificil", ...) e nao
// tinha como calibrar o quao mais dificil uma deveria ser da outra,
// resultando em perguntas "impossivel" que eram, na pratica, perguntas
// "dificil" com outro rotulo.
export const DIFFICULTY_GUIDANCE: Record<Difficulty, string> = {
  facil: "Fato amplamente conhecido por qualquer torcedor casual (campeoes mundiais recentes, clubes grandes, jogadores muito famosos). Qualquer pessoa que assista futebol de vez em quando deveria acertar.",
  moderado: "Conhecido por quem acompanha futebol com regularidade, mas nao precisa ser fanatico -- resultados e nomes relevantes que aparecem no noticiario esportivo comum.",
  medio: "Exige conhecimento de um torcedor dedicado: edicoes especificas de competicoes, jogadores menos midiaticos, estatisticas que nao sao do dia a dia do noticiario.",
  dificil: "Conhecimento de fa hardcore ou de quem estuda futebol a serio: recordes especificos, jogadores ou times de nicho, fatos de decadas passadas que exigem pesquisa para confirmar.",
  impossivel: "Nivel de especialista/jornalista esportivo. Estatisticas extremamente obscuras, jogadores secundarios de elencos antigos, numeros exatos (datas, placares, minutos) que quase ninguem saberia de cabeca, competicoes ou eras pouco cobertas pela midia. Tem que ser genuinamente dificil ate para quem manja muito de futebol -- NUNCA uma pergunta 'dificil' reformulada com outro rotulo.",
};

const SYSTEM_PROMPT = `Voce gera perguntas de quiz de futebol em portugues do Brasil para o jogo "Cobra da Bola".

Escala de dificuldade (cada nivel precisa ser nitidamente mais dificil que o anterior -- nunca gere uma pergunta de um nivel que poderia facilmente pertencer ao nivel vizinho):
- facil: ${DIFFICULTY_GUIDANCE.facil}
- moderado: ${DIFFICULTY_GUIDANCE.moderado}
- medio: ${DIFFICULTY_GUIDANCE.medio}
- dificil: ${DIFFICULTY_GUIDANCE.dificil}
- impossivel: ${DIFFICULTY_GUIDANCE.impossivel}

Regras obrigatorias:
- NUNCA invente ou arredonde fatos. Use a ferramenta de busca na web para confirmar cada fato antes de incluir a pergunta.
- Toda pergunta precisa de uma "sourceUrl" real e especifica (a pagina onde o fato foi confirmado), nunca uma URL generica ou inventada.
- Prefira fatos bem documentados e estaveis (resultados historicos, campeoes, recordes consolidados) a estatisticas que mudam com frequencia. Quando a pergunta depender de uma temporada/ano especifico, preencha "seasonRef".
- Nao repita nenhum fato (mesmo pergunta reformulada, mesmo evento, mesma resposta no mesmo contexto) que ja apareca na lista de perguntas existentes fornecida pelo usuario.
- "correctAnswer" deve ser a resposta canonica; use "acceptedAnswers" para variacoes aceitas (sem acento, abreviacoes comuns).
- Para "multipla_escolha", preencha "choices" com 4 opcoes incluindo a correta. Para "verdadeiro_falso", "correctAnswer" deve ser exatamente "verdadeiro" ou "falso".
- "explanation" e uma frase curta com o contexto do fato, para o apresentador.
- Ao terminar a pesquisa, chame a ferramenta "${TOOL_NAME}" exatamente uma vez com o array completo de perguntas geradas. Nao chame a ferramenta antes de confirmar os fatos.`;

// Harder difficulties need more web-search/verification before the model
// can confirm a fact (see SYSTEM_PROMPT above), and search-tool-result
// content counts toward max_tokens just like the model's own text (see
// anthropicClient.ts) -- so a budget sized only by `count` starves large
// "dificil"/"impossivel" batches long before they reach the final tool
// call (observed in production: stop_reason=max_tokens, continuacoes=0).
// Scaled per question by difficulty, with a floor for small batches and a
// ceiling well under the model's 128k synchronous-request limit.
const TOKENS_PER_QUESTION: Record<Difficulty, number> = {
  facil: 500,
  moderado: 650,
  medio: 850,
  dificil: 1200,
  impossivel: 1800,
};
const MIN_MAX_TOKENS = 6000;
const MAX_MAX_TOKENS = 64000;

function maxTokensFor(difficulty: Difficulty, count: number): number {
  return Math.min(MAX_MAX_TOKENS, Math.max(MIN_MAX_TOKENS, count * TOKENS_PER_QUESTION[difficulty]));
}

/** Pulls the generated questions array out of the tool call's `input`,
 * tolerating the shapes models have actually sent in production even
 * though the schema asks for `{ questions: [...] }`: the array sent
 * directly as `input` (schema flattening, seen for larger batches), or
 * `questions` double-encoded as a JSON string. Never relaxes per-question
 * validation -- that still happens in validate.ts/pipeline.ts on whatever
 * array comes back here. Returns null when no array can be found at all. */
function extractQuestionsArray(toolInput: unknown): unknown[] | null {
  if (Array.isArray(toolInput)) return toolInput;
  if (!toolInput || typeof toolInput !== "object") return null;
  const raw = (toolInput as { questions?: unknown }).questions;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // falls through to null below -- an unparseable string is not a
      // valid questions array either.
    }
  }
  return null;
}

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
  usage: { inputTokens: number; outputTokens: number } | null;
  diagnostic: string | null;
}

export async function generateQuestionBatch(params: GenerateBatchParams): Promise<GenerateBatchResult> {
  const existingList =
    params.existingPrompts.length > 0
      ? params.existingPrompts.map((p, i) => `${i + 1}. ${p}`).join("\n")
      : "(nenhuma ainda para esta categoria)";

  const userMessage = `Gere ${params.count} perguntas novas, categoria "${params.category}", dificuldade "${params.difficulty}".

O que "${params.difficulty}" significa aqui, especificamente (siga esta calibracao, nao a palavra isolada): ${DIFFICULTY_GUIDANCE[params.difficulty]}

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
    maxTokens: maxTokensFor(params.difficulty, params.count),
  });

  if (!result.toolInput) {
    return {
      candidates: [],
      stopReason: result.stopReason,
      usage: result.usage,
      diagnostic: `Anthropic nao chamou a ferramenta ${TOOL_NAME} (stop_reason=${result.stopReason ?? "ausente"}; continuacoes=${result.continuationCount})`,
    };
  }
  const questions = extractQuestionsArray(result.toolInput);
  if (!questions) {
    return {
      candidates: [],
      stopReason: result.stopReason,
      usage: result.usage,
      diagnostic: `${TOOL_NAME} foi chamada, mas o campo questions nao e um array (nem na raiz do input, nem em input.questions)`,
    };
  }
  if (questions.length === 0) {
    return {
      candidates: [],
      stopReason: result.stopReason,
      usage: result.usage,
      diagnostic: `${TOOL_NAME} foi chamada, mas retornou zero perguntas`,
    };
  }

  return {
    candidates: questions as GeneratedQuestionCandidate[],
    stopReason: result.stopReason,
    usage: result.usage,
    diagnostic: null,
  };
}
