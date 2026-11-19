// Question bank, batch 001 (100 of the planned 3000: 25 per difficulty).
// Each entry's `slug` is a stable id used by the loader (see bank/index.ts)
// so re-running it across sessions never inserts duplicates.
//
// Sourcing note (see server/src/questions/bank/PROGRESS.md for the full
// methodology): facts were cross-checked against the major competitions'
// own honours pages (fifa.com, uefa.com, conmebol.com, cbf.com.br) via
// live search before this batch was written, and only facts consistent
// across independent reports were used. Disputed statistics (e.g. a few
// pre-1990 World Cup goal tallies, current Champions-League title counts
// that differ by source) were deliberately left out rather than guessed.
import type { Difficulty, Question, QuestionCategory } from "@cobra/shared";

export interface BankQuestion extends Omit<Question, "id"> {
  slug: string;
}

function q(
  slug: string,
  category: QuestionCategory,
  difficulty: Difficulty,
  prompt: string,
  correctAnswer: string,
  opts: { acceptedAnswers?: string[]; explanation?: string; sourceUrl: string; seasonRef?: string },
): BankQuestion {
  return { slug, category, difficulty, format: "aberta", prompt, correctAnswer, ...opts };
}

const FIFA = "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup";
const UEFA_CL = "https://www.uefa.com/uefachampionsleague/history/";
const UEFA_BDO = "https://www.uefa.com/ballondor/";
const CONMEBOL = "https://www.conmebol.com/libertadores/";
const CBF = "https://www.cbf.com.br/futebol-brasileiro/competicoes/campeonato-brasileiro-serie-a";

export const batch001: BankQuestion[] = [
  // ---------- FACIL (25) ----------
  q("b1-f-01", "copa_do_mundo", "facil", "A partir de qual edicao a Copa do Mundo passara a ter 48 selecoes?", "2026", { sourceUrl: FIFA, seasonRef: "2026" }),
  q("b1-f-02", "copa_do_mundo", "facil", "Em que pais foi disputada a Copa do Mundo de 2014?", "Brasil", { sourceUrl: FIFA, seasonRef: "2014" }),
  q("b1-f-03", "jogadores", "facil", "Qual jogador brasileiro e conhecido como \"O Rei do Futebol\"?", "Pele", { acceptedAnswers: ["edson arantes do nascimento"], sourceUrl: FIFA }),
  q("b1-f-04", "copa_do_mundo", "facil", "Em que ano o Brasil conquistou sua quarta Copa do Mundo?", "1994", { sourceUrl: FIFA, seasonRef: "1994" }),
  q("b1-f-05", "copa_do_mundo", "facil", "Qual pais sediou a Copa do Mundo de 2022?", "Catar", { acceptedAnswers: ["qatar"], sourceUrl: FIFA, seasonRef: "2022" }),
  q("b1-f-06", "copa_do_mundo", "facil", "Quantas Copas do Mundo a Argentina tinha vencido ate o fim da edicao de 2022?", "3", { acceptedAnswers: ["tres"], sourceUrl: FIFA, seasonRef: "ate 2022" }),
  q("b1-f-07", "futebol_brasileiro", "facil", "Em que ano o Flamengo conquistou sua primeira Copa Libertadores da America?", "1981", { sourceUrl: CONMEBOL, seasonRef: "1981" }),
  q("b1-f-08", "futebol_brasileiro", "facil", "Em que ano o Palmeiras foi fundado?", "1914", { sourceUrl: CBF }),
  q("b1-f-09", "futebol_brasileiro", "facil", "Em que ano o Corinthians conquistou seu primeiro Mundial de Clubes da FIFA?", "2000", { sourceUrl: FIFA, seasonRef: "2000" }),
  q("b1-f-10", "futebol_brasileiro", "facil", "Em que cidade fica o estadio Maracana?", "Rio de Janeiro", { sourceUrl: CBF }),
  q("b1-f-11", "historia_do_futebol", "facil", "Em que pais fica a sede da FIFA?", "Suica", { acceptedAnswers: ["suíça"], sourceUrl: FIFA }),
  q("b1-f-12", "jogadores", "facil", "Qual jogador e conhecido pelo apelido CR7?", "Cristiano Ronaldo", { sourceUrl: UEFA_BDO }),
  q("b1-f-13", "jogadores", "facil", "Qual e o apelido mais conhecido de Lionel Messi?", "A Pulga", { acceptedAnswers: ["pulga"], sourceUrl: UEFA_BDO }),
  q("b1-f-14", "historia_do_futebol", "facil", "Quantos jogadores cada time coloca em campo em uma partida de futebol?", "11", { acceptedAnswers: ["onze"], sourceUrl: FIFA }),
  q("b1-f-15", "copa_do_mundo", "facil", "Qual pais venceu a Copa do Mundo de 2010?", "Espanha", { sourceUrl: FIFA, seasonRef: "2010" }),
  q("b1-f-16", "copa_do_mundo", "facil", "Em que ano o Brasil conquistou seu primeiro titulo mundial?", "1958", { sourceUrl: FIFA }),
  q("b1-f-17", "selecoes", "facil", "Quantas Copas do Mundo a Alemanha (contando a Alemanha Ocidental) ja venceu?", "4", { acceptedAnswers: ["quatro"], sourceUrl: FIFA, seasonRef: "ate 2014" }),
  q("b1-f-18", "copa_do_mundo", "facil", "Quantas Copas do Mundo a Italia ja venceu?", "4", { acceptedAnswers: ["quatro"], sourceUrl: FIFA }),
  q("b1-f-19", "copa_do_mundo", "facil", "Qual pais sediou a Copa do Mundo de 2006?", "Alemanha", { sourceUrl: FIFA, seasonRef: "2006" }),
  q("b1-f-20", "futebol_brasileiro", "facil", "Qual e o principal rival do Flamengo no classico \"Fla-Flu\"?", "Fluminense", { sourceUrl: CBF }),
  q("b1-f-21", "clubes", "facil", "Qual e o nome do estadio do Barcelona?", "Camp Nou", { sourceUrl: UEFA_CL }),
  q("b1-f-22", "futebol_brasileiro", "facil", "Qual foi o campeao brasileiro de 2024?", "Botafogo", { sourceUrl: CBF, seasonRef: "2024" }),
  q("b1-f-23", "futebol_brasileiro", "facil", "Qual foi o campeao brasileiro de 2025?", "Flamengo", { sourceUrl: CBF, seasonRef: "2025" }),
  q("b1-f-24", "clubes", "facil", "Qual e o nome do estadio do Manchester United?", "Old Trafford", { sourceUrl: UEFA_CL }),
  q("b1-f-25", "jogadores", "facil", "Qual jogador marcou o gol do titulo brasileiro na final da Copa de 1970 contra a Italia, abrindo o placar?", "Pele", { sourceUrl: FIFA, seasonRef: "1970" }),

  // ---------- MODERADO (25) ----------
  q("b1-m-01", "copa_do_mundo", "moderado", "Qual foi o adversario do Brasil na final da Copa do Mundo de 1998?", "Franca", { acceptedAnswers: ["frança"], sourceUrl: FIFA, seasonRef: "1998" }),
  q("b1-m-02", "copa_do_mundo", "moderado", "Qual selecao sofreu a derrota conhecida como \"Maracanazo\", na final da Copa de 1950, no Maracana?", "Brasil", { sourceUrl: FIFA, seasonRef: "1950" }),
  q("b1-m-03", "jogadores", "moderado", "Qual jogador venceu a Bola de Ouro (Ballon d'Or) de 2025?", "Ousmane Dembele", { sourceUrl: UEFA_BDO, seasonRef: "2025" }),
  q("b1-m-04", "libertadores", "moderado", "Qual clube venceu a Copa Libertadores de 2023?", "Fluminense", { sourceUrl: CONMEBOL, seasonRef: "2023" }),
  q("b1-m-05", "libertadores", "moderado", "Qual clube venceu a Copa Libertadores de 2024?", "Botafogo", { sourceUrl: CONMEBOL, seasonRef: "2024" }),
  q("b1-m-06", "futebol_brasileiro", "moderado", "Qual clube foi vice-campeao do Campeonato Brasileiro de 2023, atras do Palmeiras?", "Botafogo", { sourceUrl: CBF, seasonRef: "2023" }),
  q("b1-m-07", "futebol_brasileiro", "moderado", "Qual foi o campeao brasileiro de 2017, com campanha dominante do time de Fabio Carille?", "Corinthians", { sourceUrl: CBF, seasonRef: "2017" }),
  q("b1-m-08", "copa_do_mundo", "moderado", "Quem foi o artilheiro da Copa do Mundo de 2022?", "Kylian Mbappe", { sourceUrl: FIFA, seasonRef: "2022" }),
  q("b1-m-09", "copa_do_mundo", "moderado", "Quem foi o artilheiro da Copa do Mundo de 2018?", "Harry Kane", { sourceUrl: FIFA, seasonRef: "2018" }),
  q("b1-m-10", "copa_do_mundo", "moderado", "Em que pais foi disputada a Copa do Mundo de 1994?", "Estados Unidos", { sourceUrl: FIFA, seasonRef: "1994" }),
  q("b1-m-11", "futebol_brasileiro", "moderado", "Qual e o apelido do estadio do Corinthians, a Neo Quimica Arena?", "Itaquerao", { sourceUrl: CBF }),
  q("b1-m-12", "jogadores", "moderado", "Quantas Bolas de Ouro Lionel Messi tinha conquistado ate 2023?", "8", { acceptedAnswers: ["oito"], sourceUrl: UEFA_BDO, seasonRef: "ate 2023" }),
  q("b1-m-13", "jogadores", "moderado", "Quantas Bolas de Ouro Cristiano Ronaldo ja conquistou?", "5", { acceptedAnswers: ["cinco"], sourceUrl: UEFA_BDO }),
  q("b1-m-14", "champions_league", "moderado", "Qual clube venceu a Liga dos Campeoes da UEFA de 2022?", "Real Madrid", { sourceUrl: UEFA_CL, seasonRef: "2021-22" }),
  q("b1-m-15", "champions_league", "moderado", "Qual clube venceu a Liga dos Campeoes da UEFA de 2023?", "Manchester City", { sourceUrl: UEFA_CL, seasonRef: "2022-23" }),
  q("b1-m-16", "champions_league", "moderado", "Qual clube venceu a Liga dos Campeoes da UEFA de 2024?", "Real Madrid", { sourceUrl: UEFA_CL, seasonRef: "2023-24" }),
  q("b1-m-17", "futebol_brasileiro", "moderado", "Qual foi o primeiro clube campeao da Taca Brasil, em 1959?", "Bahia", { sourceUrl: CBF, seasonRef: "1959" }),
  q("b1-m-18", "clubes", "moderado", "Qual clube paulista e chamado de \"tricampeao mundial\" por somar titulos da Intercontinental (1992 e 1993) e do Mundial de Clubes FIFA (2005)?", "Sao Paulo", { sourceUrl: FIFA }),
  q("b1-m-19", "competicoes_internacionais", "moderado", "Em que ano o Brasil sediou e venceu a Copa America?", "2019", { sourceUrl: FIFA, seasonRef: "2019" }),
  q("b1-m-20", "libertadores", "moderado", "Em que ano o Boca Juniors conquistou sua ultima Copa Libertadores, ate 2025?", "2007", { sourceUrl: CONMEBOL, seasonRef: "ate 2025" }),
  q("b1-m-21", "copa_do_mundo", "moderado", "Quais dois paises sediaram em conjunto a Copa do Mundo de 2002?", "Coreia do Sul e Japao", { acceptedAnswers: ["japao e coreia do sul", "coreia do sul e japao"], sourceUrl: FIFA, seasonRef: "2002" }),
  q("b1-m-22", "selecoes", "moderado", "Em que ano a Argentina conquistou seu primeiro titulo de Copa do Mundo?", "1978", { sourceUrl: FIFA, seasonRef: "1978" }),
  q("b1-m-23", "selecoes", "moderado", "Em que ano a Espanha conquistou seu unico titulo de Copa do Mundo ate 2022?", "2010", { sourceUrl: FIFA, seasonRef: "2010" }),
  q("b1-m-24", "futebol_europeu", "moderado", "Em que pais fica o estadio Santiago Bernabeu?", "Espanha", { sourceUrl: UEFA_CL }),
  q("b1-m-25", "historia_do_futebol", "moderado", "Qual e a sigla do orgao que define as regras oficiais do futebol mundial, o International Football Association Board?", "IFAB", { sourceUrl: FIFA }),

  // ---------- MEDIO (25) ----------
  q("b1-d-01", "copa_do_mundo", "medio", "Em que estadio foi disputada a final da Copa do Mundo de 1950?", "Maracana", { sourceUrl: FIFA, seasonRef: "1950" }),
  q("b1-d-02", "copa_do_mundo", "medio", "Qual foi o placar da final da Copa do Mundo de 1950, em que o Uruguai venceu o Brasil?", "2 a 1", { acceptedAnswers: ["2x1", "2-1"], sourceUrl: FIFA, seasonRef: "1950" }),
  q("b1-d-03", "copa_do_mundo", "medio", "Quem foi o artilheiro da Copa do Mundo de 1958, a primeira conquistada pelo Brasil?", "Just Fontaine", { sourceUrl: FIFA, seasonRef: "1958" }),
  q("b1-d-04", "copa_do_mundo", "medio", "Quantos gols o francês Just Fontaine marcou na Copa do Mundo de 1958, recorde ate hoje para uma unica edicao?", "13", { acceptedAnswers: ["treze"], sourceUrl: FIFA, seasonRef: "1958" }),
  q("b1-d-05", "jogadores", "medio", "Qual jogador brasileiro marcou na final da Copa de 1958 aos 17 anos de idade?", "Pele", { sourceUrl: FIFA, seasonRef: "1958" }),
  q("b1-d-06", "selecoes", "medio", "Quem foi o tecnico campeao do mundo pelo Brasil em 1970?", "Mario Zagallo", { sourceUrl: FIFA, seasonRef: "1970" }),
  q("b1-d-07", "jogadores", "medio", "Mario Zagallo tambem foi campeao mundial como jogador do Brasil em quais duas edicoes?", "1958 e 1962", { acceptedAnswers: ["1962 e 1958"], sourceUrl: FIFA }),
  q("b1-d-08", "copa_do_mundo", "medio", "Qual foi o placar da final da Copa do Mundo de 1970, Brasil contra Italia?", "4 a 1", { acceptedAnswers: ["4x1", "4-1"], sourceUrl: FIFA, seasonRef: "1970" }),
  q("b1-d-09", "libertadores", "medio", "Qual clube equatoriano foi campeao da Copa Libertadores em 2008, seu unico titulo no torneio?", "LDU de Quito", { acceptedAnswers: ["ldu de quito", "ldu quito", "liga deportiva universitaria"], sourceUrl: CONMEBOL, seasonRef: "2008" }),
  q("b1-d-10", "libertadores", "medio", "Qual foi o primeiro clube brasileiro a ser campeao da Copa Libertadores, em 1962?", "Santos", { sourceUrl: CONMEBOL, seasonRef: "1962" }),
  q("b1-d-11", "jogadores", "medio", "Quem foi o artilheiro do Santos na campanha campea da Libertadores de 1962?", "Pele", { sourceUrl: CONMEBOL, seasonRef: "1962" }),
  q("b1-d-12", "futebol_brasileiro", "medio", "Qual clube e o maior campeao do Campeonato Brasileiro, segundo a contagem oficial da CBF desde 2010?", "Palmeiras", { sourceUrl: CBF, seasonRef: "ate 2025" }),
  q("b1-d-13", "copa_do_mundo", "medio", "Qual selecao venceu a Copa do Mundo de 1966, disputada em casa, na Inglaterra?", "Inglaterra", { sourceUrl: FIFA, seasonRef: "1966" }),
  q("b1-d-14", "jogadores", "medio", "Em que pais nasceu o lendario jogador Alfredo Di Stefano, estrela do Real Madrid nos anos 1950?", "Argentina", { sourceUrl: UEFA_CL }),
  q("b1-d-15", "champions_league", "medio", "O Real Madrid venceu quantas das cinco primeiras edicoes da entao Copa dos Campeoes Europeus (1956 a 1960)?", "5", { acceptedAnswers: ["todas", "cinco"], sourceUrl: UEFA_CL, seasonRef: "1956-1960" }),
  q("b1-d-16", "copa_do_mundo", "medio", "Qual selecao venceu a Copa do Mundo de 1974, disputada na Alemanha Ocidental?", "Alemanha Ocidental", { acceptedAnswers: ["alemanha"], sourceUrl: FIFA, seasonRef: "1974" }),
  q("b1-d-17", "selecoes", "medio", "Quem foi o capitao da selecao brasileira no tetracampeonato de 1994?", "Dunga", { sourceUrl: FIFA, seasonRef: "1994" }),
  q("b1-d-18", "copa_do_mundo", "medio", "Qual foi o adversario do Brasil na final da Copa do Mundo de 1994?", "Italia", { sourceUrl: FIFA, seasonRef: "1994" }),
  q("b1-d-19", "copa_do_mundo", "medio", "Como o Brasil venceu a final da Copa do Mundo de 1994 contra a Italia?", "Nos penaltis", { acceptedAnswers: ["penaltis", "disputa de penaltis"], sourceUrl: FIFA, seasonRef: "1994" }),
  q("b1-d-20", "jogadores", "medio", "Quem desperdicou o penalti decisivo pela Italia na final da Copa de 1994?", "Roberto Baggio", { sourceUrl: FIFA, seasonRef: "1994" }),
  q("b1-d-21", "copa_do_mundo", "medio", "Qual foi o placar da final da Copa do Mundo de 2002, Brasil contra Alemanha?", "2 a 0", { acceptedAnswers: ["2x0", "2-0"], sourceUrl: FIFA, seasonRef: "2002" }),
  q("b1-d-22", "jogadores", "medio", "Quem marcou os dois gols do Brasil na final da Copa do Mundo de 2002?", "Ronaldo", { acceptedAnswers: ["ronaldo fenomeno", "ronaldo nazario"], sourceUrl: FIFA, seasonRef: "2002" }),
  q("b1-d-23", "copa_do_mundo", "medio", "Em que cidade brasileira foi disputada a final da Copa do Mundo de 2014?", "Rio de Janeiro", { sourceUrl: FIFA, seasonRef: "2014" }),
  q("b1-d-24", "libertadores", "medio", "Contra qual clube uruguaio o Santos venceu a final da Libertadores de 1962?", "Penarol", { sourceUrl: CONMEBOL, seasonRef: "1962" }),
  q("b1-d-25", "libertadores", "medio", "Contra qual clube argentino o Santos venceu a final da Libertadores de 1963?", "Boca Juniors", { sourceUrl: CONMEBOL, seasonRef: "1963" }),

  // ---------- DIFICIL (25) ----------
  q("b1-h-01", "copa_do_mundo", "dificil", "Qual foi o placar da semifinal Brasil x Alemanha na Copa do Mundo de 2014, no chamado \"Mineiraco\"?", "7 a 1", { acceptedAnswers: ["7x1", "7-1"], sourceUrl: FIFA, seasonRef: "2014" }),
  q("b1-h-02", "copa_do_mundo", "dificil", "Em qual cidade brasileira foi disputado o \"Mineiraco\" de 2014?", "Belo Horizonte", { sourceUrl: FIFA, seasonRef: "2014" }),
  q("b1-h-03", "jogadores", "dificil", "Qual jogador alemao se tornou o maior artilheiro da historia das Copas do Mundo durante o jogo contra o Brasil em 2014?", "Miroslav Klose", { sourceUrl: FIFA, seasonRef: "2014" }),
  q("b1-h-04", "jogadores", "dificil", "Quantos gols Miroslav Klose marcou ao total, somando todas as Copas do Mundo que disputou?", "16", { acceptedAnswers: ["dezesseis"], sourceUrl: FIFA }),
  q("b1-h-05", "jogadores", "dificil", "Qual jogador brasileiro era o recordista de gols em Copas do Mundo antes de Miroslav Klose superar a marca?", "Ronaldo", { acceptedAnswers: ["ronaldo fenomeno", "ronaldo nazario"], sourceUrl: FIFA }),
  q("b1-h-06", "jogadores", "dificil", "Qual jogador uruguaio marcou o gol do titulo contra o Brasil na final da Copa do Mundo de 1950?", "Alcides Ghiggia", { sourceUrl: FIFA, seasonRef: "1950" }),
  q("b1-h-07", "libertadores", "dificil", "Qual clube colombiano foi campeao da Copa Libertadores em 2004, vencendo o Boca Juniors nos penaltis?", "Once Caldas", { sourceUrl: CONMEBOL, seasonRef: "2004" }),
  q("b1-h-08", "libertadores", "dificil", "Quantas vezes o Independiente, maior campeao da historia, venceu a Copa Libertadores?", "7", { acceptedAnswers: ["sete"], sourceUrl: CONMEBOL }),
  q("b1-h-09", "jogadores", "dificil", "Qual jogador argentino foi artilheiro do Real Madrid durante as primeiras conquistas da Copa dos Campeoes Europeus, nos anos 1950?", "Alfredo Di Stefano", { sourceUrl: UEFA_CL }),
  q("b1-h-10", "copa_do_mundo", "dificil", "Em que ano a Copa do Mundo teve sua segunda edicao seguida cancelada por causa da Segunda Guerra Mundial?", "1946", { sourceUrl: FIFA }),
  q("b1-h-11", "copa_do_mundo", "dificil", "Qual selecao venceu a Copa do Mundo de 1934, disputada na Italia?", "Italia", { sourceUrl: FIFA, seasonRef: "1934" }),
  q("b1-h-12", "selecoes", "dificil", "Quem foi o tecnico da Italia nos bicampeonatos mundiais de 1934 e 1938?", "Vittorio Pozzo", { sourceUrl: FIFA }),
  q("b1-h-13", "historia_do_futebol", "dificil", "Qual foi o unico tecnico da historia a vencer duas Copas do Mundo seguidas?", "Vittorio Pozzo", { sourceUrl: FIFA }),
  q("b1-h-14", "copa_do_mundo", "dificil", "Em que ano o Brasil disputou sua primeira Copa do Mundo?", "1930", { sourceUrl: FIFA }),
  q("b1-h-15", "selecoes", "dificil", "Qual e a unica selecao que disputou todas as edicoes da Copa do Mundo ate hoje?", "Brasil", { sourceUrl: FIFA }),
  q("b1-h-16", "copa_do_mundo", "dificil", "Qual foi o placar da final da Copa do Mundo de 1986, Argentina contra Alemanha Ocidental?", "3 a 2", { acceptedAnswers: ["3x2", "3-2"], sourceUrl: FIFA, seasonRef: "1986" }),
  q("b1-h-17", "jogadores", "dificil", "Quem marcou o gol da vitoria da Argentina na final da Copa do Mundo de 1986?", "Jorge Burruchaga", { sourceUrl: FIFA, seasonRef: "1986" }),
  q("b1-h-18", "selecoes", "dificil", "Contra qual selecao a Argentina jogou nas quartas de final da Copa de 1986, no jogo do \"gol do seculo\" e da \"mao de Deus\"?", "Inglaterra", { sourceUrl: FIFA, seasonRef: "1986" }),
  q("b1-h-19", "jogadores", "dificil", "Qual goleiro ingles sofreu o gol da \"mao de Deus\" de Maradona, na Copa do Mundo de 1986?", "Peter Shilton", { sourceUrl: FIFA, seasonRef: "1986" }),
  q("b1-h-20", "jogadores", "dificil", "Em que ano Pele marcou seu milesimo gol na carreira, no estadio do Maracana?", "1969", { sourceUrl: FIFA }),
  q("b1-h-21", "jogadores", "dificil", "Contra qual clube carioca Pele marcou seu milesimo gol?", "Vasco da Gama", { sourceUrl: FIFA }),
  q("b1-h-22", "copa_do_mundo", "dificil", "Qual pais venceu a Copa do Mundo de 1938, a ultima disputada antes da pausa pela Segunda Guerra?", "Italia", { sourceUrl: FIFA, seasonRef: "1938" }),
  q("b1-h-23", "jogadores", "dificil", "Qual jogador brasileiro foi artilheiro da Copa do Mundo de 1938, mesmo o Brasil nao chegando a final?", "Leonidas", { acceptedAnswers: ["leonidas da silva", "diamante negro"], sourceUrl: FIFA, seasonRef: "1938" }),
  q("b1-h-24", "copa_do_mundo", "dificil", "Qual selecao venceu a Copa do Mundo de 1962, disputada no Chile?", "Brasil", { sourceUrl: FIFA, seasonRef: "1962" }),
  q("b1-h-25", "copa_do_mundo", "dificil", "Qual selecao foi vice-campea da Copa do Mundo de 1962, perdendo para o Brasil?", "Tchecoslovaquia", { acceptedAnswers: ["checoslovaquia"], sourceUrl: FIFA, seasonRef: "1962" }),
];
