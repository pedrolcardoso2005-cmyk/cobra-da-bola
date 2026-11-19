// Seed data for the question bank. Every fact below was chosen because it is
// well-established and verifiable (World Cup results, club nicknames,
// league names, widely reported transfers) -- per the project brief, this
// file intentionally avoids anything recent/volatile enough to risk being
// wrong, and avoids inventing statistics. Use the presenter panel's
// question CRUD (or insertQuestion/insertCareerQuestion) to keep growing
// this bank; nothing here is meant to be exhaustive.
import { insertCareerQuestion, insertQuestion, listQuestions, listCareerQuestions } from "../db/questions.js";
import type { Difficulty, Question, QuestionCategory } from "@cobra/shared";
import { pathToFileURL } from "node:url";

type SeedQuestion = Omit<Question, "id">;

const Q = (
  category: QuestionCategory,
  difficulty: Difficulty,
  prompt: string,
  correctAnswer: string,
  opts: Partial<Pick<Question, "format" | "choices" | "acceptedAnswers">> = {},
): SeedQuestion => ({
  category,
  difficulty,
  format: opts.format ?? "aberta",
  prompt,
  correctAnswer,
  choices: opts.choices,
  acceptedAnswers: opts.acceptedAnswers,
});

const questions: SeedQuestion[] = [
  // --- Copa do Mundo ---
  Q("copa_do_mundo", "facil", "Em que ano o Brasil conquistou o pentacampeonato mundial?", "2002"),
  Q("copa_do_mundo", "facil", "Quantos titulos de Copa do Mundo o Brasil tem?", "5"),
  Q("copa_do_mundo", "medio", "Qual pais sediou e venceu a primeira Copa do Mundo, em 1930?", "Uruguai"),
  Q(
    "copa_do_mundo",
    "medio",
    "Qual selecao venceu o Brasil na final da Copa do Mundo de 1950, disputada no Maracana?",
    "Uruguai",
  ),
  Q("copa_do_mundo", "facil", "Qual selecao foi campea da Copa do Mundo de 2014, realizada no Brasil?", "Alemanha"),
  Q("copa_do_mundo", "facil", "Qual selecao foi campea da Copa do Mundo de 2018, na Russia?", "Franca", { acceptedAnswers: ["frança"] }),
  Q("copa_do_mundo", "facil", "Qual selecao foi campea da Copa do Mundo de 2022, no Catar?", "Argentina"),
  Q(
    "copa_do_mundo",
    "moderado",
    "Na final da Copa de 2006, um jogador foi expulso por dar uma cabecada em um adversario. Quem foi?",
    "Zidane",
    { acceptedAnswers: ["zinedine zidane"] },
  ),
  Q("copa_do_mundo", "moderado", "Qual selecao foi campea da Copa do Mundo de 2006, na Alemanha?", "Italia", { acceptedAnswers: ["itália"] }),
  Q("copa_do_mundo", "moderado", "Qual selecao foi campea da Copa do Mundo de 1986, no Mexico?", "Argentina"),
  Q("copa_do_mundo", "dificil", "Quem e o maior artilheiro da historia de Copas do Mundo?", "Miroslav Klose"),
  Q("copa_do_mundo", "medio", "Quantas Copas do Mundo Pele venceu como jogador?", "3"),
  Q(
    "copa_do_mundo",
    "dificil",
    "Qual brasileiro foi campeao do mundo como jogador em 1970 e como tecnico em 1994?",
    "Mario Zagallo",
    { acceptedAnswers: ["zagallo", "mário zagallo"] },
  ),
  Q("copa_do_mundo", "facil", "Verdadeiro ou falso: o Brasil ja sediou a Copa do Mundo duas vezes.", "verdadeiro", {
    format: "verdadeiro_falso",
  }),

  // --- Selecoes ---
  Q("selecoes", "facil", "Qual selecao e conhecida como 'La Albiceleste'?", "Argentina"),
  Q("selecoes", "facil", "Qual selecao e conhecida como 'Die Mannschaft'?", "Alemanha"),
  Q("selecoes", "moderado", "Qual selecao e conhecida como 'Les Bleus'?", "Franca", { acceptedAnswers: ["frança"] }),
  Q("selecoes", "facil", "Qual selecao e conhecida como 'La Roja'?", "Espanha"),
  Q("selecoes", "moderado", "Qual selecao e conhecida como 'Os Diabos Vermelhos'?", "Belgica", { acceptedAnswers: ["bélgica"] }),
  Q(
    "selecoes",
    "facil",
    "Qual e a cor tradicional da camisa titular da selecao brasileira?",
    "amarela",
    { format: "multipla_escolha", choices: ["Amarela", "Azul", "Verde", "Branca"] },
  ),

  // --- Clubes (apelidos) ---
  Q("clubes", "facil", "Qual o apelido do Flamengo?", "Mengao", { acceptedAnswers: ["mengão", "rubro-negro"] }),
  Q("clubes", "facil", "Qual o apelido do Corinthians?", "Timao", { acceptedAnswers: ["timão"] }),
  Q("clubes", "facil", "Qual o apelido do Cruzeiro?", "Raposa"),
  Q("clubes", "facil", "Qual o apelido do Atletico Mineiro?", "Galo"),
  Q("clubes", "moderado", "Qual o apelido do Vasco da Gama?", "Gigante da Colina", { acceptedAnswers: ["cruzmaltino"] }),
  Q("clubes", "moderado", "Qual o apelido do Botafogo?", "Fogao", { acceptedAnswers: ["fogão", "glorioso"] }),
  Q("clubes", "facil", "Qual o apelido do Santos Futebol Clube?", "Peixe"),
  Q("clubes", "moderado", "Qual o apelido do Internacional (RS)?", "Colorado"),
  Q("clubes", "facil", "Qual o apelido do Palmeiras?", "Verdao", { acceptedAnswers: ["verdão"] }),
  Q("clubes", "moderado", "Qual o apelido do Real Madrid?", "Merengues", { acceptedAnswers: ["los blancos", "blancos"] }),
  Q("clubes", "moderado", "Qual o apelido do Boca Juniors?", "Xeneize"),
  Q("clubes", "moderado", "Qual o apelido do River Plate?", "Millonarios", { acceptedAnswers: ["millonários"] }),
  Q("clubes", "dificil", "Qual o apelido da Juventus, time italiano?", "Velha Senhora", { acceptedAnswers: ["vecchia signora"] }),
  Q("clubes", "moderado", "Qual o apelido do Manchester United?", "Diabos Vermelhos", { acceptedAnswers: ["red devils"] }),
  Q("clubes", "moderado", "Qual o apelido do AC Milan?", "Rossoneri"),
  Q("clubes", "dificil", "Qual o apelido da Inter de Milao?", "Nerazzurri", { acceptedAnswers: ["nerazzurri"] }),

  // --- Jogadores ---
  Q("jogadores", "facil", "Qual o apelido de Edson Arantes do Nascimento?", "Pele", { acceptedAnswers: ["pelé"] }),
  Q("jogadores", "moderado", "Qual o apelido de Zinedine Zidane?", "Zizou"),
  Q("jogadores", "facil", "Qual jogador brasileiro ficou conhecido como 'O Divino'?", "Zico"),
  Q(
    "jogadores",
    "medio",
    "Quem e o jogador com mais premios de Bola de Ouro (Ballon d'Or) na historia?",
    "Lionel Messi",
    { acceptedAnswers: ["messi"] },
  ),
  Q("jogadores", "facil", "Qual o apelido de Ronaldo Nazario?", "Fenomeno", { acceptedAnswers: ["fenômeno", "r9"] }),
  Q(
    "jogadores",
    "medio",
    "Famoso pelo lance conhecido como 'mao de Deus', em que Copa Maradona marcou esse gol contra a Inglaterra?",
    "1986",
  ),

  // --- Historia do futebol ---
  Q("historia_do_futebol", "medio", "Em que pais as regras modernas do futebol foram codificadas, em 1863?", "Inglaterra"),
  Q("historia_do_futebol", "dificil", "Em que ano foi fundada a FIFA?", "1904"),

  // --- Champions League / competicoes internacionais ---
  Q(
    "champions_league",
    "facil",
    "Qual clube tem o maior numero de titulos da Liga dos Campeoes da Europa (Champions League)?",
    "Real Madrid",
  ),
  Q(
    "champions_league",
    "dificil",
    "Em 2005, qual time venceu a final da Champions apos sair perdendo de 3 a 0 do Milan no intervalo, ficando conhecida como o 'Milagre de Istambul'?",
    "Liverpool",
  ),
  Q("competicoes_internacionais", "moderado", "Qual selecao foi campea da Eurocopa de 2016, na Franca?", "Portugal"),
  Q("competicoes_internacionais", "moderado", "Qual selecao foi campea da Eurocopa de 2024, na Alemanha?", "Espanha"),

  // --- Libertadores ---
  Q(
    "libertadores",
    "dificil",
    "Qual clube argentino e o maior campeao da historia da Copa Libertadores da America?",
    "Independiente",
  ),
  Q("libertadores", "impossivel", "Qual foi o primeiro campeao da Copa Libertadores da America, em 1960?", "Penarol", {
    acceptedAnswers: ["peñarol"],
  }),

  // --- CONCACAF ---
  Q("concacaf", "moderado", "Qual selecao tem mais titulos da Copa Ouro da CONCACAF?", "Mexico", { acceptedAnswers: ["méxico"] }),
  Q("concacaf", "facil", "Em quais dois anos o Mexico sediou a Copa do Mundo?", "1970 e 1986", {
    acceptedAnswers: ["1970 1986", "1970, 1986"],
  }),

  // --- Futebol saudita ---
  Q("futebol_saudita", "facil", "Qual clube saudita contratou Cristiano Ronaldo em 2023?", "Al-Nassr", {
    acceptedAnswers: ["al nassr", "alnassr"],
  }),
  Q("futebol_saudita", "facil", "Qual clube saudita contratou Neymar em 2023?", "Al-Hilal", {
    acceptedAnswers: ["al hilal", "alhilal"],
  }),
  Q("futebol_saudita", "moderado", "Como e chamada oficialmente a primeira divisao do futebol saudita?", "Saudi Pro League", {
    acceptedAnswers: ["liga profissional saudita"],
  }),

  // --- Competicoes nacionais ---
  Q("competicoes_nacionais", "facil", "Como se chama a primeira divisao do futebol ingles?", "Premier League"),
  Q("competicoes_nacionais", "facil", "Como se chama a primeira divisao do futebol espanhol?", "La Liga"),
  Q("competicoes_nacionais", "facil", "Como se chama a primeira divisao do futebol italiano?", "Serie A", {
    acceptedAnswers: ["série a"],
  }),
  Q("competicoes_nacionais", "facil", "Como se chama a primeira divisao do futebol alemao?", "Bundesliga"),
  Q("competicoes_nacionais", "facil", "Como se chama a primeira divisao do futebol frances?", "Ligue 1"),

  // --- Futebol brasileiro / sequencia ---
  Q(
    "futebol_brasileiro",
    "medio",
    "O Sao Paulo foi campeao brasileiro em 2006, 2007 e 2008, um tricampeonato seguido. Quem foi o campeao brasileiro de 2009, encerrando um jejum de 17 anos?",
    "Flamengo",
    { format: "sequencia" },
  ),
  Q("futebol_brasileiro", "facil", "Qual clube foi bicampeao brasileiro em 2019 e 2020?", "Flamengo"),
  Q("futebol_brasileiro", "moderado", "Qual clube encerrou um longo jejum e foi campeao brasileiro em 2021?", "Atletico Mineiro", {
    acceptedAnswers: ["atlético mineiro", "atlético-mg", "galo"],
  }),
  Q("futebol_brasileiro", "moderado", "Qual clube foi bicampeao brasileiro em 2022 e 2023?", "Palmeiras"),

  // --- Futebol europeu / sulamericano ---
  Q("futebol_europeu", "facil", "Qual selecao venceu a Eurocopa 2020 (disputada em 2021)?", "Italia", { acceptedAnswers: ["itália"] }),
  Q(
    "futebol_sulamericano",
    "moderado",
    "Qual jogador argentino ficou famoso pelo 'Gol do Seculo' contra a Inglaterra, na Copa de 1986?",
    "Diego Maradona",
    { acceptedAnswers: ["maradona"] },
  ),
];

const careerQuestions: { clubs: string[]; playerName: string; acceptedAnswers?: string[] }[] = [
  { clubs: ["Santos", "Barcelona", "Paris Saint-Germain", "Al-Hilal"], playerName: "Neymar", acceptedAnswers: ["neymar jr"] },
  { clubs: ["Santos", "New York Cosmos"], playerName: "Pele", acceptedAnswers: ["pelé"] },
  {
    clubs: ["Sporting CP", "Manchester United", "Real Madrid", "Juventus"],
    playerName: "Cristiano Ronaldo",
    acceptedAnswers: ["cr7", "cristiano"],
  },
  { clubs: ["Barcelona", "Paris Saint-Germain", "Inter Miami"], playerName: "Lionel Messi", acceptedAnswers: ["messi"] },
  { clubs: ["Cannes", "Bordeaux", "Juventus", "Real Madrid"], playerName: "Zinedine Zidane", acceptedAnswers: ["zidane", "zizou"] },
  { clubs: ["Gremio", "Paris Saint-Germain", "Barcelona", "AC Milan"], playerName: "Ronaldinho Gaucho", acceptedAnswers: ["ronaldinho"] },
  { clubs: ["Sao Paulo", "AC Milan", "Real Madrid"], playerName: "Kaka", acceptedAnswers: ["kaká", "ricardo kaka"] },
  { clubs: ["Cruzeiro", "PSV Eindhoven", "Barcelona", "Inter de Milao"], playerName: "Ronaldo Nazario", acceptedAnswers: ["ronaldo", "ronaldo fenomeno"] },
  { clubs: ["Manchester United", "Real Madrid", "LA Galaxy"], playerName: "David Beckham", acceptedAnswers: ["beckham"] },
  { clubs: ["Argentinos Juniors", "Boca Juniors", "Barcelona", "Napoli"], playerName: "Diego Maradona", acceptedAnswers: ["maradona"] },
  { clubs: ["Sporting CP", "Barcelona", "Real Madrid", "Inter de Milao"], playerName: "Luis Figo", acceptedAnswers: ["figo"] },
  { clubs: ["Monaco", "Arsenal", "Barcelona"], playerName: "Thierry Henry", acceptedAnswers: ["henry"] },
];

export function seedDatabase(): { insertedQuestions: number; insertedCareers: number } {
  const existing = listQuestions();
  const existingCareers = listCareerQuestions();
  let insertedQuestions = 0;
  let insertedCareers = 0;
  if (existing.length === 0) {
    for (const q of questions) {
      insertQuestion(q);
      insertedQuestions++;
    }
  }
  if (existingCareers.length === 0) {
    for (const c of careerQuestions) {
      insertCareerQuestion(c);
      insertedCareers++;
    }
  }
  return { insertedQuestions, insertedCareers };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = seedDatabase();
  // eslint-disable-next-line no-console
  console.log(`Seed concluido: ${result.insertedQuestions} perguntas, ${result.insertedCareers} carreiras.`);
}
