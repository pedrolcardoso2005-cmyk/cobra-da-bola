import type { Difficulty, QuestionCategory } from "@cobra/shared";

// Every real storage category -- "aleatorio" is a selection filter (means
// "any category") in MatchSettings, not something a question is ever
// stored under, so it's deliberately excluded from stock tracking.
export const QUESTION_CATEGORIES: QuestionCategory[] = [
  "futebol_brasileiro",
  "futebol_europeu",
  "futebol_sulamericano",
  "libertadores",
  "champions_league",
  "copa_do_mundo",
  "selecoes",
  "clubes",
  "jogadores",
  "historia_do_futebol",
  "competicoes_nacionais",
  "competicoes_internacionais",
  "futebol_saudita",
  "concacaf",
];

export const DIFFICULTIES: Difficulty[] = ["facil", "moderado", "medio", "dificil", "impossivel"];
