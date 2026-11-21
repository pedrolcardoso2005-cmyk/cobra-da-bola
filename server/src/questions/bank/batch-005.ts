// Question bank, batch 005 (100 questions: 19 facil, 19 moderado, 19 medio,
// 19 dificil, 24 impossivel). Same format/loader/idempotency pattern as
// batch-003.ts -- see server/src/questions/bank/PROGRESS.md.
//
// Written by hand (no AI pipeline). Checked against the full text of seed.ts
// and batches 001-004 so no fact is asked again, in either direction. Every
// dificil/impossivel entry was confirmed with a web search; sourceUrl points
// to the page actually used.
import type { BankQuestion } from "./batch-001.js";
import type { Difficulty, QuestionCategory } from "@cobra/shared";

function q(
  slug: string,
  category: QuestionCategory,
  difficulty: Difficulty,
  prompt: string,
  correctAnswer: string,
  opts: { acceptedAnswers?: string[]; explanation: string; sourceUrl: string; seasonRef?: string },
): BankQuestion {
  return { slug, category, difficulty, format: "aberta", prompt, correctAnswer, ...opts };
}

const FIFA = "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup";
const FIFA_CWC = "https://www.fifa.com/fifaplus/en/tournaments/mens/clubworldcup";
const UEFA_CL = "https://www.uefa.com/uefachampionsleague/history/";
const UEFA_EURO = "https://www.uefa.com/uefaeuro/history/";
const CONMEBOL = "https://www.conmebol.com/libertadores/";
const COPA_AMERICA = "https://www.conmebol.com/copa-america/";
const CBF = "https://www.cbf.com.br/futebol-brasileiro/competicoes/campeonato-brasileiro-serie-a";
const CBF_CDB = "https://www.cbf.com.br/futebol-brasileiro/competicoes/copa-brasil-masculino";
const PL = "https://www.premierleague.com/history";

// Sources actually used to verify the dificil/impossivel entries.
const WC_MANAGERS = "https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_winning_managers";
const WC_FINALS = "https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_finals";
const WC_TOP_SCORERS = "https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_top_goalscorers";
const WC_1962_FINAL = "https://www.11v11.com/matches/brazil-v-czechoslovakia-17-june-1962-228168/";
const WC_1974_FINAL = "https://en.wikipedia.org/wiki/1974_FIFA_World_Cup_final";
const UCL_1999 = "https://www.uefa.com/uefachampionsleague/news/newsid=387293.html";
const UCL_2013 = "https://www.uefa.com/uefachampionsleague/news/newsid=1947490.html";
const BR_TOPS = "https://www.rsssfbrasil.com/tablesae/brtops.htm";
const BR_COACHES = "https://rsssfbrasil.com/miscellaneous/brcoaches.htm";
const LIB_FINALS = "https://rsssf.org/sacups/copalib.html";
const CDB_FINALS = "https://en.wikipedia.org/wiki/Copa_do_Brasil";

export const batch005: BankQuestion[] = [
  // ---------- FACIL (19) ----------
  q("b5-f-01", "selecoes", "facil", "Qual selecao e chamada de \"Selecao Canarinho\"?", "Brasil", { explanation: "O apelido vem da camisa amarela, cor do canario.", sourceUrl: FIFA }),
  q("b5-f-02", "jogadores", "facil", "Por qual selecao o goleiro Gianluigi Buffon jogou?", "Italia", { explanation: "Buffon foi campeao do mundo pela Italia em 2006.", sourceUrl: FIFA }),
  q("b5-f-03", "jogadores", "facil", "Por qual selecao o meia Andres Iniesta jogou?", "Espanha", { explanation: "Iniesta foi campeao do mundo e bicampeao europeu pela Espanha.", sourceUrl: FIFA }),
  q("b5-f-04", "jogadores", "facil", "Por qual selecao o zagueiro Virgil van Dijk joga?", "Holanda", { acceptedAnswers: ["paises baixos"], explanation: "Van Dijk e o capitao da selecao holandesa.", sourceUrl: UEFA_CL }),
  q("b5-f-05", "jogadores", "facil", "Por qual selecao o meia Kevin De Bruyne joga?", "Belgica", { explanation: "De Bruyne e um dos maiores nomes da historia da Belgica.", sourceUrl: UEFA_CL }),
  q("b5-f-06", "jogadores", "facil", "Por qual selecao o atacante Alexis Sanchez joga?", "Chile", { explanation: "Alexis foi bicampeao da Copa America pelo Chile.", sourceUrl: COPA_AMERICA }),
  q("b5-f-07", "futebol_brasileiro", "facil", "Qual clube gaucho passou a mandar seus jogos na Arena inaugurada em 2012, em Porto Alegre?", "Gremio", { acceptedAnswers: ["imortal"], explanation: "A Arena do Gremio substituiu o antigo estadio Olimpico.", sourceUrl: CBF }),
  q("b5-f-08", "futebol_brasileiro", "facil", "Em que cidade jogam Sport, Nautico e Santa Cruz?", "Recife", { explanation: "Os tres grandes do futebol pernambucano sao da capital, Recife.", sourceUrl: CBF }),
  q("b5-f-09", "futebol_brasileiro", "facil", "Em que cidade jogam Remo e Paysandu, rivais do \"Re-Pa\"?", "Belem", { explanation: "O Re-Pa e o grande classico da capital paraense.", sourceUrl: CBF }),
  q("b5-f-10", "futebol_brasileiro", "facil", "Em que cidade jogam Goias e Vila Nova?", "Goiania", { explanation: "Goias e Vila Nova sao os dois maiores clubes da capital goiana.", sourceUrl: CBF }),
  q("b5-f-11", "clubes", "facil", "Qual clube e o grande rival do Boca Juniors no \"Superclasico\" argentino?", "River Plate", { acceptedAnswers: ["river"], explanation: "Boca x River e o maior classico da Argentina.", sourceUrl: CONMEBOL }),
  q("b5-f-12", "clubes", "facil", "Qual clube e o grande rival do Manchester United no classico da cidade de Manchester?", "Manchester City", { acceptedAnswers: ["city", "man city"], explanation: "United e City disputam o Manchester Derby.", sourceUrl: PL }),
  q("b5-f-13", "jogadores", "facil", "Por qual selecao o meia Toni Kroos jogou?", "Alemanha", { explanation: "Kroos foi campeao do mundo pela Alemanha em 2014.", sourceUrl: FIFA }),
  q("b5-f-14", "jogadores", "facil", "Por qual selecao o atacante Son Heung-min joga?", "Coreia do Sul", { acceptedAnswers: ["coreia"], explanation: "Son e o capitao e maior estrela da Coreia do Sul.", sourceUrl: FIFA }),
  q("b5-f-15", "clubes", "facil", "Em que pais fica o clube Olympiacos?", "Grecia", { explanation: "O Olympiacos e de Pireu, na regiao de Atenas.", sourceUrl: UEFA_CL }),
  q("b5-f-16", "jogadores", "facil", "Em que pais nasceu Diego Maradona?", "Argentina", { explanation: "Maradona nasceu em Lanus, na Grande Buenos Aires.", sourceUrl: FIFA }),
  q("b5-f-17", "clubes", "facil", "Qual clube ingles e conhecido pelo apelido \"Spurs\"?", "Tottenham", { acceptedAnswers: ["tottenham hotspur"], explanation: "Spurs vem de Hotspur, parte do nome do clube de Londres.", sourceUrl: PL }),
  q("b5-f-18", "futebol_brasileiro", "facil", "Quais sao as cores tradicionais da camisa do Flamengo?", "Vermelho e preto", { acceptedAnswers: ["rubro-negro", "rubro negro", "preto e vermelho"], explanation: "O Flamengo e o Rubro-Negro da Gavea.", sourceUrl: CBF }),
  q("b5-f-19", "clubes", "facil", "Em que cidade italiana fica o clube Napoli?", "Napoles", { acceptedAnswers: ["napoli"], explanation: "O Napoli e o clube onde Maradona virou idolo eterno.", sourceUrl: UEFA_CL }),

  // ---------- MODERADO (19) ----------
  q("b5-mo-01", "clubes", "moderado", "Qual clube espanhol e conhecido como \"Colchoneros\"?", "Atletico de Madrid", { acceptedAnswers: ["atletico madrid", "atleti"], explanation: "O apelido vem das listras da camisa, parecidas com as de colchoes antigos.", sourceUrl: UEFA_CL }),
  q("b5-mo-02", "jogadores", "moderado", "Por qual selecao o atacante Didier Drogba jogou?", "Costa do Marfim", { explanation: "Drogba e o maior idolo da historia da Costa do Marfim.", sourceUrl: FIFA }),
  q("b5-mo-03", "jogadores", "moderado", "Por qual selecao o atacante Sadio Mane joga?", "Senegal", { explanation: "Mane levou Senegal ao titulo da Copa Africana de 2021.", sourceUrl: FIFA }),
  q("b5-mo-04", "clubes", "moderado", "O \"Derby della Capitale\", em Roma, opoe a Lazio a qual clube?", "Roma", { acceptedAnswers: ["as roma"], explanation: "Lazio x Roma e o classico da capital italiana.", sourceUrl: UEFA_CL }),
  q("b5-mo-05", "clubes", "moderado", "Qual clube alemao e o grande rival do Borussia Dortmund no \"Revierderby\"?", "Schalke 04", { acceptedAnswers: ["schalke"], explanation: "Dortmund x Schalke e o classico da regiao do Ruhr.", sourceUrl: UEFA_CL }),
  q("b5-mo-06", "clubes", "moderado", "Qual clube espanhol manda seus jogos no estadio Mestalla?", "Valencia", { explanation: "O Mestalla e a casa do Valencia desde 1923.", sourceUrl: UEFA_CL }),
  q("b5-mo-07", "clubes", "moderado", "Qual clube e o rival do Liverpool no classico de Merseyside?", "Everton", { explanation: "Liverpool x Everton e o classico da cidade de Liverpool.", sourceUrl: PL }),
  q("b5-mo-08", "futebol_brasileiro", "moderado", "Qual clube venceu a Copa do Brasil de 2022, derrotando o Corinthians nos penaltis?", "Flamengo", { acceptedAnswers: ["mengao"], explanation: "A final terminou empatada nos dois jogos e o Flamengo venceu nos penaltis no Maracana.", sourceUrl: CBF_CDB, seasonRef: "2022" }),
  q("b5-mo-09", "futebol_brasileiro", "moderado", "Qual clube venceu a Copa do Brasil de 2018, derrotando o Corinthians na final?", "Cruzeiro", { acceptedAnswers: ["raposa"], explanation: "O Cruzeiro foi bicampeao seguido da Copa do Brasil em 2017 e 2018.", sourceUrl: CBF_CDB, seasonRef: "2018" }),
  q("b5-mo-10", "jogadores", "moderado", "Para qual clube italiano Cristiano Ronaldo se transferiu ao deixar o Real Madrid, em 2018?", "Juventus", { acceptedAnswers: ["juve"], explanation: "CR7 jogou na Juventus de 2018 a 2021.", sourceUrl: UEFA_CL, seasonRef: "2018" }),
  q("b5-mo-11", "jogadores", "moderado", "Por qual clube brasileiro o atacante Gabriel Jesus foi revelado?", "Palmeiras", { acceptedAnswers: ["verdao"], explanation: "Gabriel Jesus foi campeao brasileiro de 2016 pelo Palmeiras antes de ir ao City.", sourceUrl: CBF }),
  q("b5-mo-12", "jogadores", "moderado", "De qual clube brasileiro o Real Madrid contratou Vinicius Junior?", "Flamengo", { acceptedAnswers: ["mengao"], explanation: "Vini Jr. foi vendido pelo Flamengo ao Real Madrid ainda adolescente.", sourceUrl: UEFA_CL }),
  q("b5-mo-13", "jogadores", "moderado", "De qual clube brasileiro o Real Madrid contratou Rodrygo?", "Santos", { acceptedAnswers: ["santos fc"], explanation: "Rodrygo foi revelado pelo Santos e chegou ao Real Madrid em 2019.", sourceUrl: UEFA_CL }),
  q("b5-mo-14", "competicoes_internacionais", "moderado", "Qual selecao venceu a Copa das Confederacoes de 2009, na Africa do Sul?", "Brasil", { explanation: "O Brasil virou sobre os Estados Unidos e venceu a final por 3 a 2.", sourceUrl: FIFA, seasonRef: "2009" }),
  q("b5-mo-15", "competicoes_nacionais", "moderado", "Qual clube ganhou a Premier League 2003-04 sem perder nenhum jogo, o time dos \"Invenciveis\"?", "Arsenal", { acceptedAnswers: ["gunners"], explanation: "O Arsenal de Henry e Wenger terminou a liga invicto.", sourceUrl: PL, seasonRef: "2003-04" }),
  q("b5-mo-16", "clubes", "moderado", "Qual tecnico frances comandou o Arsenal por 22 anos, de 1996 a 2018?", "Arsene Wenger", { acceptedAnswers: ["wenger"], explanation: "Wenger ganhou tres Premier Leagues pelo Arsenal.", sourceUrl: PL }),
  q("b5-mo-17", "selecoes", "moderado", "Quem foi o tecnico da selecao brasileira nas Copas do Mundo de 2018 e 2022?", "Tite", { acceptedAnswers: ["adenor leonardo bacchi"], explanation: "Tite assumiu a selecao em 2016 e saiu apos a Copa do Catar.", sourceUrl: FIFA }),
  q("b5-mo-18", "jogadores", "moderado", "Por qual clube brasileiro Kaka foi revelado antes de ir para o Milan?", "Sao Paulo", { acceptedAnswers: ["sao paulo fc", "spfc"], explanation: "Kaka saiu do Sao Paulo para o Milan em 2003.", sourceUrl: CBF }),
  q("b5-mo-19", "jogadores", "moderado", "Por qual clube espanhol Romario jogou entre 1993 e 1995, antes do tetra?", "Barcelona", { acceptedAnswers: ["fc barcelona", "barca"], explanation: "Romario foi campeao espanhol e artilheiro pelo Barcelona de Cruyff.", sourceUrl: UEFA_CL }),

  // ---------- MEDIO (19) ----------
  q("b5-me-01", "futebol_europeu", "medio", "Qual selecao venceu a Eurocopa de 1984, com 9 gols de Michel Platini?", "Franca", { explanation: "A Franca venceu a Espanha por 2 a 0 na final, em Paris.", sourceUrl: UEFA_EURO, seasonRef: "1984" }),
  q("b5-me-02", "champions_league", "medio", "Qual clube frances venceu a Liga dos Campeoes de 1993, batendo o Milan na final?", "Olympique de Marselha", { acceptedAnswers: ["marselha", "marseille", "olympique de marseille", "om"], explanation: "O Marselha venceu por 1 a 0, gol de Basile Boli.", sourceUrl: UEFA_CL, seasonRef: "1992-93" }),
  q("b5-me-03", "champions_league", "medio", "Qual clube holandes venceu a Liga dos Campeoes de 1995, com gol de Kluivert na final contra o Milan?", "Ajax", { explanation: "O jovem Ajax de Van Gaal venceu por 1 a 0 em Viena.", sourceUrl: UEFA_CL, seasonRef: "1994-95" }),
  q("b5-me-04", "champions_league", "medio", "Qual clube alemao venceu a Liga dos Campeoes de 1997, derrotando a Juventus na final?", "Borussia Dortmund", { acceptedAnswers: ["dortmund", "bvb"], explanation: "O Dortmund venceu por 3 a 1 em Munique.", sourceUrl: UEFA_CL, seasonRef: "1996-97" }),
  q("b5-me-05", "champions_league", "medio", "Qual clube venceu a Liga dos Campeoes de 2003, na final italiana decidida nos penaltis contra a Juventus?", "Milan", { acceptedAnswers: ["ac milan"], explanation: "O Milan venceu nos penaltis em Old Trafford.", sourceUrl: UEFA_CL, seasonRef: "2002-03" }),
  q("b5-me-06", "copa_do_mundo", "medio", "Qual selecao eliminou o Brasil nas oitavas de final da Copa do Mundo de 1990, com gol de Caniggia?", "Argentina", { explanation: "A Argentina venceu por 1 a 0 em Turim, apos jogada de Maradona.", sourceUrl: FIFA, seasonRef: "1990" }),
  q("b5-me-07", "copa_do_mundo", "medio", "Qual selecao eliminou o Brasil de Zico e Socrates na Copa de 1982, na \"Tragedia do Sarria\"?", "Italia", { explanation: "A Italia venceu por 3 a 2, com tres gols de Paolo Rossi.", sourceUrl: FIFA, seasonRef: "1982" }),
  q("b5-me-08", "copa_do_mundo", "medio", "Qual selecao eliminou o Brasil nos penaltis, nas quartas de final da Copa do Mundo de 1986?", "Franca", { explanation: "Apos 1 a 1, a Franca de Platini venceu nos penaltis em Guadalajara.", sourceUrl: FIFA, seasonRef: "1986" }),
  q("b5-me-09", "libertadores", "medio", "Qual tecnico comandou o Atletico Mineiro campeao da Libertadores de 2013?", "Cuca", { acceptedAnswers: ["alexi stival"], explanation: "Cuca levou o Galo ao primeiro titulo da Libertadores.", sourceUrl: CONMEBOL, seasonRef: "2013" }),
  q("b5-me-10", "competicoes_internacionais", "medio", "Qual tecnico comandou o Corinthians campeao do primeiro Mundial de Clubes da FIFA, em 2000?", "Oswaldo de Oliveira", { acceptedAnswers: ["oswaldo"], explanation: "O Corinthians venceu o Vasco nos penaltis na final, no Maracana.", sourceUrl: FIFA_CWC, seasonRef: "2000" }),
  q("b5-me-11", "competicoes_internacionais", "medio", "Qual tecnico comandou o Internacional campeao do Mundial de Clubes de 2006, contra o Barcelona?", "Abel Braga", { acceptedAnswers: ["abel", "abelao"], explanation: "Abel Braga venceu a Libertadores e o Mundial com o Inter em 2006.", sourceUrl: FIFA_CWC, seasonRef: "2006" }),
  q("b5-me-12", "libertadores", "medio", "Qual tecnico comandou o Gremio campeao da Libertadores de 2017?", "Renato Gaucho", { acceptedAnswers: ["renato", "renato portaluppi"], explanation: "Renato foi campeao da Libertadores pelo Gremio como jogador (1983) e como tecnico (2017).", sourceUrl: CONMEBOL, seasonRef: "2017" }),
  q("b5-me-13", "libertadores", "medio", "Qual tecnico comandou o Flamengo campeao da Libertadores de 2022?", "Dorival Junior", { acceptedAnswers: ["dorival"], explanation: "Dorival venceu a Libertadores e a Copa do Brasil em 2022.", sourceUrl: CONMEBOL, seasonRef: "2022" }),
  q("b5-me-14", "futebol_brasileiro", "medio", "Qual atacante argentino foi o artilheiro do Brasileirao de 2022, pelo Fluminense?", "German Cano", { acceptedAnswers: ["cano"], explanation: "Cano terminou o Brasileirao de 2022 com 26 gols.", sourceUrl: CBF, seasonRef: "2022" }),
  q("b5-me-15", "copa_do_mundo", "medio", "Qual goleiro alemao foi eleito o melhor jogador da Copa do Mundo de 2002?", "Oliver Kahn", { acceptedAnswers: ["kahn"], explanation: "Kahn foi o unico goleiro a ganhar a Bola de Ouro de uma Copa.", sourceUrl: FIFA, seasonRef: "2002" }),
  q("b5-me-16", "copa_do_mundo", "medio", "Qual atacante brasileiro foi eleito o melhor jogador da Copa do Mundo de 1998, mesmo com a derrota na final?", "Ronaldo", { acceptedAnswers: ["ronaldo fenomeno", "ronaldo nazario"], explanation: "Ronaldo levou a Bola de Ouro da Copa da Franca.", sourceUrl: FIFA, seasonRef: "1998" }),
  q("b5-me-17", "futebol_brasileiro", "medio", "Em que ano o Corinthians foi rebaixado para a Serie B do Brasileirao?", "2007", { explanation: "O Corinthians caiu em 2007 e voltou como campeao da Serie B em 2008.", sourceUrl: CBF, seasonRef: "2007" }),
  q("b5-me-18", "futebol_brasileiro", "medio", "Em que ano o Palmeiras foi rebaixado pela primeira vez para a Serie B?", "2002", { explanation: "O Palmeiras caiu em 2002 e voltou como campeao da Serie B em 2003.", sourceUrl: CBF, seasonRef: "2002" }),
  q("b5-me-19", "competicoes_internacionais", "medio", "Qual selecao venceu a Copa America de 2011, disputada na Argentina?", "Uruguai", { explanation: "O Uruguai de Forlan e Suarez venceu o Paraguai por 3 a 0 na final.", sourceUrl: COPA_AMERICA, seasonRef: "2011" }),

  // ---------- DIFICIL (19) ----------
  q("b5-d-01", "copa_do_mundo", "dificil", "Qual jogador argentino foi o artilheiro da primeira Copa do Mundo, em 1930, com 8 gols?", "Guillermo Stabile", { acceptedAnswers: ["stabile"], explanation: "Stabile marcou 8 gols e a Argentina foi vice-campea.", sourceUrl: WC_TOP_SCORERS, seasonRef: "1930" }),
  q("b5-d-02", "copa_do_mundo", "dificil", "Qual atacante brasileiro foi o artilheiro da Copa do Mundo de 1950?", "Ademir", { acceptedAnswers: ["ademir de menezes", "queixada"], explanation: "Ademir, do Vasco, foi o goleador da Copa do Maracanazo.", sourceUrl: WC_TOP_SCORERS, seasonRef: "1950" }),
  q("b5-d-03", "copa_do_mundo", "dificil", "Qual atacante hungaro foi o artilheiro da Copa do Mundo de 1954, com 11 gols?", "Sandor Kocsis", { acceptedAnswers: ["kocsis"], explanation: "Kocsis brilhou na Hungria que perdeu a final para a Alemanha Ocidental.", sourceUrl: WC_TOP_SCORERS, seasonRef: "1954" }),
  q("b5-d-04", "copa_do_mundo", "dificil", "Quem foi o artilheiro da Copa do Mundo de 2002, com 8 gols?", "Ronaldo", { acceptedAnswers: ["ronaldo fenomeno", "ronaldo nazario"], explanation: "Ronaldo foi artilheiro e campeao na Coreia do Sul e Japao.", sourceUrl: WC_TOP_SCORERS, seasonRef: "2002" }),
  q("b5-d-05", "selecoes", "dificil", "Quem era o tecnico do Uruguai campeao da primeira Copa do Mundo, em 1930?", "Alberto Suppici", { acceptedAnswers: ["suppici"], explanation: "Suppici e o tecnico mais jovem a vencer uma Copa.", sourceUrl: WC_MANAGERS, seasonRef: "1930" }),
  q("b5-d-06", "selecoes", "dificil", "Quem era o tecnico do Uruguai campeao da Copa do Mundo de 1950, no Maracanazo?", "Juan Lopez Fontana", { acceptedAnswers: ["juan lopez", "lopez fontana"], explanation: "Juan Lopez comandou a virada sobre o Brasil no Maracana.", sourceUrl: WC_MANAGERS, seasonRef: "1950" }),
  q("b5-d-07", "selecoes", "dificil", "Quem era o tecnico da Alemanha Ocidental campea da Copa do Mundo de 1954?", "Sepp Herberger", { acceptedAnswers: ["herberger"], explanation: "Herberger comandou o \"Milagre de Berna\" contra a Hungria.", sourceUrl: WC_MANAGERS, seasonRef: "1954" }),
  q("b5-d-08", "selecoes", "dificil", "Quem era o tecnico da Alemanha Ocidental campea da Copa do Mundo de 1974?", "Helmut Schon", { acceptedAnswers: ["schon", "schoen", "helmut schoen"], explanation: "Schon venceu a Holanda de Cruyff na final de Munique.", sourceUrl: WC_MANAGERS, seasonRef: "1974" }),
  q("b5-d-09", "selecoes", "dificil", "Quem era o tecnico da Franca campea da Copa do Mundo de 1998?", "Aime Jacquet", { acceptedAnswers: ["jacquet"], explanation: "Jacquet levou a Franca ao primeiro titulo mundial, em casa.", sourceUrl: WC_MANAGERS, seasonRef: "1998" }),
  q("b5-d-10", "copa_do_mundo", "dificil", "Qual foi o placar da final da Copa do Mundo de 1934, Italia contra Tchecoslovaquia, apos a prorrogacao?", "2 a 1", { acceptedAnswers: ["2x1", "2-1"], explanation: "A Italia virou na prorrogacao e conquistou seu primeiro titulo, em Roma.", sourceUrl: WC_FINALS, seasonRef: "1934" }),
  q("b5-d-11", "copa_do_mundo", "dificil", "Qual foi o placar da final da Copa do Mundo de 1938, Italia contra Hungria?", "4 a 2", { acceptedAnswers: ["4x2", "4-2"], explanation: "A Italia foi bicampea em Paris.", sourceUrl: WC_FINALS, seasonRef: "1938" }),
  q("b5-d-12", "copa_do_mundo", "dificil", "Qual foi o placar da final da Copa do Mundo de 1962, Brasil contra Tchecoslovaquia?", "3 a 1", { acceptedAnswers: ["3x1", "3-1"], explanation: "Amarildo, Zito e Vava marcaram a virada brasileira em Santiago.", sourceUrl: WC_FINALS, seasonRef: "1962" }),
  q("b5-d-13", "copa_do_mundo", "dificil", "Qual foi o placar da final da Copa do Mundo de 1974, Alemanha Ocidental contra Holanda?", "2 a 1", { acceptedAnswers: ["2x1", "2-1"], explanation: "A Holanda saiu na frente com penalti, mas a Alemanha virou em Munique.", sourceUrl: WC_FINALS, seasonRef: "1974" }),
  q("b5-d-14", "copa_do_mundo", "dificil", "Qual foi o placar da final da Copa do Mundo de 1978, Argentina contra Holanda, apos a prorrogacao?", "3 a 1", { acceptedAnswers: ["3x1", "3-1"], explanation: "A Argentina venceu no Monumental de Nunez e conquistou seu primeiro titulo.", sourceUrl: WC_FINALS, seasonRef: "1978" }),
  q("b5-d-15", "copa_do_mundo", "dificil", "Qual atacante brasileiro, substituto de Pele, marcou o gol de empate do Brasil na final da Copa do Mundo de 1962?", "Amarildo", { acceptedAnswers: ["amarildo tavares da silveira"], explanation: "Amarildo empatou aos 17 minutos e o Brasil venceu por 3 a 1.", sourceUrl: WC_1962_FINAL, seasonRef: "1962" }),
  q("b5-d-16", "copa_do_mundo", "dificil", "Qual meia tcheco abriu o placar contra o Brasil na final da Copa do Mundo de 1962?", "Josef Masopust", { acceptedAnswers: ["masopust"], explanation: "Masopust marcou aos 15 minutos, mas o Brasil virou para 3 a 1.", sourceUrl: WC_1962_FINAL, seasonRef: "1962" }),
  q("b5-d-17", "copa_do_mundo", "dificil", "Quem marcou o gol da vitoria da Alemanha Ocidental na final da Copa do Mundo de 1974, contra a Holanda?", "Gerd Muller", { acceptedAnswers: ["muller", "mueller", "gerd mueller"], explanation: "Muller marcou aos 43 minutos, depois dos penaltis de Neeskens e Breitner.", sourceUrl: WC_1974_FINAL, seasonRef: "1974" }),
  q("b5-d-18", "champions_league", "dificil", "Qual atacante noruegues marcou o gol do titulo do Manchester United nos acrescimos da final da Liga dos Campeoes de 1999?", "Ole Gunnar Solskjaer", { acceptedAnswers: ["solskjaer"], explanation: "Sheringham empatou e Solskjaer virou nos acrescimos contra o Bayern, no Camp Nou.", sourceUrl: UCL_1999, seasonRef: "1998-99" }),
  q("b5-d-19", "champions_league", "dificil", "Quem marcou o gol do titulo do Bayern aos 89 minutos da final da Liga dos Campeoes de 2013, contra o Borussia Dortmund?", "Arjen Robben", { acceptedAnswers: ["robben"], explanation: "Robben fez 2 a 1 em Wembley, um ano depois de perder um penalti na final de 2012.", sourceUrl: UCL_2013, seasonRef: "2012-13" }),

  // ---------- IMPOSSIVEL (24) ----------
  q("b5-i-01", "futebol_brasileiro", "impossivel", "Qual atacante do Santa Cruz foi o artilheiro do Brasileirao de 1973, com 21 gols?", "Ramon", { acceptedAnswers: ["ramon"], explanation: "Ramon fez 21 gols pelo clube pernambucano.", sourceUrl: BR_TOPS, seasonRef: "1973" }),
  q("b5-i-02", "futebol_brasileiro", "impossivel", "Qual centroavante do Santos foi o artilheiro do Brasileirao de 1983, com 22 gols?", "Serginho Chulapa", { acceptedAnswers: ["serginho", "sergio bernardino"], explanation: "Serginho levou o Santos a final daquele ano contra o Flamengo.", sourceUrl: BR_TOPS, seasonRef: "1983" }),
  q("b5-i-03", "futebol_brasileiro", "impossivel", "Qual atacante do Sao Paulo foi o artilheiro do Brasileirao de 1986, com 25 gols?", "Careca", { acceptedAnswers: ["antonio de oliveira filho"], explanation: "Careca foi artilheiro e campeao com o Sao Paulo em 1986.", sourceUrl: BR_TOPS, seasonRef: "1986" }),
  q("b5-i-04", "futebol_brasileiro", "impossivel", "Quantos gols Edmundo marcou pelo Vasco no Brasileirao de 1997?", "29", { acceptedAnswers: ["vinte e nove"], explanation: "O Animal foi artilheiro e campeao brasileiro em 1997.", sourceUrl: BR_TOPS, seasonRef: "1997" }),
  q("b5-i-05", "futebol_brasileiro", "impossivel", "Qual atacante do Atletico Mineiro foi o artilheiro do Brasileirao de 1999, com 28 gols?", "Guilherme", { acceptedAnswers: ["guilherme alves"], explanation: "Guilherme igualou os 28 gols de Reinaldo em uma edicao pelo Galo.", sourceUrl: BR_TOPS, seasonRef: "1999" }),
  q("b5-i-06", "futebol_brasileiro", "impossivel", "Qual atacante do Vasco foi o artilheiro do Brasileirao de 1992, com 18 gols?", "Bebeto", { acceptedAnswers: ["jose roberto gama de oliveira"], explanation: "Bebeto foi artilheiro do Brasileirao dois anos antes do tetra.", sourceUrl: BR_TOPS, seasonRef: "1992" }),
  q("b5-i-07", "futebol_brasileiro", "impossivel", "Qual atacante foi o artilheiro do Brasileirao de 1989 jogando pelo Goias?", "Tulio", { acceptedAnswers: ["tulio maravilha"], explanation: "Tulio fez 11 gols pelo Goias, anos antes da fama no Botafogo.", sourceUrl: BR_TOPS, seasonRef: "1989" }),
  q("b5-i-08", "futebol_brasileiro", "impossivel", "Qual atacante do Santos foi o artilheiro do Brasileirao de 1991, com 15 gols?", "Paulinho McLaren", { acceptedAnswers: ["paulinho mclaren", "paulinho"], explanation: "Paulinho McLaren fez 15 gols pelo Santos naquele Brasileirao.", sourceUrl: BR_TOPS, seasonRef: "1991" }),
  q("b5-i-09", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Palmeiras bicampeao brasileiro em 1972 e 1973?", "Oswaldo Brandao", { acceptedAnswers: ["brandao", "osvaldo brandao"], explanation: "Brandao comandou a segunda Academia do Palmeiras.", sourceUrl: BR_COACHES, seasonRef: "1972-1973" }),
  q("b5-i-10", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Vasco no primeiro titulo brasileiro do clube, em 1974?", "Mario Travaglini", { acceptedAnswers: ["travaglini"], explanation: "Travaglini tambem tinha sido campeao da Taca Brasil de 1967 pelo Palmeiras.", sourceUrl: BR_COACHES, seasonRef: "1974" }),
  q("b5-i-11", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Flamengo campeao brasileiro de 1982?", "Paulo Cesar Carpegiani", { acceptedAnswers: ["carpegiani"], explanation: "Carpegiani tambem dirigiu o Flamengo campeao mundial de 1981.", sourceUrl: BR_COACHES, seasonRef: "1982" }),
  q("b5-i-12", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Sao Paulo campeao brasileiro de 1986?", "Pepe", { acceptedAnswers: ["jose macia"], explanation: "Pepe, idolo do Santos de Pele, foi campeao como tecnico do Sao Paulo.", sourceUrl: BR_COACHES, seasonRef: "1986" }),
  q("b5-i-13", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Bahia campeao brasileiro de 1988?", "Evaristo de Macedo", { acceptedAnswers: ["evaristo"], explanation: "Evaristo levou o Bahia ao seu segundo titulo nacional.", sourceUrl: BR_COACHES, seasonRef: "1988" }),
  q("b5-i-14", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Corinthians no primeiro titulo brasileiro do clube, em 1990?", "Nelsinho Baptista", { acceptedAnswers: ["nelsinho"], explanation: "Nelsinho Baptista venceu o Sao Paulo na final de 1990.", sourceUrl: BR_COACHES, seasonRef: "1990" }),
  q("b5-i-15", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Botafogo campeao brasileiro de 1995?", "Paulo Autuori", { acceptedAnswers: ["autuori"], explanation: "O Botafogo de Tulio venceu o Santos na final de 1995.", sourceUrl: BR_COACHES, seasonRef: "1995" }),
  q("b5-i-16", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Vasco campeao brasileiro de 1997, o time de Edmundo?", "Antonio Lopes", { explanation: "Antonio Lopes tambem levou o Vasco a Libertadores de 1998.", sourceUrl: BR_COACHES, seasonRef: "1997" }),
  q("b5-i-17", "futebol_brasileiro", "impossivel", "Qual clube carioca venceu o Torneio Roberto Gomes Pedrosa de 1970, o \"Robertao\"?", "Fluminense", { acceptedAnswers: ["flu"], explanation: "O titulo, sob o comando de Paulo Amaral, e reconhecido pela CBF como Brasileirao.", sourceUrl: BR_COACHES, seasonRef: "1970" }),
  q("b5-i-18", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Cruzeiro campeao da Taca Brasil de 1966?", "Airton Moreira", { acceptedAnswers: ["airton"], explanation: "Airton era irmao de Aymore Moreira, tecnico campeao do mundo em 1962.", sourceUrl: BR_COACHES, seasonRef: "1966" }),
  q("b5-i-19", "libertadores", "impossivel", "Qual clube brasileiro perdeu para o Penarol a final da Libertadores de 1961?", "Palmeiras", { acceptedAnswers: ["verdao"], explanation: "O Penarol venceu por 1 a 0 em Montevideu e empatou em 1 a 1 em Sao Paulo.", sourceUrl: LIB_FINALS, seasonRef: "1961" }),
  q("b5-i-20", "libertadores", "impossivel", "Qual clube brasileiro perdeu para o Independiente a final da Libertadores de 1984?", "Gremio", { acceptedAnswers: ["imortal"], explanation: "O Independiente venceu por 1 a 0 em Porto Alegre e segurou o 0 a 0 em casa.", sourceUrl: LIB_FINALS, seasonRef: "1984" }),
  q("b5-i-21", "libertadores", "impossivel", "Qual clube argentino venceu a Libertadores de 1985, nos penaltis, sobre o America de Cali?", "Argentinos Juniors", { acceptedAnswers: ["argentinos"], explanation: "O jogo-desempate foi em Assuncao e terminou 1 a 1.", sourceUrl: LIB_FINALS, seasonRef: "1985" }),
  q("b5-i-22", "libertadores", "impossivel", "Qual clube colombiano perdeu tres finais seguidas da Libertadores, em 1985, 1986 e 1987?", "America de Cali", { acceptedAnswers: ["america"], explanation: "Perdeu para Argentinos Juniors, River Plate e Penarol.", sourceUrl: LIB_FINALS, seasonRef: "1985-1987" }),
  q("b5-i-23", "libertadores", "impossivel", "Qual clube chileno perdeu para o Independiente, em jogo-desempate em Assuncao, a final da Libertadores de 1975?", "Union Espanola", { explanation: "O Independiente venceu o desempate por 2 a 0 e foi tetracampeao seguido.", sourceUrl: LIB_FINALS, seasonRef: "1975" }),
  q("b5-i-24", "futebol_brasileiro", "impossivel", "Qual clube do Distrito Federal foi vice-campeao da Copa do Brasil de 2002, perdendo a final para o Corinthians?", "Brasiliense", { explanation: "O Brasiliense chegou a final ainda como clube recem-fundado.", sourceUrl: CDB_FINALS, seasonRef: "2002" }),
];
