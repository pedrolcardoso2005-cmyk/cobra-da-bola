// Display labels for the content-selection chips (tema de pergunta, tema
// de carreira, dificuldade) -- shared by Home.tsx (Criar Partida) and
// SoloView.tsx (Modo Solo) so both pick from the exact same options.
import type { CareerTheme, Difficulty, QuestionCategory } from "@cobra/shared";

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  futebol_brasileiro: "Futebol brasileiro",
  futebol_europeu: "Futebol europeu",
  futebol_sulamericano: "Futebol sul-americano",
  libertadores: "Libertadores",
  champions_league: "Champions League",
  copa_do_mundo: "Copa do Mundo",
  selecoes: "Selecoes",
  clubes: "Clubes",
  jogadores: "Jogadores",
  historia_do_futebol: "Historia do futebol",
  competicoes_nacionais: "Competicoes nacionais",
  competicoes_internacionais: "Competicoes internacionais",
  futebol_saudita: "Futebol saudita",
  concacaf: "CONCACAF",
  aleatorio: "Aleatorio",
};

export const CAREER_THEME_LABELS: Record<CareerTheme, string> = {
  aleatorio: "Aleatorio",
  brasileiros: "Brasileiros",
  sul_americanos: "Sul-americanos",
  europeus: "Europeus",
  norte_americanos: "Norte-americanos",
  asiaticos: "Asiaticos",
  jogadores_de_copa: "Jogadores de Copa do Mundo",
  campeoes: "Campeoes",
  idolos: "Idolos / Icons",
  icones_atuais: "Icones atuais",
  historicos: "Jogadores historicos",
};

export const DIFFICULTIES: Difficulty[] = ["facil", "moderado", "medio", "dificil", "impossivel"];
