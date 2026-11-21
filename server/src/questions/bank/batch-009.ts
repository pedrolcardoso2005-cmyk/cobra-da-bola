// Question bank, batch 009 (100 questions: 19 facil, 19 moderado, 19 medio,
// 19 dificil, 24 impossivel). Same format/loader/idempotency pattern as
// batch-003.ts -- see server/src/questions/bank/PROGRESS.md.
//
// Written by hand (no AI pipeline). Checked against the full text of seed.ts
// and batches 001-008 so no fact is asked again, in either direction. Every
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
const UEFA_CL = "https://www.uefa.com/uefachampionsleague/history/";
const UEFA_EL = "https://www.uefa.com/uefaeuropaleague/history/";
const UEFA_BDO = "https://www.uefa.com/ballondor/";
const CONMEBOL = "https://www.conmebol.com/libertadores/";
const CBF = "https://www.cbf.com.br/futebol-brasileiro/competicoes/campeonato-brasileiro-serie-a";
const PL = "https://www.premierleague.com/history";
const BUNDESLIGA = "https://www.bundesliga.com/en/bundesliga/history";
const LIGUE1 = "https://www.ligue1.com/";
const SERIEA = "https://www.legaseriea.it/en";

// Sources actually used to verify the dificil/impossivel entries.
const BALLON = "https://en.wikipedia.org/wiki/Ballon_d%27Or";
const BALLON_RSSSF = "https://rsssf.org/miscellaneous/europa-poy.html";
const EURO_TOPS = "https://www.uefa.com/uefaeuro/history/news/0259-0e6c1891bd10-d54f17cfd501-1000--euro-top-scorers-all-time-and-for-every-tournament/";
const EURO_ARTICLE = "https://en.wikipedia.org/wiki/UEFA_European_Championship";
const WC_BIG_WINS = "https://theanalyst.com/articles/the-biggest-world-cup-wins";
const WC_FORMAT = "https://www.lance.com.br/lancepedia/numero-de-times-de-cada-copa-do-mundo.html";
const WC_MILLA = "https://www.guinnessworldrecords.com/world-records/oldest-goalscorer-in-a-football-(soccer)-fifa-world-cup";

export const batch009: BankQuestion[] = [
  // ---------- FACIL (19) ----------
  q("b9-f-01", "clubes", "facil", "Em que pais fica o clube Lyon?", "Franca", { explanation: "O Olympique Lyonnais e um dos maiores clubes franceses.", sourceUrl: LIGUE1 }),
  q("b9-f-02", "clubes", "facil", "Em que pais fica o clube Dinamo Zagreb?", "Croacia", { explanation: "O Dinamo e da capital croata, Zagreb.", sourceUrl: UEFA_CL }),
  q("b9-f-03", "clubes", "facil", "Em que pais fica o clube Slavia Praga?", "Republica Tcheca", { acceptedAnswers: ["tchequia", "chequia"], explanation: "O Slavia e de Praga, capital tcheca.", sourceUrl: UEFA_CL }),
  q("b9-f-04", "clubes", "facil", "Em que pais fica o clube Legia Varsovia?", "Polonia", { explanation: "O Legia e da capital polonesa.", sourceUrl: UEFA_CL }),
  q("b9-f-05", "clubes", "facil", "Em que pais fica o clube Basel?", "Suica", { explanation: "O Basel e da cidade de Basileia.", sourceUrl: UEFA_CL }),
  q("b9-f-06", "clubes", "facil", "Em que pais fica o clube Rosenborg?", "Noruega", { explanation: "O Rosenborg e de Trondheim.", sourceUrl: UEFA_CL }),
  q("b9-f-07", "clubes", "facil", "Em que pais fica o clube Cerro Porteno?", "Paraguai", { explanation: "O Cerro Porteno e de Assuncao.", sourceUrl: CONMEBOL }),
  q("b9-f-08", "clubes", "facil", "Em que pais fica o clube Emelec?", "Equador", { explanation: "O Emelec e de Guayaquil.", sourceUrl: CONMEBOL }),
  q("b9-f-09", "clubes", "facil", "Em que pais fica o clube Alianza Lima?", "Peru", { explanation: "O Alianza e de Lima, capital peruana.", sourceUrl: CONMEBOL }),
  q("b9-f-10", "clubes", "facil", "Em que pais fica o clube Toronto FC?", "Canada", { explanation: "O Toronto FC disputa a MLS.", sourceUrl: FIFA }),
  q("b9-f-11", "clubes", "facil", "Em que pais fica o clube Ulsan HD?", "Coreia do Sul", { acceptedAnswers: ["coreia"], explanation: "O Ulsan disputa a liga sul-coreana.", sourceUrl: FIFA }),
  q("b9-f-12", "clubes", "facil", "Em que pais fica o clube Anderlecht?", "Belgica", { explanation: "O Anderlecht e de Bruxelas.", sourceUrl: UEFA_CL }),
  q("b9-f-13", "clubes", "facil", "Em que pais fica o clube Steaua Bucareste?", "Romenia", { explanation: "O Steaua e da capital romena.", sourceUrl: UEFA_CL }),
  q("b9-f-14", "clubes", "facil", "Em que pais fica o clube Ferencvaros?", "Hungria", { explanation: "O Ferencvaros e de Budapeste.", sourceUrl: UEFA_CL }),
  q("b9-f-15", "clubes", "facil", "Em que pais fica o clube Partizan?", "Servia", { explanation: "O Partizan e de Belgrado.", sourceUrl: UEFA_CL }),
  q("b9-f-16", "clubes", "facil", "Em que pais fica o clube Maccabi Tel Aviv?", "Israel", { explanation: "O Maccabi e de Tel Aviv.", sourceUrl: UEFA_CL }),
  q("b9-f-17", "clubes", "facil", "Em que pais fica o clube Al Ain?", "Emirados Arabes Unidos", { acceptedAnswers: ["emirados arabes", "emirados"], explanation: "O Al Ain foi vice do Mundial de Clubes de 2018.", sourceUrl: FIFA }),
  q("b9-f-18", "clubes", "facil", "Em que pais fica o clube Wydad Casablanca?", "Marrocos", { explanation: "O Wydad e de Casablanca.", sourceUrl: FIFA }),
  q("b9-f-19", "clubes", "facil", "Em que pais fica o clube Kaizer Chiefs?", "Africa do Sul", { explanation: "O Kaizer Chiefs e de Joanesburgo.", sourceUrl: FIFA }),

  // ---------- MODERADO (19) ----------
  q("b9-mo-01", "clubes", "moderado", "O \"Derby della Mole\", em Turim, opoe a Juventus a qual clube?", "Torino", { explanation: "A Mole Antonelliana e o simbolo da cidade de Turim.", sourceUrl: SERIEA }),
  q("b9-mo-02", "clubes", "moderado", "O \"Derby d'Italia\" opoe a Juventus a qual clube?", "Inter de Milao", { acceptedAnswers: ["inter", "internazionale"], explanation: "E o classico entre dois dos maiores campeoes italianos.", sourceUrl: SERIEA }),
  q("b9-mo-03", "clubes", "moderado", "O classico \"De Klassieker\", na Holanda, opoe o Ajax a qual clube?", "Feyenoord", { explanation: "Ajax x Feyenoord e o maior classico holandes.", sourceUrl: UEFA_CL }),
  q("b9-mo-04", "clubes", "moderado", "O \"North London Derby\" opoe o Arsenal a qual clube?", "Tottenham", { acceptedAnswers: ["tottenham hotspur", "spurs"], explanation: "E o classico do norte de Londres.", sourceUrl: PL }),
  q("b9-mo-05", "clubes", "moderado", "O \"Der Klassiker\", na Alemanha, opoe o Bayern a qual clube?", "Borussia Dortmund", { acceptedAnswers: ["dortmund", "bvb"], explanation: "Bayern x Dortmund e o maior jogo do futebol alemao atual.", sourceUrl: BUNDESLIGA }),
  q("b9-mo-06", "clubes", "moderado", "\"O Classico\" do futebol portugues opoe o Porto a qual clube?", "Benfica", { explanation: "Porto x Benfica e o maior classico de Portugal.", sourceUrl: UEFA_CL }),
  q("b9-mo-07", "clubes", "moderado", "O classico de Avellaneda opoe o Independiente a qual clube?", "Racing", { acceptedAnswers: ["racing club"], explanation: "Os estadios dos dois clubes ficam a poucos metros um do outro.", sourceUrl: CONMEBOL }),
  q("b9-mo-08", "clubes", "moderado", "O classico de Rosario opoe o Newell's Old Boys a qual clube?", "Rosario Central", { explanation: "Newell's x Central e o grande classico de Rosario.", sourceUrl: CONMEBOL }),
  q("b9-mo-09", "futebol_brasileiro", "moderado", "O \"Classico dos Gigantes\" opoe o Vasco a qual clube?", "Fluminense", { acceptedAnswers: ["flu"], explanation: "Vasco x Fluminense e um dos grandes classicos do Rio.", sourceUrl: CBF }),
  q("b9-mo-10", "futebol_brasileiro", "moderado", "O \"Classico da Saudade\" opoe o Palmeiras a qual clube?", "Santos", { acceptedAnswers: ["santos fc"], explanation: "O nome lembra os grandes duelos dos anos 60 entre os dois.", sourceUrl: CBF }),
  q("b9-mo-11", "futebol_brasileiro", "moderado", "O \"San-Sao\" opoe o Santos a qual clube?", "Sao Paulo", { acceptedAnswers: ["sao paulo fc", "spfc"], explanation: "O nome junta Santos e Sao Paulo.", sourceUrl: CBF }),
  q("b9-mo-12", "futebol_brasileiro", "moderado", "O \"Derby Paulista\" opoe o Corinthians a qual clube?", "Palmeiras", { acceptedAnswers: ["verdao"], explanation: "Corinthians x Palmeiras e o derbi mais famoso de Sao Paulo.", sourceUrl: CBF }),
  q("b9-mo-13", "futebol_brasileiro", "moderado", "O \"Classico das Multidoes\", em Recife, opoe o Sport a qual clube?", "Santa Cruz", { explanation: "O nome vem das grandes torcidas dos dois clubes.", sourceUrl: CBF }),
  q("b9-mo-14", "futebol_europeu", "moderado", "Qual clube italiano venceu a Liga Europa de 2024, batendo o Bayer Leverkusen na final?", "Atalanta", { explanation: "A Atalanta venceu por 3 a 0, com tres gols de Lookman.", sourceUrl: UEFA_EL, seasonRef: "2023-24" }),
  q("b9-mo-15", "futebol_europeu", "moderado", "Qual clube alemao venceu a Liga Europa de 2022, nos penaltis contra o Rangers?", "Eintracht Frankfurt", { acceptedAnswers: ["frankfurt", "eintracht"], explanation: "A final foi disputada em Sevilha.", sourceUrl: UEFA_EL, seasonRef: "2021-22" }),
  q("b9-mo-16", "futebol_europeu", "moderado", "Qual clube espanhol venceu a Liga Europa de 2021, nos penaltis contra o Manchester United?", "Villarreal", { explanation: "A disputa de penaltis terminou 11 a 10.", sourceUrl: UEFA_EL, seasonRef: "2020-21" }),
  q("b9-mo-17", "competicoes_nacionais", "moderado", "Qual clube quebrou a sequencia do PSG e foi campeao frances em 2020-21?", "Lille", { acceptedAnswers: ["losc", "losc lille"], explanation: "O Lille terminou um ponto a frente do PSG.", sourceUrl: LIGUE1, seasonRef: "2020-21" }),
  q("b9-mo-18", "futebol_europeu", "moderado", "Qual tecnico portugues comandou o Porto campeao da Liga Europa de 2011?", "Andre Villas-Boas", { acceptedAnswers: ["villas-boas", "villas boas"], explanation: "Villas-Boas tinha apenas 33 anos na conquista.", sourceUrl: UEFA_EL, seasonRef: "2010-11" }),
  q("b9-mo-19", "competicoes_nacionais", "moderado", "Qual tecnico italiano comandou o Napoli campeao italiano em 2022-23?", "Luciano Spalletti", { acceptedAnswers: ["spalletti"], explanation: "Foi o primeiro titulo do Napoli desde a era Maradona.", sourceUrl: SERIEA, seasonRef: "2022-23" }),

  // ---------- MEDIO (19) ----------
  q("b9-me-01", "jogadores", "medio", "Qual meia frances ganhou tres Bolas de Ouro seguidas, de 1983 a 1985?", "Michel Platini", { acceptedAnswers: ["platini"], explanation: "Platini jogava na Juventus nas tres conquistas.", sourceUrl: UEFA_BDO, seasonRef: "1983-1985" }),
  q("b9-me-02", "competicoes_nacionais", "medio", "Qual clube alemao foi o surpreendente campeao da Bundesliga 2008-09?", "Wolfsburg", { acceptedAnswers: ["vfl wolfsburg"], explanation: "O Wolfsburg de Grafite e Dzeko conquistou seu unico titulo alemao.", sourceUrl: BUNDESLIGA, seasonRef: "2008-09" }),
  q("b9-me-03", "copa_do_mundo", "medio", "Qual pais sediou a Copa do Mundo de 1954?", "Suica", { explanation: "A final foi em Berna, no Estadio Wankdorf.", sourceUrl: FIFA, seasonRef: "1954" }),
  q("b9-me-04", "copa_do_mundo", "medio", "Qual pais sediou a Copa do Mundo de 1982?", "Espanha", { explanation: "A Italia foi a campea daquela Copa.", sourceUrl: FIFA, seasonRef: "1982" }),
  q("b9-me-05", "champions_league", "medio", "Qual atacante brasileiro marcou o gol do titulo do Real Madrid na final da Liga dos Campeoes de 2022, contra o Liverpool?", "Vinicius Junior", { acceptedAnswers: ["vini jr", "vinicius", "vini"], explanation: "Vini Jr. fez o unico gol da final em Saint-Denis.", sourceUrl: UEFA_CL, seasonRef: "2021-22" }),
  q("b9-me-06", "champions_league", "medio", "Qual lateral espanhol abriu o placar de cabeca na final da Liga dos Campeoes de 2024, em Wembley?", "Dani Carvajal", { acceptedAnswers: ["carvajal"], explanation: "Carvajal marcou e Vini Jr. fechou o 2 a 0 sobre o Dortmund.", sourceUrl: UEFA_CL, seasonRef: "2023-24" }),
  q("b9-me-07", "champions_league", "medio", "Quem marcou de penalti logo aos 2 minutos da final da Liga dos Campeoes de 2019, Liverpool contra Tottenham?", "Mohamed Salah", { acceptedAnswers: ["salah"], explanation: "Origi fechou o 2 a 0 no fim do jogo.", sourceUrl: UEFA_CL, seasonRef: "2018-19" }),
  q("b9-me-08", "champions_league", "medio", "Qual atacante marcou um gol de bicicleta na final da Liga dos Campeoes de 2018, contra o Liverpool?", "Gareth Bale", { acceptedAnswers: ["bale"], explanation: "Bale saiu do banco e marcou duas vezes em Kiev.", sourceUrl: UEFA_CL, seasonRef: "2017-18" }),
  q("b9-me-09", "champions_league", "medio", "Qual goleiro alemao do Liverpool falhou em dois gols na final da Liga dos Campeoes de 2018?", "Loris Karius", { acceptedAnswers: ["karius"], explanation: "O Real Madrid venceu por 3 a 1 em Kiev.", sourceUrl: UEFA_CL, seasonRef: "2017-18" }),
  q("b9-me-10", "copa_do_mundo", "medio", "Qual goleiro argentino defendeu penaltis na decisao da final da Copa do Mundo de 2022?", "Emiliano Martinez", { acceptedAnswers: ["dibu martinez", "dibu", "emi martinez"], explanation: "Dibu Martinez tambem fez uma defesa decisiva no fim da prorrogacao.", sourceUrl: FIFA, seasonRef: "2022" }),
  q("b9-me-11", "copa_do_mundo", "medio", "Qual lateral argentino converteu o penalti que deu o titulo a Argentina na Copa do Mundo de 2022?", "Gonzalo Montiel", { acceptedAnswers: ["montiel"], explanation: "Montiel bateu a quarta cobranca argentina e fechou a disputa.", sourceUrl: FIFA, seasonRef: "2022" }),
  q("b9-me-12", "copa_do_mundo", "medio", "Qual atacante croata empatou o jogo contra o Brasil no fim da prorrogacao das quartas de final da Copa de 2022?", "Bruno Petkovic", { acceptedAnswers: ["petkovic"], explanation: "O empate levou o jogo aos penaltis, vencidos pela Croacia.", sourceUrl: FIFA, seasonRef: "2022" }),
  q("b9-me-13", "futebol_brasileiro", "medio", "Em que ano o Vasco foi rebaixado pela primeira vez no Brasileirao?", "2008", { explanation: "O Vasco voltou como campeao da Serie B em 2009.", sourceUrl: CBF, seasonRef: "2008" }),
  q("b9-me-14", "futebol_brasileiro", "medio", "Em que ano o Atletico Mineiro foi rebaixado para a Serie B?", "2005", { explanation: "O Galo voltou como campeao da Serie B em 2006.", sourceUrl: CBF, seasonRef: "2005" }),
  q("b9-me-15", "futebol_brasileiro", "medio", "Em que ano o Internacional foi rebaixado pela primeira vez para a Serie B?", "2016", { explanation: "O Inter voltou a Serie A em 2017.", sourceUrl: CBF, seasonRef: "2016" }),
  q("b9-me-16", "futebol_brasileiro", "medio", "Em que ano o Cruzeiro foi rebaixado pela primeira vez para a Serie B?", "2019", { explanation: "O Cruzeiro ficou tres temporadas na Serie B.", sourceUrl: CBF, seasonRef: "2019" }),
  q("b9-me-17", "futebol_brasileiro", "medio", "Em que ano o Santos foi rebaixado pela primeira vez para a Serie B?", "2023", { explanation: "O Santos voltou como campeao da Serie B em 2024.", sourceUrl: CBF, seasonRef: "2023" }),
  q("b9-me-18", "futebol_europeu", "medio", "Qual clube ucraniano venceu a Copa da UEFA de 2009, com varios brasileiros no elenco?", "Shakhtar Donetsk", { acceptedAnswers: ["shakhtar"], explanation: "O Shakhtar venceu o Werder Bremen na prorrogacao, em Istambul.", sourceUrl: UEFA_EL, seasonRef: "2008-09" }),
  q("b9-me-19", "futebol_europeu", "medio", "Qual clube russo venceu a Copa da UEFA de 2008, batendo o Rangers na final?", "Zenit", { acceptedAnswers: ["zenit sao petersburgo"], explanation: "O Zenit venceu por 2 a 0 em Manchester.", sourceUrl: UEFA_EL, seasonRef: "2007-08" }),

  // ---------- DIFICIL (19) ----------
  q("b9-d-01", "jogadores", "dificil", "Qual atacante liberiano ganhou a Bola de Ouro de 1995, quando jogava pelo Milan?", "George Weah", { acceptedAnswers: ["weah"], explanation: "1995 foi o primeiro ano em que jogadores nao europeus puderam concorrer.", sourceUrl: BALLON, seasonRef: "1995" }),
  q("b9-d-02", "jogadores", "dificil", "Qual goleiro sovietico ganhou a Bola de Ouro de 1963?", "Lev Yashin", { acceptedAnswers: ["yashin", "aranha negra"], explanation: "Yashin passou toda a carreira no Dinamo Moscou.", sourceUrl: BALLON, seasonRef: "1963" }),
  q("b9-d-03", "jogadores", "dificil", "Qual atacante frances do Marselha ganhou a Bola de Ouro de 1991?", "Jean-Pierre Papin", { acceptedAnswers: ["papin"], explanation: "Papin era o grande goleador do Marselha.", sourceUrl: BALLON, seasonRef: "1991" }),
  q("b9-d-04", "jogadores", "dificil", "Qual atacante bulgaro do Barcelona ganhou a Bola de Ouro de 1994?", "Hristo Stoichkov", { acceptedAnswers: ["stoichkov"], explanation: "Stoichkov levou a Bulgaria a semifinal da Copa de 1994.", sourceUrl: BALLON, seasonRef: "1994" }),
  q("b9-d-05", "jogadores", "dificil", "Qual meia alemao do Borussia Dortmund ganhou a Bola de Ouro de 1996?", "Matthias Sammer", { acceptedAnswers: ["sammer"], explanation: "Sammer foi campeao da Eurocopa de 1996 com a Alemanha.", sourceUrl: BALLON, seasonRef: "1996" }),
  q("b9-d-06", "jogadores", "dificil", "Qual meia tcheco da Juventus ganhou a Bola de Ouro de 2003?", "Pavel Nedved", { acceptedAnswers: ["nedved"], explanation: "Nedved foi o segundo tcheco a vencer o premio.", sourceUrl: BALLON_RSSSF, seasonRef: "2003" }),
  q("b9-d-07", "jogadores", "dificil", "Qual atacante ucraniano do Milan ganhou a Bola de Ouro de 2004?", "Andriy Shevchenko", { acceptedAnswers: ["shevchenko"], explanation: "Shevchenko foi o terceiro ucraniano premiado, depois de Blokhin e Belanov.", sourceUrl: BALLON_RSSSF, seasonRef: "2004" }),
  q("b9-d-08", "jogadores", "dificil", "Qual atacante ingles do Liverpool ganhou a Bola de Ouro de 2001?", "Michael Owen", { acceptedAnswers: ["owen"], explanation: "Owen foi o primeiro ingles premiado desde Kevin Keegan.", sourceUrl: BALLON_RSSSF, seasonRef: "2001" }),
  q("b9-d-09", "jogadores", "dificil", "Qual meia portugues ganhou a Bola de Ouro de 2000, ano em que trocou o Barcelona pelo Real Madrid?", "Luis Figo", { acceptedAnswers: ["figo"], explanation: "A transferencia de Figo para o rival foi uma das mais polemicas da historia.", sourceUrl: BALLON, seasonRef: "2000" }),
  q("b9-d-10", "jogadores", "dificil", "Qual meia alemao da Inter de Milao ganhou a Bola de Ouro de 1990, ano do titulo mundial?", "Lothar Matthaus", { acceptedAnswers: ["matthaus", "matthaeus", "lothar matthaeus"], explanation: "Matthaus foi o capitao da Alemanha campea em 1990.", sourceUrl: BALLON, seasonRef: "1990" }),
  q("b9-d-11", "jogadores", "dificil", "Qual meia holandes do Milan ganhou a Bola de Ouro de 1987?", "Ruud Gullit", { acceptedAnswers: ["gullit"], explanation: "Gullit dedicou o premio a Nelson Mandela.", sourceUrl: BALLON, seasonRef: "1987" }),
  q("b9-d-12", "jogadores", "dificil", "Qual atacante italiano da Juventus ganhou a Bola de Ouro de 1993?", "Roberto Baggio", { acceptedAnswers: ["baggio"], explanation: "No ano seguinte, Baggio perderia o penalti decisivo da final da Copa.", sourceUrl: BALLON, seasonRef: "1993" }),
  q("b9-d-13", "futebol_europeu", "dificil", "Qual atacante ingles foi o artilheiro da Eurocopa de 1996, disputada em casa, com 5 gols?", "Alan Shearer", { acceptedAnswers: ["shearer"], explanation: "Foi a primeira edicao com premio oficial de artilheiro.", sourceUrl: EURO_TOPS, seasonRef: "1996" }),
  q("b9-d-14", "futebol_europeu", "dificil", "Qual atacante espanhol foi o artilheiro da Eurocopa de 2008, com 4 gols?", "David Villa", { acceptedAnswers: ["villa"], explanation: "Villa se lesionou e perdeu a semifinal e a final do titulo espanhol.", sourceUrl: EURO_TOPS, seasonRef: "2008" }),
  q("b9-d-15", "futebol_europeu", "dificil", "Qual atacante frances foi o artilheiro da Eurocopa de 2016, com 6 gols?", "Antoine Griezmann", { acceptedAnswers: ["griezmann"], explanation: "Griezmann tambem foi eleito o melhor jogador do torneio.", sourceUrl: EURO_TOPS, seasonRef: "2016" }),
  q("b9-d-16", "copa_do_mundo", "dificil", "Quantas selecoes disputaram a primeira Copa do Mundo, em 1930?", "13", { acceptedAnswers: ["treze"], explanation: "Poucas selecoes europeias aceitaram a longa viagem ate o Uruguai.", sourceUrl: WC_FORMAT, seasonRef: "1930" }),
  q("b9-d-17", "copa_do_mundo", "dificil", "Em que Copa do Mundo o torneio passou a ter 24 selecoes?", "1982", { explanation: "A Copa da Espanha ampliou o torneio de 16 para 24 equipes.", sourceUrl: WC_FORMAT, seasonRef: "1982" }),
  q("b9-d-18", "copa_do_mundo", "dificil", "Em que Copa do Mundo o torneio passou a ter 32 selecoes?", "1998", { explanation: "O formato com 32 selecoes durou de 1998 a 2022.", sourceUrl: WC_FORMAT, seasonRef: "1998" }),
  q("b9-d-19", "copa_do_mundo", "dificil", "Quantos gols a Hungria marcou na Copa do Mundo de 1954?", "27", { acceptedAnswers: ["vinte e sete"], explanation: "A Hungria de Puskas e Kocsis goleou, mas perdeu a final.", sourceUrl: WC_BIG_WINS, seasonRef: "1954" }),

  // ---------- IMPOSSIVEL (24) ----------
  q("b9-i-01", "jogadores", "impossivel", "Qual ponta ingles do Blackpool ganhou a primeira Bola de Ouro, em 1956?", "Stanley Matthews", { acceptedAnswers: ["matthews"], explanation: "Matthews tinha 41 anos quando recebeu o premio.", sourceUrl: BALLON, seasonRef: "1956" }),
  q("b9-i-02", "jogadores", "impossivel", "Qual meia frances do Real Madrid ganhou a Bola de Ouro de 1958?", "Raymond Kopa", { acceptedAnswers: ["kopa"], explanation: "Kopa foi o primeiro frances a vencer o premio.", sourceUrl: BALLON, seasonRef: "1958" }),
  q("b9-i-03", "jogadores", "impossivel", "Qual meia espanhol do Barcelona, homonimo de um atacante uruguaio famoso, ganhou a Bola de Ouro de 1960?", "Luis Suarez", { acceptedAnswers: ["luis suarez miramontes", "suarez"], explanation: "Luis Suarez Miramontes depois brilhou na Inter de Helenio Herrera.", sourceUrl: BALLON, seasonRef: "1960" }),
  q("b9-i-04", "jogadores", "impossivel", "Qual atacante argentino naturalizado italiano, da Juventus, ganhou a Bola de Ouro de 1961?", "Omar Sivori", { acceptedAnswers: ["sivori"], explanation: "Sivori defendeu Argentina e Italia.", sourceUrl: BALLON, seasonRef: "1961" }),
  q("b9-i-05", "jogadores", "impossivel", "Qual atacante escoces do Manchester United ganhou a Bola de Ouro de 1964?", "Denis Law", { acceptedAnswers: ["law"], explanation: "Law formou o trio do United com Best e Charlton.", sourceUrl: BALLON, seasonRef: "1964" }),
  q("b9-i-06", "jogadores", "impossivel", "Qual meia ingles do Manchester United ganhou a Bola de Ouro de 1966, ano do titulo mundial ingles?", "Bobby Charlton", { acceptedAnswers: ["charlton"], explanation: "Charlton era a estrela da Inglaterra campea em casa.", sourceUrl: BALLON, seasonRef: "1966" }),
  q("b9-i-07", "jogadores", "impossivel", "Qual atacante hungaro do Ferencvaros ganhou a Bola de Ouro de 1967?", "Florian Albert", { acceptedAnswers: ["albert"], explanation: "Albert passou toda a carreira no Ferencvaros.", sourceUrl: BALLON, seasonRef: "1967" }),
  q("b9-i-08", "jogadores", "impossivel", "Qual ponta norte-irlandes do Manchester United ganhou a Bola de Ouro de 1968?", "George Best", { acceptedAnswers: ["best"], explanation: "Best foi campeao europeu com o United naquele ano.", sourceUrl: BALLON, seasonRef: "1968" }),
  q("b9-i-09", "jogadores", "impossivel", "Qual meia italiano do Milan ganhou a Bola de Ouro de 1969?", "Gianni Rivera", { acceptedAnswers: ["rivera"], explanation: "Rivera foi campeao europeu com o Milan em 1969.", sourceUrl: BALLON, seasonRef: "1969" }),
  q("b9-i-10", "jogadores", "impossivel", "Qual atacante sovietico do Dinamo de Kiev ganhou a Bola de Ouro de 1975?", "Oleg Blokhin", { acceptedAnswers: ["blokhin", "oleh blokhin"], explanation: "Blokhin venceu a Recopa europeia com o Dinamo naquele ano.", sourceUrl: BALLON, seasonRef: "1975" }),
  q("b9-i-11", "jogadores", "impossivel", "Qual atacante dinamarques do Borussia Monchengladbach ganhou a Bola de Ouro de 1977?", "Allan Simonsen", { acceptedAnswers: ["simonsen"], explanation: "Simonsen depois jogou no Barcelona.", sourceUrl: BALLON, seasonRef: "1977" }),
  q("b9-i-12", "jogadores", "impossivel", "Qual atacante ingles do Hamburgo ganhou a Bola de Ouro em 1978 e 1979?", "Kevin Keegan", { acceptedAnswers: ["keegan"], explanation: "Keegan foi bicampeao jogando na Alemanha.", sourceUrl: BALLON, seasonRef: "1978-1979" }),
  q("b9-i-13", "jogadores", "impossivel", "Qual atacante sovietico do Dinamo de Kiev ganhou a Bola de Ouro de 1986?", "Igor Belanov", { acceptedAnswers: ["belanov"], explanation: "O Dinamo de Kiev venceu a Recopa europeia em 1986.", sourceUrl: BALLON, seasonRef: "1986" }),
  q("b9-i-14", "jogadores", "impossivel", "Quantas Bolas de Ouro o holandes Marco van Basten conquistou?", "3", { acceptedAnswers: ["tres"], explanation: "Van Basten venceu em 1988, 1989 e 1992, todas pelo Milan.", sourceUrl: BALLON }),
  q("b9-i-15", "jogadores", "impossivel", "Quantas Bolas de Ouro Alfredo Di Stefano conquistou?", "2", { acceptedAnswers: ["duas", "dois"], explanation: "Di Stefano venceu em 1957 e 1959, pelo Real Madrid.", sourceUrl: BALLON }),
  q("b9-i-16", "futebol_europeu", "impossivel", "Qual atacante iugoslavo foi o artilheiro da Eurocopa de 1968?", "Dragan Dzajic", { acceptedAnswers: ["dzajic"], explanation: "Dzajic levou a Iugoslavia a final contra a Italia.", sourceUrl: EURO_ARTICLE, seasonRef: "1968" }),
  q("b9-i-17", "futebol_europeu", "impossivel", "Qual atacante da Alemanha Ocidental, sem parentesco com Gerd, foi o artilheiro da Eurocopa de 1976?", "Dieter Muller", { acceptedAnswers: ["dieter mueller", "muller"], explanation: "Dieter Muller jogava pelo Colonia.", sourceUrl: EURO_ARTICLE, seasonRef: "1976" }),
  q("b9-i-18", "futebol_europeu", "impossivel", "Qual atacante da Alemanha Ocidental foi o artilheiro da Eurocopa de 1980?", "Klaus Allofs", { acceptedAnswers: ["allofs"], explanation: "A Alemanha Ocidental foi campea daquela Eurocopa.", sourceUrl: EURO_ARTICLE, seasonRef: "1980" }),
  q("b9-i-19", "copa_do_mundo", "impossivel", "Qual selecao a Hungria goleou por 10 a 1 na Copa do Mundo de 1982?", "El Salvador", { explanation: "Foi a unica vez que uma selecao marcou 10 gols em um jogo de Copa.", sourceUrl: WC_BIG_WINS, seasonRef: "1982" }),
  q("b9-i-20", "copa_do_mundo", "impossivel", "Qual reserva hungaro marcou um hat-trick em sete minutos na goleada de 10 a 1 sobre El Salvador, em 1982?", "Laszlo Kiss", { acceptedAnswers: ["kiss"], explanation: "Mesmo com a goleada, a Hungria caiu na primeira fase.", sourceUrl: WC_BIG_WINS, seasonRef: "1982" }),
  q("b9-i-21", "copa_do_mundo", "impossivel", "Qual selecao a Hungria goleou por 9 a 0 na estreia da Copa do Mundo de 1954?", "Coreia do Sul", { acceptedAnswers: ["coreia"], explanation: "Era a estreia dos sul-coreanos em Copas.", sourceUrl: WC_BIG_WINS, seasonRef: "1954" }),
  q("b9-i-22", "copa_do_mundo", "impossivel", "Qual selecao a Alemanha goleou por 8 a 0 na Copa do Mundo de 2002?", "Arabia Saudita", { explanation: "Klose marcou tres gols naquele jogo.", sourceUrl: WC_BIG_WINS, seasonRef: "2002" }),
  q("b9-i-23", "copa_do_mundo", "impossivel", "Qual atacante russo marcou cinco gols em um unico jogo, contra Camaroes, na Copa do Mundo de 1994?", "Oleg Salenko", { acceptedAnswers: ["salenko"], explanation: "A Russia venceu por 6 a 1, mas caiu na fase de grupos.", sourceUrl: WC_BIG_WINS, seasonRef: "1994" }),
  q("b9-i-24", "copa_do_mundo", "impossivel", "Qual atacante camaronense marcou contra a Russia na Copa de 1994, aos 42 anos de idade?", "Roger Milla", { acceptedAnswers: ["milla"], explanation: "Milla e o jogador mais velho a marcar em uma Copa do Mundo.", sourceUrl: WC_MILLA, seasonRef: "1994" }),
];
