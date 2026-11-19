// Question bank, batch 002 (100 of the planned 3000: 25 per difficulty).
// Same format/loader/idempotency pattern as batch-001.ts -- see
// server/src/questions/bank/PROGRESS.md for the full methodology.
//
// This batch covers NEW ground not asked by the original 66 seed questions
// nor by batch 001: Copa America history, record transfers, Eurocopa by
// year, 1990s Brasileirao champions, stadium capacities, and additional
// Libertadores/Champions League champions and historical facts. Every
// entry was cross-checked against both seed.ts and batch-001.ts to avoid
// repeating the same fact in the same direction.
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
const UEFA_EURO = "https://www.uefa.com/uefaeuro/history/";
const CONMEBOL = "https://www.conmebol.com/libertadores/";
const CONMEBOL_CA = "https://www.conmebol.com/copa-america/";
const CBF = "https://www.cbf.com.br/futebol-brasileiro/competicoes/campeonato-brasileiro-serie-a";
const TRANSFER = "https://www.footballtransfers.com/";

export const batch002: BankQuestion[] = [
  // ---------- FACIL (25) ----------
  q("b2-f-01", "competicoes_internacionais", "facil", "Qual selecao venceu a Copa America de 2021, disputada no Brasil?", "Argentina", { sourceUrl: CONMEBOL_CA, seasonRef: "2021" }),
  q("b2-f-02", "competicoes_internacionais", "facil", "Qual selecao venceu a Copa America de 2024, disputada nos Estados Unidos?", "Argentina", { sourceUrl: CONMEBOL_CA, seasonRef: "2024" }),
  q("b2-f-03", "competicoes_internacionais", "facil", "Qual selecao e a maior campea da historia da Copa America?", "Argentina", { sourceUrl: CONMEBOL_CA, seasonRef: "ate 2024" }),
  q("b2-f-04", "jogadores", "facil", "Qual jogador brasileiro teve a transferencia mais cara da historia do futebol, ao ser vendido do Barcelona ao Paris Saint-Germain em 2017?", "Neymar", { sourceUrl: TRANSFER, seasonRef: "2017" }),
  q("b2-f-05", "futebol_europeu", "facil", "Qual selecao venceu a primeira edicao da Eurocopa, em 1960?", "Uniao Sovietica", { acceptedAnswers: ["urss", "soviet"], sourceUrl: UEFA_EURO, seasonRef: "1960" }),
  q("b2-f-06", "futebol_europeu", "facil", "Qual selecao venceu a Eurocopa de 2012, disputada na Polonia e Ucrania?", "Espanha", { sourceUrl: UEFA_EURO, seasonRef: "2012" }),
  q("b2-f-07", "futebol_brasileiro", "facil", "Qual clube foi campeao brasileiro em 1990, seu primeiro titulo nacional?", "Corinthians", { sourceUrl: CBF, seasonRef: "1990" }),
  q("b2-f-08", "futebol_brasileiro", "facil", "Qual clube foi campeao brasileiro em 1991?", "Sao Paulo", { sourceUrl: CBF, seasonRef: "1991" }),
  q("b2-f-09", "futebol_brasileiro", "facil", "Qual clube foi campeao brasileiro em 1992?", "Flamengo", { sourceUrl: CBF, seasonRef: "1992" }),
  q("b2-f-10", "futebol_brasileiro", "facil", "Qual clube foi campeao brasileiro em 1996?", "Gremio", { sourceUrl: CBF, seasonRef: "1996" }),
  q("b2-f-11", "clubes", "facil", "Em que cidade italiana fica o estadio San Siro, usado por Inter de Milao e AC Milan?", "Milao", { acceptedAnswers: ["milão"], sourceUrl: UEFA_CL }),
  q("b2-f-12", "clubes", "facil", "Qual e o nome do estadio do Boca Juniors, na Argentina?", "La Bombonera", { sourceUrl: CONMEBOL }),
  q("b2-f-13", "clubes", "facil", "Qual e o nome do estadio do River Plate, na Argentina?", "Monumental de Nunez", { acceptedAnswers: ["estadio monumental", "monumental de nuñez"], sourceUrl: CONMEBOL }),
  q("b2-f-14", "historia_do_futebol", "facil", "Quantos minutos tem o tempo regulamentar de uma partida de futebol, sem prorrogacao?", "90", { acceptedAnswers: ["noventa"], sourceUrl: FIFA }),
  q("b2-f-15", "historia_do_futebol", "facil", "Quanto tempo dura cada tempo regulamentar de uma partida de futebol?", "45 minutos", { acceptedAnswers: ["45", "quarenta e cinco minutos"], sourceUrl: FIFA }),
  q("b2-f-16", "copa_do_mundo", "facil", "Em que pais foi disputada a Copa do Mundo de 1998?", "Franca", { acceptedAnswers: ["frança"], sourceUrl: FIFA, seasonRef: "1998" }),
  q("b2-f-17", "copa_do_mundo", "facil", "Em que pais foi disputada a Copa do Mundo de 1990?", "Italia", { acceptedAnswers: ["itália"], sourceUrl: FIFA, seasonRef: "1990" }),
  q("b2-f-18", "copa_do_mundo", "facil", "Em que pais foi disputada a Copa do Mundo de 1986?", "Mexico", { acceptedAnswers: ["méxico"], sourceUrl: FIFA, seasonRef: "1986" }),
  q("b2-f-19", "jogadores", "facil", "Qual jogador portugues e o maior artilheiro da historia da selecao de Portugal?", "Cristiano Ronaldo", { sourceUrl: UEFA_EURO }),
  q("b2-f-20", "selecoes", "facil", "Qual e a cor tradicional da camisa titular da selecao da Argentina?", "Celeste e branca", { acceptedAnswers: ["azul e branca", "albiceleste"], sourceUrl: FIFA }),
  q("b2-f-21", "selecoes", "facil", "Qual e a cor tradicional da camisa titular da selecao da Italia?", "Azul", { acceptedAnswers: ["azzurra"], sourceUrl: FIFA }),
  q("b2-f-22", "clubes", "facil", "Em que cidade espanhola fica o estadio Santiago Bernabeu?", "Madri", { acceptedAnswers: ["madrid"], sourceUrl: UEFA_CL }),
  q("b2-f-23", "libertadores", "facil", "Qual pais sedia a sede da CONMEBOL, orgao que organiza a Copa Libertadores?", "Paraguai", { sourceUrl: CONMEBOL }),
  q("b2-f-24", "futebol_brasileiro", "facil", "Qual clube foi campeao brasileiro em 1989?", "Vasco da Gama", { acceptedAnswers: ["vasco"], sourceUrl: CBF, seasonRef: "1989" }),
  q("b2-f-25", "jogadores", "facil", "Qual jogador egipcio e o principal nome do Liverpool e da selecao do Egito desde a decada de 2010?", "Mohamed Salah", { sourceUrl: UEFA_CL }),

  // ---------- MODERADO (25) ----------
  q("b2-m-01", "competicoes_internacionais", "moderado", "Qual selecao venceu a Copa America de 2019, disputada no Brasil?", "Brasil", { sourceUrl: CONMEBOL_CA, seasonRef: "2019" }),
  q("b2-m-02", "competicoes_internacionais", "moderado", "Qual selecao venceu a Copa America de 2015, disputada no Chile?", "Chile", { sourceUrl: CONMEBOL_CA, seasonRef: "2015" }),
  q("b2-m-03", "competicoes_internacionais", "moderado", "Qual selecao venceu a Copa America de 2016, a edicao do centenario, disputada nos Estados Unidos?", "Chile", { sourceUrl: CONMEBOL_CA, seasonRef: "2016" }),
  q("b2-m-04", "jogadores", "moderado", "Qual jogador frances se transferiu do Monaco para o Paris Saint-Germain em 2017, em um dos negocios mais caros da historia do futebol?", "Kylian Mbappe", { sourceUrl: TRANSFER, seasonRef: "2017" }),
  q("b2-m-05", "futebol_europeu", "moderado", "Qual selecao venceu a Eurocopa de 2004, surpreendendo como azarona na Portugal anfitriao?", "Grecia", { acceptedAnswers: ["grécia"], sourceUrl: UEFA_EURO, seasonRef: "2004" }),
  q("b2-m-06", "futebol_europeu", "moderado", "Qual selecao venceu a Eurocopa de 1988, disputada na Alemanha Ocidental?", "Holanda", { acceptedAnswers: ["países baixos", "paises baixos"], sourceUrl: UEFA_EURO, seasonRef: "1988" }),
  q("b2-m-07", "futebol_europeu", "moderado", "Qual selecao venceu a Eurocopa de 1992, disputada na Suecia?", "Dinamarca", { sourceUrl: UEFA_EURO, seasonRef: "1992" }),
  q("b2-m-08", "futebol_brasileiro", "moderado", "Qual clube foi campeao brasileiro em 1993?", "Palmeiras", { sourceUrl: CBF, seasonRef: "1993" }),
  q("b2-m-09", "futebol_brasileiro", "moderado", "Qual clube foi campeao brasileiro em 1994?", "Palmeiras", { sourceUrl: CBF, seasonRef: "1994" }),
  q("b2-m-10", "futebol_brasileiro", "moderado", "Qual clube foi campeao brasileiro em 1995?", "Botafogo", { sourceUrl: CBF, seasonRef: "1995" }),
  q("b2-m-11", "futebol_brasileiro", "moderado", "Qual clube foi campeao brasileiro em 1997?", "Vasco da Gama", { acceptedAnswers: ["vasco"], sourceUrl: CBF, seasonRef: "1997" }),
  q("b2-m-12", "libertadores", "moderado", "Qual clube venceu a Copa Libertadores de 2017, se tornando tricampeao da competicao?", "Gremio", { sourceUrl: CONMEBOL, seasonRef: "2017" }),
  q("b2-m-13", "libertadores", "moderado", "Qual clube venceu a Copa Libertadores de 2019?", "Flamengo", { sourceUrl: CONMEBOL, seasonRef: "2019" }),
  q("b2-m-14", "libertadores", "moderado", "Qual clube venceu a Copa Libertadores de 2020, disputada ja durante a pandemia?", "Palmeiras", { sourceUrl: CONMEBOL, seasonRef: "2020" }),
  q("b2-m-15", "libertadores", "moderado", "Qual clube venceu a Copa Libertadores de 2021?", "Palmeiras", { sourceUrl: CONMEBOL, seasonRef: "2021" }),
  q("b2-m-16", "libertadores", "moderado", "Qual clube venceu a Copa Libertadores de 2022?", "Flamengo", { sourceUrl: CONMEBOL, seasonRef: "2022" }),
  q("b2-m-17", "champions_league", "moderado", "Qual clube venceu a Liga dos Campeoes da UEFA de 2020, disputada em formato de mata-mata unico em Lisboa?", "Bayern de Munique", { acceptedAnswers: ["bayern munich", "bayern"], sourceUrl: UEFA_CL, seasonRef: "2019-20" }),
  q("b2-m-18", "champions_league", "moderado", "Qual clube venceu a Liga dos Campeoes da UEFA de 2019?", "Liverpool", { sourceUrl: UEFA_CL, seasonRef: "2018-19" }),
  q("b2-m-19", "champions_league", "moderado", "Qual clube venceu a Liga dos Campeoes da UEFA de 2025?", "Paris Saint-Germain", { sourceUrl: UEFA_CL, seasonRef: "2024-25" }),
  q("b2-m-20", "copa_do_mundo", "moderado", "Qual foi o primeiro pais a sediar a Copa do Mundo duas vezes, com edicoes em 1934 e 1990?", "Italia", { acceptedAnswers: ["itália"], sourceUrl: FIFA, seasonRef: "1934 e 1990" }),
  q("b2-m-21", "clubes", "moderado", "Qual clube ingles tem o estadio Anfield como sua casa?", "Liverpool", { sourceUrl: UEFA_CL }),
  q("b2-m-22", "clubes", "moderado", "Qual clube ingles tem o estadio Stamford Bridge como sua casa?", "Chelsea", { sourceUrl: UEFA_CL }),
  q("b2-m-23", "clubes", "moderado", "Qual clube ingles tem o estadio Emirates Stadium como sua casa?", "Arsenal", { sourceUrl: UEFA_CL }),
  q("b2-m-24", "futebol_brasileiro", "moderado", "Qual foi o ultimo clube a vencer o Campeonato Brasileiro antes do primeiro titulo do Corinthians em 1990?", "Vasco da Gama", { acceptedAnswers: ["vasco"], sourceUrl: CBF, seasonRef: "1989" }),
  q("b2-m-25", "competicoes_internacionais", "moderado", "Em que pais foi disputada a Copa America de 2021 apos a desistencia da Argentina e da Colombia como sedes originais?", "Brasil", { sourceUrl: CONMEBOL_CA, seasonRef: "2021" }),

  // ---------- MEDIO (25) ----------
  q("b2-d-01", "competicoes_internacionais", "medio", "Qual selecao venceu a primeira edicao da Copa America, em 1916?", "Uruguai", { sourceUrl: CONMEBOL_CA, seasonRef: "1916" }),
  q("b2-d-02", "competicoes_internacionais", "medio", "Qual selecao sul-americana venceu a Copa America de 2001, disputada na Colombia?", "Colombia", { acceptedAnswers: ["colômbia"], sourceUrl: CONMEBOL_CA, seasonRef: "2001" }),
  q("b2-d-03", "competicoes_internacionais", "medio", "Qual selecao venceu a Copa America de 1975, a primeira edicao sem sede unica fixa?", "Peru", { sourceUrl: CONMEBOL_CA, seasonRef: "1975" }),
  q("b2-d-04", "jogadores", "medio", "Qual jogador frances teve, em 2017, uma das transferencias mais caras daquele ano ao deixar o Borussia Dortmund para o Barcelona?", "Ousmane Dembele", { sourceUrl: TRANSFER, seasonRef: "2017" }),
  q("b2-d-05", "futebol_europeu", "medio", "Qual selecao venceu a Eurocopa de 1976, decidida em disputa de penaltis?", "Tchecoslovaquia", { acceptedAnswers: ["checoslovaquia"], sourceUrl: UEFA_EURO, seasonRef: "1976" }),
  q("b2-d-06", "futebol_europeu", "medio", "Qual selecao venceu a Eurocopa de 1996, disputada na Inglaterra, com gol de ouro na final?", "Alemanha", { sourceUrl: UEFA_EURO, seasonRef: "1996" }),
  q("b2-d-07", "futebol_europeu", "medio", "Qual selecao venceu a Eurocopa de 2000, disputada na Belgica e Holanda?", "Franca", { acceptedAnswers: ["frança"], sourceUrl: UEFA_EURO, seasonRef: "2000" }),
  q("b2-d-08", "futebol_brasileiro", "medio", "Qual clube foi campeao brasileiro em 2000, no formato especial conhecida como Copa Joao Havelange?", "Vasco da Gama", { acceptedAnswers: ["vasco"], sourceUrl: CBF, seasonRef: "2000" }),
  q("b2-d-09", "futebol_brasileiro", "medio", "Qual clube foi campeao brasileiro em 2004?", "Santos", { sourceUrl: CBF, seasonRef: "2004" }),
  q("b2-d-10", "futebol_brasileiro", "medio", "Qual clube foi campeao brasileiro em 2005?", "Corinthians", { sourceUrl: CBF, seasonRef: "2005" }),
  q("b2-d-11", "libertadores", "medio", "Qual clube brasileiro venceu a Copa Libertadores de 1998?", "Vasco da Gama", { acceptedAnswers: ["vasco"], sourceUrl: CONMEBOL, seasonRef: "1998" }),
  q("b2-d-12", "libertadores", "medio", "Qual clube brasileiro venceu a Copa Libertadores de 1999?", "Palmeiras", { sourceUrl: CONMEBOL, seasonRef: "1999" }),
  q("b2-d-13", "libertadores", "medio", "Qual clube brasileiro venceu a Copa Libertadores de 1992, sua primeira conquista na competicao?", "Sao Paulo", { sourceUrl: CONMEBOL, seasonRef: "1992" }),
  q("b2-d-14", "libertadores", "medio", "Qual clube brasileiro venceu a Copa Libertadores de 1993, bicampeao seguido?", "Sao Paulo", { sourceUrl: CONMEBOL, seasonRef: "1993" }),
  q("b2-d-15", "libertadores", "medio", "Qual clube chileno foi o primeiro do pais a vencer a Copa Libertadores, em 1991?", "Colo-Colo", { acceptedAnswers: ["colo colo"], sourceUrl: CONMEBOL, seasonRef: "1991" }),
  q("b2-d-16", "champions_league", "medio", "Qual clube venceu a Liga dos Campeoes da UEFA de 1999, com dois gols nos minutos finais contra o Bayern de Munique?", "Manchester United", { sourceUrl: UEFA_CL, seasonRef: "1998-99" }),
  q("b2-d-17", "champions_league", "medio", "Qual clube espanhol venceu a Liga dos Campeoes da UEFA de 2014, vencendo o Atletico de Madrid na final, no chamado 'Decima'?", "Real Madrid", { sourceUrl: UEFA_CL, seasonRef: "2013-14" }),
  q("b2-d-18", "champions_league", "medio", "Qual clube alemao venceu a Liga dos Campeoes da UEFA de 2013, vencendo o Borussia Dortmund em uma final totalmente alema?", "Bayern de Munique", { acceptedAnswers: ["bayern munich", "bayern"], sourceUrl: UEFA_CL, seasonRef: "2012-13" }),
  q("b2-d-19", "jogadores", "medio", "Qual clube pagou o valor entao recorde mundial de transferencia por Zinedine Zidane, contratado da Juventus em 2001?", "Real Madrid", { sourceUrl: UEFA_CL, seasonRef: "2001" }),
  q("b2-d-20", "jogadores", "medio", "Qual jogador ingles se tornou o ingles mais caro da historia ao ser negociado entre Aston Villa e Chelsea, em 2026?", "Morgan Rogers", { sourceUrl: TRANSFER, seasonRef: "2026" }),
  q("b2-d-21", "jogadores", "medio", "Qual meio-campista argentino se transferiu do Benfica para o Chelsea em 2023, em um negocio que bateu o recorde de transferencia para um meio-campista naquele momento?", "Enzo Fernandez", { sourceUrl: TRANSFER, seasonRef: "2023" }),
  q("b2-d-22", "futebol_brasileiro", "medio", "Qual clube foi campeao brasileiro em 2001, no formato com Modulo Azul e Modulo Amarelo?", "Atletico Paranaense", { acceptedAnswers: ["atletico-pr", "athletico paranaense", "atlético paranaense"], sourceUrl: CBF, seasonRef: "2001" }),
  q("b2-d-23", "futebol_brasileiro", "medio", "Qual clube foi campeao brasileiro em 2003, seu titulo nacional mais recente até hoje?", "Cruzeiro", { sourceUrl: CBF, seasonRef: "2003" }),
  q("b2-d-24", "futebol_brasileiro", "medio", "Qual clube foi campeao brasileiro em 2010?", "Fluminense", { sourceUrl: CBF, seasonRef: "2010" }),
  q("b2-d-25", "futebol_brasileiro", "medio", "Qual clube foi campeao brasileiro em 2012?", "Fluminense", { sourceUrl: CBF, seasonRef: "2012" }),

  // ---------- DIFICIL (25) ----------
  q("b2-h-01", "competicoes_internacionais", "dificil", "Qual selecao venceu a Copa America de 1987, a primeira a adotar fase de grupos seguida de mata-mata?", "Uruguai", { sourceUrl: CONMEBOL_CA, seasonRef: "1987" }),
  q("b2-h-02", "competicoes_internacionais", "dificil", "Qual selecao venceu a Copa America de 1993, disputada no Equador?", "Argentina", { sourceUrl: CONMEBOL_CA, seasonRef: "1993" }),
  q("b2-h-03", "jogadores", "dificil", "Qual jogador brasileiro se transferiu do Liverpool para o Barcelona em 2018, em um dos negocios mais caros ja pagos por um jogador sul-americano?", "Philippe Coutinho", { sourceUrl: TRANSFER, seasonRef: "2018" }),
  q("b2-h-04", "futebol_europeu", "dificil", "Qual selecao venceu a Eurocopa de 1980, disputada na Italia, em formato sem fase final de mata-mata?", "Alemanha Ocidental", { acceptedAnswers: ["alemanha"], sourceUrl: UEFA_EURO, seasonRef: "1980" }),
  q("b2-h-05", "futebol_europeu", "dificil", "Qual selecao venceu a Eurocopa de 1968, a unica decidida por sorteio de moeda apos empate na repeticao da final?", "Italia", { acceptedAnswers: ["itália"], sourceUrl: UEFA_EURO, seasonRef: "1968" }),
  q("b2-h-06", "futebol_europeu", "dificil", "Qual selecao venceu a Eurocopa de 1964, disputada na Espanha, pais anfitriao?", "Espanha", { sourceUrl: UEFA_EURO, seasonRef: "1964" }),
  q("b2-h-07", "futebol_brasileiro", "dificil", "Qual clube foi campeao da Taca Brasil de 1962 e 1963, torneio predecessor do Campeonato Brasileiro atual?", "Santos", { sourceUrl: CBF, seasonRef: "1962-1963" }),
  q("b2-h-08", "jogadores", "dificil", "Qual goleiro mexicano foi o primeiro jogador da historia a disputar cinco Copas do Mundo, entre 1950 e 1966?", "Antonio Carbajal", { sourceUrl: FIFA, seasonRef: "1950-1966" }),
  q("b2-h-09", "libertadores", "dificil", "Qual clube paraguaio foi campeao da Copa Libertadores de 1979?", "Olimpia", { sourceUrl: CONMEBOL, seasonRef: "1979" }),
  q("b2-h-10", "libertadores", "dificil", "Qual clube paraguaio foi campeao da Copa Libertadores de 2002?", "Olimpia", { sourceUrl: CONMEBOL, seasonRef: "2002" }),
  q("b2-h-11", "libertadores", "dificil", "Qual clube uruguaio foi campeao da Copa Libertadores de 1988?", "Nacional", { acceptedAnswers: ["nacional de montevideo", "nacional de montevidéu"], sourceUrl: CONMEBOL, seasonRef: "1988" }),
  q("b2-h-12", "champions_league", "dificil", "Qual clube portugues venceu a Copa dos Campeoes Europeus (atual Champions League) em 1961 e 1962, sob o comando de Bela Guttmann?", "Benfica", { sourceUrl: UEFA_CL, seasonRef: "1961-1962" }),
  q("b2-h-13", "champions_league", "dificil", "Qual clube holandes venceu tres edicoes seguidas da Copa dos Campeoes Europeus, entre 1971 e 1973?", "Ajax", { sourceUrl: UEFA_CL, seasonRef: "1971-1973" }),
  q("b2-h-14", "champions_league", "dificil", "Qual clube alemao venceu tres edicoes seguidas da Copa dos Campeoes Europeus, entre 1974 e 1976?", "Bayern de Munique", { acceptedAnswers: ["bayern munich", "bayern"], sourceUrl: UEFA_CL, seasonRef: "1974-1976" }),
  q("b2-h-15", "jogadores", "dificil", "Qual jogador neerlandes, tricampeao europeu pelo Ajax nos anos 1970, venceu tres Bolas de Ouro na decada?", "Johan Cruyff", { acceptedAnswers: ["cruyff"], sourceUrl: UEFA_CL }),
  q("b2-h-16", "historia_do_futebol", "dificil", "Em que ano a FIFA introduziu o cartao amarelo e o cartao vermelho, usados por primeira vez na Copa do Mundo de 1970?", "1970", { sourceUrl: FIFA, seasonRef: "1970" }),
  q("b2-h-17", "historia_do_futebol", "dificil", "Em que ano foi introduzida a regra que proibe o goleiro de usar as maos em bolas tocadas de volta por um companheiro de time (regra do 'passe para tras')?", "1992", { sourceUrl: FIFA, seasonRef: "1992" }),
  q("b2-h-18", "libertadores", "dificil", "Qual clube brasileiro foi vice-campeao da Copa Libertadores de 2005, perdendo para o Sao Paulo?", "Atletico Paranaense", { acceptedAnswers: ["atletico-pr", "athletico paranaense"], sourceUrl: CONMEBOL, seasonRef: "2005" }),
  q("b2-h-19", "copa_do_mundo", "dificil", "Antes da Franca em 1998, qual foi a ultima selecao a vencer a Copa do Mundo jogando em casa, feito conquistado em 1978?", "Argentina", { sourceUrl: FIFA, seasonRef: "1978" }),
  q("b2-h-20", "jogadores", "dificil", "Quem foi o capitao da selecao uruguaia campea da Copa do Mundo de 1950, o 'Maracanazo'?", "Obdulio Varela", { sourceUrl: FIFA, seasonRef: "1950" }),
  q("b2-h-21", "clubes", "dificil", "Qual clube escoces e o maior campeao nacional da Escocia, rival historico do Celtic no 'Old Firm'?", "Rangers", { sourceUrl: UEFA_CL }),
  q("b2-h-22", "clubes", "dificil", "Qual clube escoces, rival do Rangers, disputa com ele o tradicional 'Old Firm' de Glasgow?", "Celtic", { sourceUrl: UEFA_CL }),
  q("b2-h-23", "champions_league", "dificil", "Qual clube italiano venceu a Copa dos Campeoes Europeus de 1963 e 1965, sob o comando de Helenio Herrera?", "Inter de Milao", { acceptedAnswers: ["internazionale", "inter"], sourceUrl: UEFA_CL, seasonRef: "1963-1965" }),
  q("b2-h-24", "competicoes_internacionais", "dificil", "Qual selecao venceu a Copa America de 1983, decidida em jogos de ida e volta entre os finalistas?", "Uruguai", { sourceUrl: CONMEBOL_CA, seasonRef: "1983" }),
  q("b2-h-25", "competicoes_internacionais", "dificil", "Qual selecao venceu a Copa America de 1995, disputada no Uruguai?", "Uruguai", { sourceUrl: CONMEBOL_CA, seasonRef: "1995" }),
];
