// Question bank, batch 006 (100 questions: 19 facil, 19 moderado, 19 medio,
// 19 dificil, 24 impossivel). Same format/loader/idempotency pattern as
// batch-003.ts -- see server/src/questions/bank/PROGRESS.md.
//
// Written by hand (no AI pipeline). Checked against the full text of seed.ts
// and batches 001-005 so no fact is asked again, in either direction. Every
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
const UEFA_EL = "https://www.uefa.com/uefaeuropaleague/history/";
const CONMEBOL = "https://www.conmebol.com/libertadores/";
const CONMEBOL_SUD = "https://www.conmebol.com/sudamericana/";
const COPA_AMERICA = "https://www.conmebol.com/copa-america/";
const CBF = "https://www.cbf.com.br/futebol-brasileiro/competicoes/campeonato-brasileiro-serie-a";
const CBF_CDB = "https://www.cbf.com.br/futebol-brasileiro/competicoes/copa-brasil-masculino";
const PL = "https://www.premierleague.com/history";
const AFC = "https://www.the-afc.com/en/national/afc_asian_cup.html";

// Sources actually used to verify the medio (artilheiros) and
// dificil/impossivel entries.
const BR_TOPS = "https://www.rsssfbrasil.com/tablesae/brtops.htm";
const BR_COACHES = "https://rsssfbrasil.com/miscellaneous/brcoaches.htm";
const LIB_FINALS = "https://rsssf.org/sacups/copalib.html";
const LIB_1997 = "https://en.wikipedia.org/wiki/1997_Copa_Libertadores_finals";
const CDB_FINALS = "https://en.wikipedia.org/wiki/Copa_do_Brasil";
const EURO_FINALS = "https://en.wikipedia.org/wiki/List_of_UEFA_European_Championship_finals";
const UCL_FINALS = "https://en.wikipedia.org/wiki/List_of_European_Cup_and_UEFA_Champions_League_finals";
const CA_FINALS = "https://en.wikipedia.org/wiki/List_of_Copa_Am%C3%A9rica_finals";
const CA_2004 = "https://www.11v11.com/matches/argentina-v-brazil-25-july-2004-253528/";
const WC_1994_FINAL = "https://www.cbf.com.br/selecao-brasileira/noticias/noticias-selecao-masculina/a/ha-31-anos-brasil-encerrava-o-jejum-e-se-sagrava-tetracampeao-mundial";

export const batch006: BankQuestion[] = [
  // ---------- FACIL (19) ----------
  q("b6-f-01", "jogadores", "facil", "Por qual selecao o atacante Gareth Bale jogou?", "Pais de Gales", { acceptedAnswers: ["gales"], explanation: "Bale e o maior artilheiro da historia de Pais de Gales.", sourceUrl: UEFA_EURO }),
  q("b6-f-02", "jogadores", "facil", "Por qual selecao o meia Pedri joga?", "Espanha", { explanation: "Pedri foi campeao da Eurocopa de 2024 com a Espanha.", sourceUrl: UEFA_EURO }),
  q("b6-f-03", "jogadores", "facil", "Por qual selecao o meia Jude Bellingham joga?", "Inglaterra", { explanation: "Bellingham e titular da Inglaterra desde a adolescencia.", sourceUrl: UEFA_EURO }),
  q("b6-f-04", "jogadores", "facil", "Por qual selecao o atacante Thomas Muller jogou?", "Alemanha", { explanation: "Thomas Muller foi campeao do mundo com a Alemanha em 2014.", sourceUrl: FIFA }),
  q("b6-f-05", "jogadores", "facil", "Por qual selecao o atacante Lautaro Martinez joga?", "Argentina", { explanation: "Lautaro foi campeao do mundo com a Argentina em 2022.", sourceUrl: FIFA }),
  q("b6-f-06", "jogadores", "facil", "Por qual selecao o meia Federico Valverde joga?", "Uruguai", { explanation: "Valverde e um dos lideres da selecao uruguaia.", sourceUrl: FIFA }),
  q("b6-f-07", "jogadores", "facil", "Por qual selecao o meia Christian Pulisic joga?", "Estados Unidos", { acceptedAnswers: ["eua"], explanation: "Pulisic e o principal jogador da selecao americana.", sourceUrl: FIFA }),
  q("b6-f-08", "jogadores", "facil", "Por qual selecao o lateral Achraf Hakimi joga?", "Marrocos", { explanation: "Hakimi foi titular do Marrocos semifinalista da Copa de 2022.", sourceUrl: FIFA }),
  q("b6-f-09", "clubes", "facil", "Em que cidade fica o estadio Old Trafford?", "Manchester", { explanation: "Old Trafford e a casa do Manchester United.", sourceUrl: PL }),
  q("b6-f-10", "futebol_brasileiro", "facil", "Em que cidade jogam Avai e Figueirense?", "Florianopolis", { explanation: "Avai x Figueirense e o classico da capital catarinense.", sourceUrl: CBF }),
  q("b6-f-11", "jogadores", "facil", "Qual craque argentino era chamado de \"El Pibe de Oro\"?", "Diego Maradona", { acceptedAnswers: ["maradona"], explanation: "O apelido significa \"o menino de ouro\".", sourceUrl: FIFA }),
  q("b6-f-12", "clubes", "facil", "Em que cidade fica o clube Paris Saint-Germain?", "Paris", { explanation: "O PSG manda seus jogos no Parque dos Principes, em Paris.", sourceUrl: UEFA_CL }),
  q("b6-f-13", "futebol_brasileiro", "facil", "Quais sao as cores tradicionais do Corinthians?", "Preto e branco", { acceptedAnswers: ["alvinegro", "branco e preto"], explanation: "O Corinthians e o Alvinegro do Parque Sao Jorge.", sourceUrl: CBF }),
  q("b6-f-14", "futebol_brasileiro", "facil", "Quais sao as cores tradicionais do Palmeiras?", "Verde e branco", { acceptedAnswers: ["alviverde", "branco e verde"], explanation: "O Palmeiras e o Alviverde paulista.", sourceUrl: CBF }),
  q("b6-f-15", "futebol_brasileiro", "facil", "Quais sao as cores tradicionais do Cruzeiro?", "Azul e branco", { acceptedAnswers: ["branco e azul"], explanation: "O Cruzeiro joga de azul com as estrelas do Cruzeiro do Sul no escudo.", sourceUrl: CBF }),
  q("b6-f-16", "futebol_brasileiro", "facil", "Quais sao as cores tradicionais do Internacional?", "Vermelho e branco", { acceptedAnswers: ["branco e vermelho"], explanation: "O Inter e o Colorado, de camisa vermelha.", sourceUrl: CBF }),
  q("b6-f-17", "jogadores", "facil", "Por qual selecao o atacante Victor Osimhen joga?", "Nigeria", { explanation: "Osimhen e o principal atacante da Nigeria.", sourceUrl: FIFA }),
  q("b6-f-18", "futebol_brasileiro", "facil", "Qual clube brasileiro tem o urubu como mascote?", "Flamengo", { acceptedAnswers: ["mengao"], explanation: "O urubu virou simbolo da torcida rubro-negra.", sourceUrl: CBF }),
  q("b6-f-19", "futebol_brasileiro", "facil", "Qual clube paulista tem o \"Santo Paulo\" como mascote?", "Sao Paulo", { acceptedAnswers: ["sao paulo fc", "spfc"], explanation: "O mascote faz referencia ao nome do clube.", sourceUrl: CBF }),

  // ---------- MODERADO (19) ----------
  q("b6-mo-01", "copa_do_mundo", "moderado", "Alem de Portugal e Marrocos, qual pais vai sediar a Copa do Mundo de 2030?", "Espanha", { explanation: "A Copa de 2030 tera sedes em tres paises, alem de jogos comemorativos na America do Sul.", sourceUrl: FIFA, seasonRef: "2030" }),
  q("b6-mo-02", "clubes", "moderado", "Em que pais fica o clube Club Brugge?", "Belgica", { explanation: "O Club Brugge e da cidade de Bruges, na Belgica.", sourceUrl: UEFA_CL }),
  q("b6-mo-03", "clubes", "moderado", "Em que pais fica o clube Shakhtar Donetsk?", "Ucrania", { explanation: "O Shakhtar ficou famoso por contratar muitos brasileiros.", sourceUrl: UEFA_CL }),
  q("b6-mo-04", "clubes", "moderado", "Em que pais fica o clube Al-Ahly, do Cairo?", "Egito", { explanation: "O Al-Ahly e um dos clubes mais vitoriosos da Africa.", sourceUrl: FIFA_CWC }),
  q("b6-mo-05", "futebol_brasileiro", "moderado", "Em que cidade jogam CSA e CRB?", "Maceio", { explanation: "CSA x CRB e o classico da capital alagoana.", sourceUrl: CBF }),
  q("b6-mo-06", "futebol_brasileiro", "moderado", "Em que cidade jogam ABC e America, rivais do \"Classico-Rei\" potiguar?", "Natal", { explanation: "ABC e America sao os dois grandes da capital do Rio Grande do Norte.", sourceUrl: CBF }),
  q("b6-mo-07", "jogadores", "moderado", "Qual atacante uruguaio e conhecido como \"El Pistolero\"?", "Luis Suarez", { acceptedAnswers: ["suarez"], explanation: "O apelido vem da comemoracao de gol imitando pistolas.", sourceUrl: UEFA_CL }),
  q("b6-mo-08", "futebol_brasileiro", "moderado", "Qual clube foi campeao brasileiro em 2015?", "Corinthians", { acceptedAnswers: ["timao"], explanation: "O Corinthians de Tite venceu o Brasileirao de 2015.", sourceUrl: CBF, seasonRef: "2015" }),
  q("b6-mo-09", "futebol_brasileiro", "moderado", "Qual clube foi campeao brasileiro em 2018?", "Palmeiras", { acceptedAnswers: ["verdao"], explanation: "O Palmeiras de Felipao arrancou no returno e foi campeao em 2018.", sourceUrl: CBF, seasonRef: "2018" }),
  q("b6-mo-10", "futebol_brasileiro", "moderado", "Qual clube venceu a Copa do Brasil de 2016, derrotando o Atletico Mineiro na final?", "Gremio", { acceptedAnswers: ["imortal"], explanation: "Foi o quinto titulo de Copa do Brasil do Gremio.", sourceUrl: CBF_CDB, seasonRef: "2016" }),
  q("b6-mo-11", "futebol_brasileiro", "moderado", "Qual clube venceu a Copa do Brasil de 2013, derrotando o Athletico Paranaense na final?", "Flamengo", { acceptedAnswers: ["mengao"], explanation: "A final de volta foi no Maracana recem-reformado.", sourceUrl: CBF_CDB, seasonRef: "2013" }),
  q("b6-mo-12", "futebol_europeu", "moderado", "Qual clube espanhol venceu a Liga Europa de 2023, batendo a Roma nos penaltis?", "Sevilla", { acceptedAnswers: ["sevilha"], explanation: "A final foi disputada em Budapeste.", sourceUrl: UEFA_EL, seasonRef: "2022-23" }),
  q("b6-mo-13", "champions_league", "moderado", "Qual clube venceu a Liga dos Campeoes de 2006, derrotando o Arsenal na final em Paris?", "Barcelona", { acceptedAnswers: ["fc barcelona", "barca"], explanation: "O Barcelona de Ronaldinho virou para 2 a 1.", sourceUrl: UEFA_CL, seasonRef: "2005-06" }),
  q("b6-mo-14", "champions_league", "moderado", "Qual clube venceu a Liga dos Campeoes de 2007, se vingando do Liverpool na final de Atenas?", "Milan", { acceptedAnswers: ["ac milan"], explanation: "O Milan venceu por 2 a 1, dois anos depois de perder a final de Istambul.", sourceUrl: UEFA_CL, seasonRef: "2006-07" }),
  q("b6-mo-15", "champions_league", "moderado", "Qual atacante brasileiro marcou o terceiro gol do Barcelona na final da Liga dos Campeoes de 2015?", "Neymar", { acceptedAnswers: ["neymar jr"], explanation: "Neymar fechou o 3 a 1 sobre a Juventus em Berlim.", sourceUrl: UEFA_CL, seasonRef: "2014-15" }),
  q("b6-mo-16", "selecoes", "moderado", "Qual lateral foi o capitao do Brasil campeao da Copa America de 2019?", "Daniel Alves", { acceptedAnswers: ["dani alves"], explanation: "Daniel Alves tambem foi eleito o melhor jogador daquela Copa America.", sourceUrl: COPA_AMERICA, seasonRef: "2019" }),
  q("b6-mo-17", "selecoes", "moderado", "Qual goleiro foi o titular do Brasil no tetracampeonato de 1994?", "Taffarel", { acceptedAnswers: ["claudio taffarel"], explanation: "Taffarel defendeu o penalti de Massaro na final.", sourceUrl: FIFA, seasonRef: "1994" }),
  q("b6-mo-18", "selecoes", "moderado", "Qual goleiro foi o titular do Brasil nas Copas do Mundo de 2018 e 2022?", "Alisson", { acceptedAnswers: ["alisson becker"], explanation: "Alisson tambem foi campeao da Champions pelo Liverpool em 2019.", sourceUrl: FIFA }),
  q("b6-mo-19", "champions_league", "moderado", "Qual tecnico espanhol comandou o Barcelona campeao da Liga dos Campeoes de 2015?", "Luis Enrique", { explanation: "Luis Enrique conquistou a triplice coroa com o trio Messi, Suarez e Neymar.", sourceUrl: UEFA_CL, seasonRef: "2014-15" }),

  // ---------- MEDIO (19) ----------
  q("b6-me-01", "futebol_brasileiro", "medio", "Qual tecnico, idolo do clube como jogador, comandou o Flamengo campeao brasileiro de 2009?", "Andrade", { acceptedAnswers: ["jorge luis andrade"], explanation: "Andrade, volante do time de Zico, assumiu como interino e foi campeao.", sourceUrl: CBF, seasonRef: "2009" }),
  q("b6-me-02", "futebol_brasileiro", "medio", "Qual tecnico comandou o Sao Paulo tricampeao brasileiro seguido em 2006, 2007 e 2008?", "Muricy Ramalho", { acceptedAnswers: ["muricy"], explanation: "Muricy foi o tecnico das tres conquistas seguidas.", sourceUrl: CBF, seasonRef: "2006-2008" }),
  q("b6-me-03", "futebol_brasileiro", "medio", "Qual tecnico comandou o Flamengo campeao brasileiro de 2020?", "Rogerio Ceni", { acceptedAnswers: ["ceni"], explanation: "Ceni assumiu no meio da temporada e confirmou o bi.", sourceUrl: CBF, seasonRef: "2020" }),
  q("b6-me-04", "futebol_brasileiro", "medio", "Qual tecnico comandou o Santos campeao brasileiro de 2004?", "Vanderlei Luxemburgo", { acceptedAnswers: ["luxemburgo", "wanderley luxemburgo"], explanation: "Luxemburgo ja tinha sido campeao brasileiro por Palmeiras e Corinthians.", sourceUrl: CBF, seasonRef: "2004" }),
  q("b6-me-05", "futebol_brasileiro", "medio", "Qual atacante do Gremio foi o artilheiro do Brasileirao de 2010, com 23 gols?", "Jonas", { acceptedAnswers: ["jonas goncalves"], explanation: "Jonas depois foi idolo no Benfica.", sourceUrl: BR_TOPS, seasonRef: "2010" }),
  q("b6-me-06", "futebol_brasileiro", "medio", "Qual atacante do Santos foi o artilheiro do Brasileirao de 2011, com 23 gols?", "Borges", { explanation: "Borges foi artilheiro no ano do titulo da Libertadores do Santos.", sourceUrl: BR_TOPS, seasonRef: "2011" }),
  q("b6-me-07", "futebol_brasileiro", "medio", "Qual centroavante do Fluminense foi o artilheiro do Brasileirao de 2012, ano do titulo tricolor?", "Fred", { acceptedAnswers: ["frederico chaves guedes"], explanation: "Fred fez 20 gols e repetiu a artilharia em 2014.", sourceUrl: BR_TOPS, seasonRef: "2012" }),
  q("b6-me-08", "futebol_brasileiro", "medio", "Qual atacante do Athletico Paranaense foi o artilheiro do Brasileirao de 2013, com 21 gols?", "Ederson", { explanation: "Ederson levou o Furacao a uma vaga na Libertadores.", sourceUrl: BR_TOPS, seasonRef: "2013" }),
  q("b6-me-09", "futebol_brasileiro", "medio", "Qual atacante do Santos foi o artilheiro do Brasileirao de 2015, com 20 gols?", "Ricardo Oliveira", { explanation: "Ricardo Oliveira foi artilheiro aos 35 anos.", sourceUrl: BR_TOPS, seasonRef: "2015" }),
  q("b6-me-10", "futebol_brasileiro", "medio", "Qual atacante do Atletico Mineiro foi o artilheiro do Brasileirao de 2021, ano do titulo do Galo?", "Hulk", { acceptedAnswers: ["givanildo vieira de sousa"], explanation: "Hulk fez 19 gols na campanha do titulo.", sourceUrl: BR_TOPS, seasonRef: "2021" }),
  q("b6-me-11", "competicoes_internacionais", "medio", "Qual clube brasileiro venceu a Copa Sul-Americana de 2012, contra o Tigre da Argentina?", "Sao Paulo", { acceptedAnswers: ["sao paulo fc", "spfc"], explanation: "O Tigre nao voltou para o segundo tempo da final no Morumbi.", sourceUrl: CONMEBOL_SUD, seasonRef: "2012" }),
  q("b6-me-12", "competicoes_internacionais", "medio", "Qual clube brasileiro venceu a Copa Sul-Americana em 2018 e em 2021?", "Athletico Paranaense", { acceptedAnswers: ["athletico", "athletico-pr", "atletico paranaense", "furacao"], explanation: "O Athletico bateu o Junior Barranquilla em 2018 e o Red Bull Bragantino em 2021.", sourceUrl: CONMEBOL_SUD, seasonRef: "2018-2021" }),
  q("b6-me-13", "competicoes_internacionais", "medio", "Qual clube brasileiro recebeu o titulo da Copa Sul-Americana de 2016, apos a tragedia aerea antes da final?", "Chapecoense", { acceptedAnswers: ["chape"], explanation: "O titulo foi concedido pela CONMEBOL a pedido do Atletico Nacional.", sourceUrl: CONMEBOL_SUD, seasonRef: "2016" }),
  q("b6-me-14", "selecoes", "medio", "Qual selecao venceu a Copa da Asia de 2023, disputada em casa?", "Catar", { acceptedAnswers: ["qatar"], explanation: "O Catar foi bicampeao asiatico seguido.", sourceUrl: AFC, seasonRef: "2023" }),
  q("b6-me-15", "futebol_europeu", "medio", "Qual selecao perdeu para a Espanha a final da Eurocopa de 2024, em Berlim?", "Inglaterra", { explanation: "A Espanha venceu por 2 a 1 e se tornou a maior campea da Euro.", sourceUrl: EURO_FINALS, seasonRef: "2024" }),
  q("b6-me-16", "competicoes_internacionais", "medio", "Qual selecao perdeu para a Argentina, na prorrogacao, a final da Copa America de 2024?", "Colombia", { explanation: "Lautaro Martinez marcou o gol do titulo argentino em Miami.", sourceUrl: CA_FINALS, seasonRef: "2024" }),
  q("b6-me-17", "copa_do_mundo", "medio", "Qual selecao venceu a Alemanha por 2 a 0 e a eliminou na fase de grupos da Copa do Mundo de 2018?", "Coreia do Sul", { acceptedAnswers: ["coreia"], explanation: "Foi a primeira vez que a Alemanha caiu na primeira fase desde 1938.", sourceUrl: FIFA, seasonRef: "2018" }),
  q("b6-me-18", "copa_do_mundo", "medio", "Qual selecao venceu a Argentina por 2 a 1 na estreia da Copa do Mundo de 2022?", "Arabia Saudita", { explanation: "A zebra nao impediu a Argentina de ser campea no fim.", sourceUrl: FIFA, seasonRef: "2022" }),
  q("b6-me-19", "competicoes_internacionais", "medio", "Qual clube ingles venceu o primeiro Mundial de Clubes no novo formato, em 2025, batendo o PSG na final?", "Chelsea", { explanation: "O Chelsea venceu o PSG por 3 a 0 em Nova Jersey.", sourceUrl: FIFA_CWC, seasonRef: "2025" }),

  // ---------- DIFICIL (19) ----------
  q("b6-d-01", "libertadores", "dificil", "Em que cidade foi disputado o jogo de volta da final da Libertadores de 2018, entre River Plate e Boca Juniors?", "Madri", { acceptedAnswers: ["madrid"], explanation: "Apos o ataque ao onibus do Boca, o jogo foi levado ao Santiago Bernabeu; o River venceu por 3 a 1.", sourceUrl: LIB_FINALS, seasonRef: "2018" }),
  q("b6-d-02", "libertadores", "dificil", "Quem marcou o gol do Cruzeiro na vitoria por 1 a 0 sobre o Sporting Cristal, na final da Libertadores de 1997?", "Elivelton", { explanation: "Elivelton marcou aos 75 minutos no Mineirao, depois de 0 a 0 em Lima.", sourceUrl: LIB_1997, seasonRef: "1997" }),
  q("b6-d-03", "libertadores", "dificil", "Por qual placar o Sao Paulo venceu o Atletico Paranaense no jogo de volta da final da Libertadores de 2005?", "4 a 0", { acceptedAnswers: ["4x0", "4-0"], explanation: "Depois do 1 a 1 na ida, o Sao Paulo goleou no Morumbi.", sourceUrl: LIB_FINALS, seasonRef: "2005" }),
  q("b6-d-04", "libertadores", "dificil", "Qual clube mexicano perdeu para o Internacional a final da Libertadores de 2010?", "Guadalajara", { acceptedAnswers: ["chivas", "chivas guadalajara"], explanation: "O Inter venceu os dois jogos: 2 a 1 no Mexico e 3 a 2 no Beira-Rio.", sourceUrl: LIB_FINALS, seasonRef: "2010" }),
  q("b6-d-05", "libertadores", "dificil", "Qual clube brasileiro perdeu para o Boca Juniors, nos penaltis, a final da Libertadores de 2000?", "Palmeiras", { acceptedAnswers: ["verdao"], explanation: "Apos 2 a 2 e 0 a 0, o Boca venceu nos penaltis no Morumbi.", sourceUrl: LIB_FINALS, seasonRef: "2000" }),
  q("b6-d-06", "libertadores", "dificil", "Qual clube paulista perdeu para o Olimpia, nos penaltis, a final da Libertadores de 2002?", "Sao Caetano", { acceptedAnswers: ["ad sao caetano", "azulao"], explanation: "O Sao Caetano venceu a ida no Paraguai, mas perdeu a volta e os penaltis.", sourceUrl: LIB_FINALS, seasonRef: "2002" }),
  q("b6-d-07", "libertadores", "dificil", "Qual clube argentino perdeu para o Sao Paulo, nos penaltis, a final da Libertadores de 1992?", "Newell's Old Boys", { acceptedAnswers: ["newells", "newell's"], explanation: "Cada time venceu por 1 a 0 em casa e o Sao Paulo levou nos penaltis.", sourceUrl: LIB_FINALS, seasonRef: "1992" }),
  q("b6-d-08", "copa_do_mundo", "dificil", "Qual zagueiro brasileiro teve o penalti defendido por Pagliuca na decisao da final da Copa do Mundo de 1994?", "Marcio Santos", { explanation: "Mesmo com o erro, o Brasil venceu a disputa por 3 a 2.", sourceUrl: WC_1994_FINAL, seasonRef: "1994" }),
  q("b6-d-09", "competicoes_internacionais", "dificil", "Quem marcou o gol de empate do Brasil nos acrescimos da final da Copa America de 2004, contra a Argentina?", "Adriano", { acceptedAnswers: ["adriano imperador"], explanation: "O 2 a 2 levou aos penaltis, e o Brasil venceu por 4 a 2 em Lima.", sourceUrl: CA_2004, seasonRef: "2004" }),
  q("b6-d-10", "futebol_europeu", "dificil", "Qual foi o placar da final da Eurocopa de 2012, Espanha contra Italia?", "4 a 0", { acceptedAnswers: ["4x0", "4-0"], explanation: "A Espanha goleou em Kiev e foi bicampea europeia seguida.", sourceUrl: EURO_FINALS, seasonRef: "2012" }),
  q("b6-d-11", "futebol_europeu", "dificil", "Qual foi o placar da final da Eurocopa de 2020, Italia contra Inglaterra, antes da disputa de penaltis?", "1 a 1", { acceptedAnswers: ["1x1", "1-1"], explanation: "A Italia venceu nos penaltis por 3 a 2 em Wembley.", sourceUrl: EURO_FINALS, seasonRef: "2020" }),
  q("b6-d-12", "champions_league", "dificil", "Qual foi o placar da final da Liga dos Campeoes de 2005, Liverpool contra Milan, antes dos penaltis?", "3 a 3", { acceptedAnswers: ["3x3", "3-3"], explanation: "O Milan fez 3 a 0 no primeiro tempo e o Liverpool empatou em seis minutos.", sourceUrl: UCL_FINALS, seasonRef: "2004-05" }),
  q("b6-d-13", "champions_league", "dificil", "Qual foi o placar da final da Liga dos Campeoes de 1994, Milan contra Barcelona, em Atenas?", "4 a 0", { acceptedAnswers: ["4x0", "4-0"], explanation: "O Milan de Capello atropelou o Dream Team de Cruyff.", sourceUrl: UCL_FINALS, seasonRef: "1993-94" }),
  q("b6-d-14", "competicoes_internacionais", "dificil", "Qual foi o placar da final da Copa America de 2019, Brasil contra Peru, no Maracana?", "3 a 1", { acceptedAnswers: ["3x1", "3-1"], explanation: "O Brasil voltou a ganhar a Copa America depois de 12 anos.", sourceUrl: CA_FINALS, seasonRef: "2019" }),
  q("b6-d-15", "champions_league", "dificil", "Qual foi o placar da final espanhola da Liga dos Campeoes de 2000, Real Madrid contra Valencia?", "3 a 0", { acceptedAnswers: ["3x0", "3-0"], explanation: "A final foi disputada no Stade de France, em Saint-Denis.", sourceUrl: UCL_FINALS, seasonRef: "1999-2000" }),
  q("b6-d-16", "futebol_europeu", "dificil", "Qual selecao perdeu nos penaltis para a Tchecoslovaquia a final da Eurocopa de 1976?", "Alemanha Ocidental", { acceptedAnswers: ["alemanha"], explanation: "A final de Belgrado terminou 2 a 2 e os tchecos venceram por 5 a 3 nos penaltis.", sourceUrl: EURO_FINALS, seasonRef: "1976" }),
  q("b6-d-17", "futebol_europeu", "dificil", "Em que cidade foi disputada a final da Eurocopa de 1988, Holanda contra Uniao Sovietica?", "Munique", { acceptedAnswers: ["munich", "munchen"], explanation: "A Holanda venceu por 2 a 0 no Estadio Olimpico de Munique.", sourceUrl: EURO_FINALS, seasonRef: "1988" }),
  q("b6-d-18", "champions_league", "dificil", "Em que cidade foi disputada a final da Liga dos Campeoes de 2008, Manchester United contra Chelsea?", "Moscou", { acceptedAnswers: ["moscow", "moskva"], explanation: "O United venceu nos penaltis no Estadio Luzhniki.", sourceUrl: UCL_FINALS, seasonRef: "2007-08" }),
  q("b6-d-19", "libertadores", "dificil", "Qual clube o Internacional derrotou na final da Libertadores de 2006?", "Sao Paulo", { acceptedAnswers: ["sao paulo fc", "spfc"], explanation: "O Inter venceu por 2 a 1 no Morumbi e empatou em 2 a 2 no Beira-Rio.", sourceUrl: LIB_FINALS, seasonRef: "2006" }),

  // ---------- IMPOSSIVEL (24) ----------
  q("b6-i-01", "futebol_brasileiro", "impossivel", "Qual atacante do Bahia foi o artilheiro da primeira Taca Brasil, em 1959?", "Lao", { explanation: "Lao fez 9 gols na campanha do primeiro titulo nacional do Bahia.", sourceUrl: BR_TOPS, seasonRef: "1959" }),
  q("b6-i-02", "futebol_brasileiro", "impossivel", "Qual atacante do Confianca, de Sergipe, foi o artilheiro da Taca Brasil de 1963?", "Ruiter", { explanation: "Ruiter fez 9 gols pelo clube de Aracaju.", sourceUrl: BR_TOPS, seasonRef: "1963" }),
  q("b6-i-03", "futebol_brasileiro", "impossivel", "Qual atacante do Santos foi o artilheiro do Torneio Roberto Gomes Pedrosa de 1968, com 18 gols?", "Toninho Guerreiro", { acceptedAnswers: ["toninho"], explanation: "Toninho Guerreiro foi artilheiro no ano do titulo santista.", sourceUrl: BR_TOPS, seasonRef: "1968" }),
  q("b6-i-04", "futebol_brasileiro", "impossivel", "Qual craque do Cruzeiro foi o artilheiro do Torneio Roberto Gomes Pedrosa de 1970, ano do tri mundial?", "Tostao", { acceptedAnswers: ["eduardo goncalves de andrade"], explanation: "Tostao fez 12 gols no Robertao de 1970.", sourceUrl: BR_TOPS, seasonRef: "1970" }),
  q("b6-i-05", "futebol_brasileiro", "impossivel", "Qual atacante do Internacional foi o artilheiro do Brasileirao de 1975, ano do primeiro titulo colorado?", "Flavio", { explanation: "Flavio fez 16 gols na campanha do titulo.", sourceUrl: BR_TOPS, seasonRef: "1975" }),
  q("b6-i-06", "futebol_brasileiro", "impossivel", "Qual atacante do Vasco foi o artilheiro do Brasileirao de 1978, com 19 gols?", "Paulinho", { acceptedAnswers: ["paulinho"], explanation: "Paulinho foi o goleador do campeonato vencido pelo Guarani.", sourceUrl: BR_TOPS, seasonRef: "1978" }),
  q("b6-i-07", "futebol_brasileiro", "impossivel", "Qual atacante do America-RJ foi o artilheiro do Brasileirao de 1979?", "Cesar", { explanation: "Cesar fez 13 gols pelo America no ano do titulo do Internacional.", sourceUrl: BR_TOPS, seasonRef: "1979" }),
  q("b6-i-08", "futebol_brasileiro", "impossivel", "Qual atacante do Guarani foi o artilheiro do Brasileirao de 1985, com 20 gols?", "Edmar", { explanation: "Edmar foi o goleador do campeonato vencido pelo Coritiba.", sourceUrl: BR_TOPS, seasonRef: "1985" }),
  q("b6-i-09", "futebol_brasileiro", "impossivel", "Qual atacante do Santos foi o artilheiro do Brasileirao de 1998, com 21 gols?", "Viola", { acceptedAnswers: ["paulo sergio rosa"], explanation: "Viola foi o goleador do campeonato vencido pelo Corinthians.", sourceUrl: BR_TOPS, seasonRef: "1998" }),
  q("b6-i-10", "futebol_brasileiro", "impossivel", "Qual atacante do Vasco, ja com 35 anos, foi o artilheiro do Brasileirao de 2001, com 21 gols?", "Romario", { acceptedAnswers: ["romario de souza faria", "baixinho"], explanation: "Romario ainda repetiria a artilharia em 2005.", sourceUrl: BR_TOPS, seasonRef: "2001" }),
  q("b6-i-11", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Santos pentacampeao seguido da Taca Brasil, de 1961 a 1965?", "Lula", { acceptedAnswers: ["luis alonso perez", "luiz alonso perez"], explanation: "Lula foi o tecnico do Santos de Pele na era de ouro.", sourceUrl: BR_COACHES, seasonRef: "1961-1965" }),
  q("b6-i-12", "futebol_brasileiro", "impossivel", "Qual futuro tecnico tricampeao do mundo comandou o Botafogo campeao da Taca Brasil de 1968?", "Zagallo", { acceptedAnswers: ["mario zagallo", "mario jorge lobo zagallo"], explanation: "Dois anos depois, Zagallo seria campeao mundial como tecnico no Mexico.", sourceUrl: BR_COACHES, seasonRef: "1968" }),
  q("b6-i-13", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Santos campeao do Torneio Roberto Gomes Pedrosa de 1968?", "Antoninho", { explanation: "O titulo e reconhecido pela CBF como Campeonato Brasileiro.", sourceUrl: BR_COACHES, seasonRef: "1968" }),
  q("b6-i-14", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Vasco campeao brasileiro de 1989?", "Nelsinho Rosa", { acceptedAnswers: ["nelsinho"], explanation: "O Vasco venceu o Sao Paulo na decisao, no Morumbi.", sourceUrl: BR_COACHES, seasonRef: "1989" }),
  q("b6-i-15", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Flamengo campeao brasileiro de 1992?", "Carlinhos", { acceptedAnswers: ["carlinhos violino"], explanation: "Carlinhos, idolo rubro-negro como jogador, venceu o Botafogo na final.", sourceUrl: BR_COACHES, seasonRef: "1992" }),
  q("b6-i-16", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Santos campeao brasileiro de 2002, o time de Diego e Robinho?", "Emerson Leao", { acceptedAnswers: ["leao"], explanation: "Leao, ex-goleiro da selecao, encerrou o jejum santista de titulos nacionais.", sourceUrl: BR_COACHES, seasonRef: "2002" }),
  q("b6-i-17", "libertadores", "impossivel", "Em que cidade o Independiente venceu o Penarol no jogo-desempate da final da Libertadores de 1965?", "Santiago", { acceptedAnswers: ["santiago do chile", "santiago de chile"], explanation: "O Independiente venceu por 4 a 1 e foi bicampeao seguido.", sourceUrl: LIB_FINALS, seasonRef: "1965" }),
  q("b6-i-18", "libertadores", "impossivel", "Qual clube argentino perdeu para o Penarol, na prorrogacao do jogo-desempate, a final da Libertadores de 1966?", "River Plate", { acceptedAnswers: ["river"], explanation: "O Penarol venceu por 4 a 2 em Santiago.", sourceUrl: LIB_FINALS, seasonRef: "1966" }),
  q("b6-i-19", "libertadores", "impossivel", "Em que cidade o Nacional (URU) venceu o Estudiantes no jogo-desempate da final da Libertadores de 1971?", "Lima", { explanation: "O Nacional venceu por 2 a 0 e conquistou sua primeira Libertadores.", sourceUrl: LIB_FINALS, seasonRef: "1971" }),
  q("b6-i-20", "libertadores", "impossivel", "Qual clube chileno perdeu para o Sao Paulo a final da Libertadores de 1993?", "Universidad Catolica", { acceptedAnswers: ["catolica"], explanation: "O Sao Paulo fez 5 a 1 no Morumbi e perdeu a volta por 2 a 0.", sourceUrl: LIB_FINALS, seasonRef: "1993" }),
  q("b6-i-21", "libertadores", "impossivel", "Qual clube colombiano perdeu para o Gremio a final da Libertadores de 1995?", "Atletico Nacional", { acceptedAnswers: ["nacional de medellin"], explanation: "O Gremio venceu por 3 a 1 em casa e empatou em 1 a 1 em Medellin.", sourceUrl: LIB_FINALS, seasonRef: "1995" }),
  q("b6-i-22", "libertadores", "impossivel", "Qual clube equatoriano perdeu para o Olimpia a final da Libertadores de 1990?", "Barcelona de Guayaquil", { acceptedAnswers: ["barcelona", "barcelona sc"], explanation: "O Olimpia venceu por 2 a 0 em Assuncao e empatou em 1 a 1 em Guayaquil.", sourceUrl: LIB_FINALS, seasonRef: "1990" }),
  q("b6-i-23", "futebol_brasileiro", "impossivel", "Qual clube goiano perdeu para o Flamengo a final da Copa do Brasil de 1990?", "Goias", { explanation: "Foi o primeiro titulo de Copa do Brasil do Flamengo.", sourceUrl: CDB_FINALS, seasonRef: "1990" }),
  q("b6-i-24", "futebol_brasileiro", "impossivel", "Qual clube pernambucano venceu a Copa do Brasil de 2008, derrotando o Corinthians na final?", "Sport", { acceptedAnswers: ["sport recife", "sport club do recife"], explanation: "O Sport venceu por 2 a 0 na Ilha do Retiro e levou pelo gol fora de casa.", sourceUrl: CDB_FINALS, seasonRef: "2008" }),
];
