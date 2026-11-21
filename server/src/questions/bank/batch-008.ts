// Question bank, batch 008 (100 questions: 19 facil, 19 moderado, 19 medio,
// 19 dificil, 24 impossivel). Same format/loader/idempotency pattern as
// batch-003.ts -- see server/src/questions/bank/PROGRESS.md.
//
// Written by hand (no AI pipeline). Checked against the full text of seed.ts
// and batches 001-007 so no fact is asked again, in either direction. Every
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
const OLYMPICS = "https://www.fifa.com/fifaplus/en/tournaments/mens/olympicgames";
const UEFA_CL = "https://www.uefa.com/uefachampionsleague/history/";
const CONMEBOL = "https://www.conmebol.com/libertadores/";
const CBF = "https://www.cbf.com.br/futebol-brasileiro/competicoes/campeonato-brasileiro-serie-a";
const PL = "https://www.premierleague.com/history";

// Sources actually used to verify the dificil/impossivel entries.
const WC_1950 = "https://en.wikipedia.org/wiki/Uruguay_v_Brazil_(1950_FIFA_World_Cup)";
const WC_1966 = "https://en.wikipedia.org/wiki/1966_FIFA_World_Cup_final";
const WC_1970 = "https://en.wikipedia.org/wiki/1970_FIFA_World_Cup_final";
const WC_1978 = "https://en.wikipedia.org/wiki/1978_FIFA_World_Cup_final";
const WC_1986 = "https://en.wikipedia.org/wiki/1986_FIFA_World_Cup_final";
const WC_2006 = "https://en.wikipedia.org/wiki/2006_FIFA_World_Cup_final";
const WC_2018 = "https://en.wikipedia.org/wiki/2018_FIFA_World_Cup_final";
const CWC_LIST = "https://en.wikipedia.org/wiki/FIFA_Club_World_Cup";
const IC_LIST = "https://en.wikipedia.org/wiki/Intercontinental_Cup_(1960%E2%80%932004)";
const PAULISTA = "https://en.wikipedia.org/wiki/Campeonato_Paulista";
const CARIOCA = "https://en.wikipedia.org/wiki/Campeonato_Carioca";
const GAUCHO = "https://en.wikipedia.org/wiki/Campeonato_Ga%C3%BAcho";
const MINEIRO = "https://en.wikipedia.org/wiki/Campeonato_Mineiro";

export const batch008: BankQuestion[] = [
  // ---------- FACIL (19) ----------
  q("b8-f-01", "clubes", "facil", "Em que pais fica o clube Feyenoord?", "Holanda", { acceptedAnswers: ["paises baixos"], explanation: "O Feyenoord e de Roterda.", sourceUrl: UEFA_CL }),
  q("b8-f-02", "clubes", "facil", "Em que pais fica o clube Zenit?", "Russia", { explanation: "O Zenit e de Sao Petersburgo.", sourceUrl: UEFA_CL }),
  q("b8-f-03", "clubes", "facil", "Em que pais fica o clube Red Bull Salzburg?", "Austria", { explanation: "O clube e da cidade de Salzburgo.", sourceUrl: UEFA_CL }),
  q("b8-f-04", "clubes", "facil", "Em que pais fica o clube Copenhagen?", "Dinamarca", { explanation: "O FC Copenhagen e da capital dinamarquesa.", sourceUrl: UEFA_CL }),
  q("b8-f-05", "clubes", "facil", "Em que pais fica o clube Inter Miami?", "Estados Unidos", { acceptedAnswers: ["eua"], explanation: "O Inter Miami disputa a MLS, a liga dos Estados Unidos.", sourceUrl: FIFA_CWC }),
  q("b8-f-06", "clubes", "facil", "Em que pais fica o Club America?", "Mexico", { explanation: "O America e da Cidade do Mexico.", sourceUrl: FIFA_CWC }),
  q("b8-f-07", "clubes", "facil", "Em que pais fica o clube Penarol?", "Uruguai", { explanation: "O Penarol e de Montevideu.", sourceUrl: CONMEBOL }),
  q("b8-f-08", "clubes", "facil", "Em que pais fica o clube Colo-Colo?", "Chile", { explanation: "O Colo-Colo e de Santiago.", sourceUrl: CONMEBOL }),
  q("b8-f-09", "clubes", "facil", "Em que pais fica o clube Bolivar?", "Bolivia", { explanation: "O Bolivar e de La Paz.", sourceUrl: CONMEBOL }),
  q("b8-f-10", "selecoes", "facil", "Qual pais e chamado de \"pais do futebol\"?", "Brasil", { explanation: "O apelido vem dos cinco titulos mundiais e da paixao pelo esporte.", sourceUrl: FIFA }),
  q("b8-f-11", "clubes", "facil", "Em que cidade alema fica o estadio do Borussia Dortmund?", "Dortmund", { explanation: "O estadio do clube fica na propria cidade de Dortmund.", sourceUrl: UEFA_CL }),
  q("b8-f-12", "copa_do_mundo", "facil", "Em que cidade fica o Estadio Azteca?", "Cidade do Mexico", { acceptedAnswers: ["mexico city", "cidade do mexico"], explanation: "O Azteca recebeu as finais das Copas de 1970 e 1986.", sourceUrl: FIFA }),
  q("b8-f-13", "jogadores", "facil", "Por qual selecao o meia Takefusa Kubo joga?", "Japao", { explanation: "Kubo e uma das estrelas do Japao.", sourceUrl: FIFA }),
  q("b8-f-14", "jogadores", "facil", "Por qual selecao o atacante Luis Diaz joga?", "Colombia", { explanation: "Luis Diaz e o principal atacante da Colombia.", sourceUrl: FIFA }),
  q("b8-f-15", "jogadores", "facil", "Por qual selecao o atacante Khvicha Kvaratskhelia joga?", "Georgia", { explanation: "Kvaratskhelia levou a Georgia a sua primeira Eurocopa.", sourceUrl: UEFA_CL }),
  q("b8-f-16", "jogadores", "facil", "Por qual selecao o atacante Viktor Gyokeres joga?", "Suecia", { explanation: "Gyokeres e o centroavante da Suecia.", sourceUrl: UEFA_CL }),
  q("b8-f-17", "jogadores", "facil", "Por qual selecao o meia Martin Odegaard joga?", "Noruega", { explanation: "Odegaard e o capitao da Noruega.", sourceUrl: PL }),
  q("b8-f-18", "jogadores", "facil", "Por qual selecao o zagueiro Josko Gvardiol joga?", "Croacia", { explanation: "Gvardiol foi terceiro colocado com a Croacia na Copa de 2022.", sourceUrl: FIFA }),
  q("b8-f-19", "jogadores", "facil", "Por qual selecao o atacante Mehdi Taremi joga?", "Ira", { acceptedAnswers: ["irao"], explanation: "Taremi e o principal atacante do Ira.", sourceUrl: FIFA }),

  // ---------- MODERADO (19) ----------
  q("b8-mo-01", "futebol_brasileiro", "moderado", "Qual clube nordestino e conhecido como \"Tricolor de Aco\"?", "Bahia", { acceptedAnswers: ["ec bahia"], explanation: "Tricolor de Aco e o apelido classico do Esporte Clube Bahia.", sourceUrl: CBF }),
  q("b8-mo-02", "futebol_brasileiro", "moderado", "Qual clube de Campinas e conhecido como \"Bugre\"?", "Guarani", { explanation: "O Bugre e o primeiro campeao brasileiro do interior.", sourceUrl: CBF }),
  q("b8-mo-03", "futebol_brasileiro", "moderado", "Qual clube de Campinas e conhecido como \"Macaca\"?", "Ponte Preta", { explanation: "A Macaca e a grande rival do Guarani no Derbi campineiro.", sourceUrl: CBF }),
  q("b8-mo-04", "futebol_brasileiro", "moderado", "Qual clube de Goiania e conhecido como \"Dragao\"?", "Atletico Goianiense", { acceptedAnswers: ["atletico-go", "atletico go"], explanation: "O mascote do Atletico Goianiense e um dragao.", sourceUrl: CBF }),
  q("b8-mo-05", "futebol_brasileiro", "moderado", "Qual clube de Belem e conhecido como \"Papao da Curuzu\"?", "Paysandu", { explanation: "A Curuzu e o estadio do Paysandu.", sourceUrl: CBF }),
  q("b8-mo-06", "futebol_brasileiro", "moderado", "Qual clube goiano e conhecido como \"Esmeraldino\"?", "Goias", { explanation: "O apelido vem do verde da camisa.", sourceUrl: CBF }),
  q("b8-mo-07", "futebol_brasileiro", "moderado", "Qual clube pernambucano e conhecido como \"Timbu\"?", "Nautico", { acceptedAnswers: ["clube nautico capibaribe"], explanation: "O Timbu e o mascote do Nautico.", sourceUrl: CBF }),
  q("b8-mo-08", "futebol_brasileiro", "moderado", "Qual clube pernambucano e conhecido como \"Cobra Coral\"?", "Santa Cruz", { explanation: "O apelido vem das cores preta, branca e vermelha.", sourceUrl: CBF }),
  q("b8-mo-09", "clubes", "moderado", "Qual clube portugues e conhecido como \"Dragoes\"?", "Porto", { acceptedAnswers: ["fc porto"], explanation: "O Porto joga no Estadio do Dragao.", sourceUrl: UEFA_CL }),
  q("b8-mo-10", "clubes", "moderado", "Qual clube portugues e conhecido como \"Leoes\"?", "Sporting", { acceptedAnswers: ["sporting cp", "sporting lisboa"], explanation: "O leao esta no escudo do Sporting.", sourceUrl: UEFA_CL }),
  q("b8-mo-11", "clubes", "moderado", "Qual clube portugues e conhecido como \"Aguias\"?", "Benfica", { explanation: "A aguia e o simbolo do Benfica.", sourceUrl: UEFA_CL }),
  q("b8-mo-12", "clubes", "moderado", "Qual clube ingles e conhecido como \"Hammers\"?", "West Ham", { acceptedAnswers: ["west ham united"], explanation: "Os martelos cruzados estao no escudo do West Ham.", sourceUrl: PL }),
  q("b8-mo-13", "clubes", "moderado", "Qual clube ingles e conhecido como \"Magpies\"?", "Newcastle", { acceptedAnswers: ["newcastle united"], explanation: "Magpies, ou pegas, por causa da camisa preta e branca.", sourceUrl: PL }),
  q("b8-mo-14", "clubes", "moderado", "Qual clube ingles e conhecido como \"Foxes\"?", "Leicester City", { acceptedAnswers: ["leicester"], explanation: "A raposa esta no escudo do Leicester.", sourceUrl: PL }),
  q("b8-mo-15", "clubes", "moderado", "Qual clube londrino e conhecido como \"Blues\" e manda seus jogos no oeste de Londres?", "Chelsea", { explanation: "O Chelsea manda seus jogos em Stamford Bridge.", sourceUrl: PL }),
  q("b8-mo-16", "selecoes", "moderado", "Quem converteu o penalti decisivo que deu ao Brasil o ouro olimpico de 2016, no Maracana?", "Neymar", { acceptedAnswers: ["neymar jr"], explanation: "O Brasil venceu a Alemanha nos penaltis e conquistou seu primeiro ouro no futebol masculino.", sourceUrl: OLYMPICS, seasonRef: "2016" }),
  q("b8-mo-17", "selecoes", "moderado", "Qual selecao ganhou o ouro olimpico de Toquio (2020), vencendo a Espanha na final?", "Brasil", { explanation: "O Brasil foi bicampeao olimpico seguido.", sourceUrl: OLYMPICS, seasonRef: "2020" }),
  q("b8-mo-18", "selecoes", "moderado", "Qual selecao venceu o Brasil na final do futebol olimpico de Londres 2012?", "Mexico", { explanation: "O Mexico venceu por 2 a 1 em Wembley.", sourceUrl: OLYMPICS, seasonRef: "2012" }),
  q("b8-mo-19", "selecoes", "moderado", "Qual selecao ganhou o ouro olimpico de Pequim 2008, com Messi no time?", "Argentina", { explanation: "A Argentina venceu a Nigeria na final.", sourceUrl: OLYMPICS, seasonRef: "2008" }),

  // ---------- MEDIO (19) ----------
  q("b8-me-01", "competicoes_internacionais", "medio", "Qual clube brasileiro perdeu para o Real Madrid a final do Mundial de Clubes de 2017?", "Gremio", { acceptedAnswers: ["imortal"], explanation: "O Real venceu por 1 a 0, gol de falta de Cristiano Ronaldo.", sourceUrl: FIFA_CWC, seasonRef: "2017" }),
  q("b8-me-02", "competicoes_internacionais", "medio", "Qual clube ingles derrotou o Flamengo na final do Mundial de Clubes de 2019?", "Liverpool", { explanation: "O Liverpool venceu por 1 a 0 na prorrogacao, em Doha.", sourceUrl: FIFA_CWC, seasonRef: "2019" }),
  q("b8-me-03", "competicoes_internacionais", "medio", "Qual clube ingles derrotou o Palmeiras na final do Mundial de Clubes de 2021?", "Chelsea", { explanation: "O Chelsea venceu por 2 a 1 na prorrogacao, em Abu Dhabi.", sourceUrl: FIFA_CWC, seasonRef: "2021" }),
  q("b8-me-04", "competicoes_internacionais", "medio", "Qual clube ingles goleou o Fluminense na final do Mundial de Clubes de 2023?", "Manchester City", { acceptedAnswers: ["city", "man city"], explanation: "O City venceu por 4 a 0 em Jeddah.", sourceUrl: FIFA_CWC, seasonRef: "2023" }),
  q("b8-me-05", "competicoes_internacionais", "medio", "Qual clube espanhol o Sao Paulo venceu na final do Mundial Interclubes de 1992?", "Barcelona", { acceptedAnswers: ["fc barcelona", "barca"], explanation: "Rai marcou os dois gols da virada por 2 a 1 em Toquio.", sourceUrl: FIFA_CWC, seasonRef: "1992" }),
  q("b8-me-06", "competicoes_internacionais", "medio", "Qual clube italiano o Sao Paulo venceu na final do Mundial Interclubes de 1993?", "Milan", { acceptedAnswers: ["ac milan"], explanation: "O Sao Paulo de Tele venceu por 3 a 2, gol decisivo de Muller.", sourceUrl: FIFA_CWC, seasonRef: "1993" }),
  q("b8-me-07", "competicoes_internacionais", "medio", "Qual clube holandes derrotou o Gremio nos penaltis no Mundial Interclubes de 1995?", "Ajax", { explanation: "A final em Toquio terminou 0 a 0.", sourceUrl: FIFA_CWC, seasonRef: "1995" }),
  q("b8-me-08", "competicoes_internacionais", "medio", "Qual clube alemao derrotou o Cruzeiro no Mundial Interclubes de 1997?", "Borussia Dortmund", { acceptedAnswers: ["dortmund", "bvb"], explanation: "O Dortmund venceu por 2 a 0 em Toquio.", sourceUrl: FIFA_CWC, seasonRef: "1997" }),
  q("b8-me-09", "competicoes_internacionais", "medio", "Qual clube espanhol derrotou o Vasco no Mundial Interclubes de 1998?", "Real Madrid", { explanation: "O Real venceu por 2 a 1, com gol de Raul no fim.", sourceUrl: FIFA_CWC, seasonRef: "1998" }),
  q("b8-me-10", "competicoes_internacionais", "medio", "Qual clube ingles derrotou o Palmeiras no Mundial Interclubes de 1999?", "Manchester United", { acceptedAnswers: ["man united", "united"], explanation: "Roy Keane marcou o gol da vitoria por 1 a 0 em Toquio.", sourceUrl: FIFA_CWC, seasonRef: "1999" }),
  q("b8-me-11", "selecoes", "medio", "Quem foi o capitao do Brasil tricampeao do mundo em 1970?", "Carlos Alberto Torres", { acceptedAnswers: ["carlos alberto", "capita"], explanation: "Carlos Alberto ergueu a Taca Jules Rimet no Azteca.", sourceUrl: FIFA, seasonRef: "1970" }),
  q("b8-me-12", "selecoes", "medio", "Quem foi o capitao do Brasil bicampeao do mundo em 1962?", "Mauro", { acceptedAnswers: ["mauro ramos"], explanation: "O zagueiro Mauro Ramos ergueu a taca no Chile.", sourceUrl: FIFA, seasonRef: "1962" }),
  q("b8-me-13", "selecoes", "medio", "Quem foi o capitao do Brasil campeao do mundo em 1958, eternizado pelo gesto de erguer a taca?", "Bellini", { acceptedAnswers: ["hilderaldo bellini"], explanation: "O gesto de Bellini virou estatua em frente ao Maracana.", sourceUrl: FIFA, seasonRef: "1958" }),
  q("b8-me-14", "copa_do_mundo", "medio", "Qual atacante brasileiro ficou conhecido como \"Furacao da Copa\" por marcar em todos os jogos do Mundial de 1970?", "Jairzinho", { acceptedAnswers: ["jair ventura filho"], explanation: "Jairzinho marcou nos seis jogos do Brasil no Mexico.", sourceUrl: FIFA, seasonRef: "1970" }),
  q("b8-me-15", "jogadores", "medio", "Por qual clube Garrincha jogou a maior parte de sua carreira?", "Botafogo", { acceptedAnswers: ["fogao"], explanation: "Garrincha e o maior idolo da historia do Botafogo.", sourceUrl: CBF }),
  q("b8-me-16", "jogadores", "medio", "De qual clube Socrates foi o grande idolo, lider da Democracia Corintiana?", "Corinthians", { acceptedAnswers: ["timao"], explanation: "A Democracia Corintiana marcou o clube no inicio dos anos 80.", sourceUrl: CBF }),
  q("b8-me-17", "jogadores", "medio", "Em qual clube italiano Paulo Roberto Falcao virou o \"Rei de Roma\"?", "Roma", { acceptedAnswers: ["as roma"], explanation: "Falcao levou a Roma ao titulo italiano de 1983.", sourceUrl: UEFA_CL }),
  q("b8-me-18", "jogadores", "medio", "Por qual clube italiano Careca jogou ao lado de Maradona?", "Napoli", { explanation: "Careca foi campeao italiano e da Copa da UEFA pelo Napoli.", sourceUrl: UEFA_CL }),
  q("b8-me-19", "jogadores", "medio", "Por qual clube Romario jogava quando marcou seu milesimo gol, em 2007?", "Vasco da Gama", { acceptedAnswers: ["vasco"], explanation: "O gol mil foi de penalti, contra o Sport, em Sao Januario.", sourceUrl: CBF, seasonRef: "2007" }),

  // ---------- DIFICIL (19) ----------
  q("b8-d-01", "copa_do_mundo", "dificil", "Qual jogador uruguaio marcou o gol de empate contra o Brasil na decisao da Copa do Mundo de 1950?", "Juan Alberto Schiaffino", { acceptedAnswers: ["schiaffino"], explanation: "Schiaffino empatou aos 66 minutos, antes do gol de Ghiggia.", sourceUrl: WC_1950, seasonRef: "1950" }),
  q("b8-d-02", "copa_do_mundo", "dificil", "Qual atacante brasileiro abriu o placar contra o Uruguai na decisao da Copa do Mundo de 1950?", "Friaca", { explanation: "Friaca marcou aos 47 minutos, mas o Uruguai virou para 2 a 1.", sourceUrl: WC_1950, seasonRef: "1950" }),
  q("b8-d-03", "copa_do_mundo", "dificil", "Alem de Geoff Hurst, qual jogador ingles marcou na final da Copa do Mundo de 1966?", "Martin Peters", { acceptedAnswers: ["peters"], explanation: "Peters marcou aos 78 minutos e a Inglaterra venceu por 4 a 2.", sourceUrl: WC_1966, seasonRef: "1966" }),
  q("b8-d-04", "copa_do_mundo", "dificil", "Qual jogador da Alemanha Ocidental empatou a final da Copa do Mundo de 1966 aos 89 minutos, levando o jogo para a prorrogacao?", "Wolfgang Weber", { acceptedAnswers: ["weber"], explanation: "Na prorrogacao, Hurst marcou mais duas vezes.", sourceUrl: WC_1966, seasonRef: "1966" }),
  q("b8-d-05", "copa_do_mundo", "dificil", "Qual meia brasileiro marcou o segundo gol do Brasil na final da Copa do Mundo de 1970, contra a Italia?", "Gerson", { acceptedAnswers: ["gerson de oliveira nunes", "canhotinha de ouro"], explanation: "O chute de fora da area de Gerson desempatou o jogo.", sourceUrl: WC_1970, seasonRef: "1970" }),
  q("b8-d-06", "copa_do_mundo", "dificil", "Qual atacante italiano marcou o gol da Italia na final da Copa do Mundo de 1970?", "Roberto Boninsegna", { acceptedAnswers: ["boninsegna"], explanation: "Boninsegna empatou no primeiro tempo, mas o Brasil venceu por 4 a 1.", sourceUrl: WC_1970, seasonRef: "1970" }),
  q("b8-d-07", "copa_do_mundo", "dificil", "Qual atacante argentino marcou o terceiro gol da Argentina na prorrogacao da final da Copa do Mundo de 1978?", "Daniel Bertoni", { acceptedAnswers: ["bertoni"], explanation: "Bertoni fechou o 3 a 1 sobre a Holanda.", sourceUrl: WC_1978, seasonRef: "1978" }),
  q("b8-d-08", "copa_do_mundo", "dificil", "Qual atacante holandes marcou o gol de empate da Holanda na final da Copa do Mundo de 1978?", "Dick Nanninga", { acceptedAnswers: ["nanninga"], explanation: "Nanninga empatou aos 81 minutos e o jogo foi para a prorrogacao.", sourceUrl: WC_1978, seasonRef: "1978" }),
  q("b8-d-09", "copa_do_mundo", "dificil", "Qual zagueiro argentino abriu o placar de cabeca na final da Copa do Mundo de 1986?", "Jose Luis Brown", { acceptedAnswers: ["brown", "tata brown"], explanation: "Brown cabeceou apos cobranca de falta no primeiro tempo.", sourceUrl: WC_1986, seasonRef: "1986" }),
  q("b8-d-10", "copa_do_mundo", "dificil", "Qual atacante argentino marcou o segundo gol da Argentina na final da Copa do Mundo de 1986?", "Jorge Valdano", { acceptedAnswers: ["valdano"], explanation: "Valdano ampliou para 2 a 0 no segundo tempo.", sourceUrl: WC_1986, seasonRef: "1986" }),
  q("b8-d-11", "copa_do_mundo", "dificil", "Qual capitao da Alemanha Ocidental descontou na final da Copa do Mundo de 1986?", "Karl-Heinz Rummenigge", { acceptedAnswers: ["rummenigge"], explanation: "Rummenigge fez 2 a 1 aos 74 minutos.", sourceUrl: WC_1986, seasonRef: "1986" }),
  q("b8-d-12", "copa_do_mundo", "dificil", "Qual atacante empatou em 2 a 2 para a Alemanha Ocidental na final da Copa do Mundo de 1986?", "Rudi Voller", { acceptedAnswers: ["voller", "voeller", "rudi voeller"], explanation: "Voller empatou aos 81 minutos, mas Burruchaga decidiu tres minutos depois.", sourceUrl: WC_1986, seasonRef: "1986" }),
  q("b8-d-13", "copa_do_mundo", "dificil", "Quem marcou de penalti o gol da Franca na final da Copa do Mundo de 2006?", "Zinedine Zidane", { acceptedAnswers: ["zidane", "zizou"], explanation: "Zidane abriu o placar com uma cavadinha aos 7 minutos.", sourceUrl: WC_2006, seasonRef: "2006" }),
  q("b8-d-14", "copa_do_mundo", "dificil", "Qual meia frances marcou o terceiro gol da Franca na final da Copa do Mundo de 2018?", "Paul Pogba", { acceptedAnswers: ["pogba"], explanation: "Pogba fez 3 a 1 aos 59 minutos contra a Croacia.", sourceUrl: WC_2018, seasonRef: "2018" }),
  q("b8-d-15", "copa_do_mundo", "dificil", "Qual atacante croata empatou o jogo no primeiro tempo da final da Copa do Mundo de 2018?", "Ivan Perisic", { acceptedAnswers: ["perisic"], explanation: "Perisic fez 1 a 1, mas a Franca venceu por 4 a 2.", sourceUrl: WC_2018, seasonRef: "2018" }),
  q("b8-d-16", "copa_do_mundo", "dificil", "Qual atacante croata marcou contra e tambem a favor na final da Copa do Mundo de 2018?", "Mario Mandzukic", { acceptedAnswers: ["mandzukic"], explanation: "Mandzukic fez gol contra aos 18 minutos e descontou aos 69.", sourceUrl: WC_2018, seasonRef: "2018" }),
  q("b8-d-17", "competicoes_internacionais", "dificil", "Qual clube do Congo eliminou o Internacional na semifinal do Mundial de Clubes de 2010?", "TP Mazembe", { acceptedAnswers: ["mazembe"], explanation: "O Mazembe venceu por 2 a 0 e foi o primeiro africano em uma final do torneio.", sourceUrl: CWC_LIST, seasonRef: "2010" }),
  q("b8-d-18", "competicoes_internacionais", "dificil", "Qual clube marroquino eliminou o Atletico Mineiro na semifinal do Mundial de Clubes de 2013?", "Raja Casablanca", { acceptedAnswers: ["raja", "raja ca"], explanation: "O Raja, anfitriao, chegou a final e perdeu para o Bayern.", sourceUrl: CWC_LIST, seasonRef: "2013" }),
  q("b8-d-19", "competicoes_internacionais", "dificil", "Por qual placar o Barcelona venceu o Santos na final do Mundial de Clubes de 2011?", "4 a 0", { acceptedAnswers: ["4x0", "4-0"], explanation: "O Barcelona de Messi dominou o Santos de Neymar em Yokohama.", sourceUrl: CWC_LIST, seasonRef: "2011" }),

  // ---------- IMPOSSIVEL (24) ----------
  q("b8-i-01", "futebol_brasileiro", "impossivel", "Qual clube do interior venceu o Campeonato Paulista de 1986, batendo o Palmeiras na final?", "Inter de Limeira", { acceptedAnswers: ["internacional de limeira"], explanation: "A Inter de Limeira venceu o Palmeiras na decisao.", sourceUrl: PAULISTA, seasonRef: "1986" }),
  q("b8-i-02", "futebol_brasileiro", "impossivel", "Qual clube do interior venceu o Campeonato Paulista de 1990, na final contra o Novorizontino?", "Bragantino", { acceptedAnswers: ["red bull bragantino"], explanation: "A final de 1990 ficou conhecida como a \"final caipira\".", sourceUrl: PAULISTA, seasonRef: "1990" }),
  q("b8-i-03", "futebol_brasileiro", "impossivel", "Qual clube de Itu venceu o Campeonato Paulista de 2002?", "Ituano", { explanation: "O Ituano venceu a Uniao Sao Joao na decisao.", sourceUrl: PAULISTA, seasonRef: "2002" }),
  q("b8-i-04", "futebol_brasileiro", "impossivel", "Qual clube do ABC venceu o Campeonato Paulista de 2004, na final contra o Paulista?", "Sao Caetano", { acceptedAnswers: ["ad sao caetano", "azulao"], explanation: "Foi o unico titulo paulista do Sao Caetano.", sourceUrl: PAULISTA, seasonRef: "2004" }),
  q("b8-i-05", "futebol_brasileiro", "impossivel", "Qual clube venceu o Campeonato Carioca de 1960, fora do quarteto Flamengo, Fluminense, Vasco e Botafogo?", "America", { acceptedAnswers: ["america-rj", "america rj"], explanation: "Foi o setimo e ultimo titulo carioca do America.", sourceUrl: CARIOCA, seasonRef: "1960" }),
  q("b8-i-06", "futebol_brasileiro", "impossivel", "Qual clube da zona oeste do Rio venceu o Campeonato Carioca de 1966?", "Bangu", { explanation: "Foi o segundo titulo carioca da historia do Bangu.", sourceUrl: CARIOCA, seasonRef: "1966" }),
  q("b8-i-07", "futebol_brasileiro", "impossivel", "Qual clube de Caxias do Sul venceu o Campeonato Gaucho de 2000, batendo o Gremio na final?", "Caxias", { acceptedAnswers: ["sociedade esportiva e recreativa caxias do sul", "ser caxias"], explanation: "Foi o primeiro titulo gaucho do Caxias, entao treinado por Tite.", sourceUrl: GAUCHO, seasonRef: "2000" }),
  q("b8-i-08", "futebol_brasileiro", "impossivel", "Qual clube quebrou a hegemonia da dupla Gre-Nal e venceu o Campeonato Gaucho de 1998, contra o Internacional?", "Juventude", { acceptedAnswers: ["ec juventude"], explanation: "Foi o primeiro titulo gaucho da historia do Juventude.", sourceUrl: GAUCHO, seasonRef: "1998" }),
  q("b8-i-09", "futebol_brasileiro", "impossivel", "Qual clube de Sabara venceu o Campeonato Mineiro de 1964?", "Siderurgica", { explanation: "A Siderurgica venceu o America na disputa pelo titulo.", sourceUrl: MINEIRO, seasonRef: "1964" }),
  q("b8-i-10", "futebol_brasileiro", "impossivel", "Qual clube do sul de Minas venceu o Campeonato Mineiro de 2002?", "Caldense", { explanation: "A Caldense, de Pocos de Caldas, bateu o Ipatinga na decisao.", sourceUrl: MINEIRO, seasonRef: "2002" }),
  q("b8-i-11", "futebol_brasileiro", "impossivel", "Qual clube do Vale do Aco venceu o Campeonato Mineiro de 2005, batendo o Cruzeiro na final?", "Ipatinga", { explanation: "Foi o maior titulo da historia do Ipatinga.", sourceUrl: MINEIRO, seasonRef: "2005" }),
  q("b8-i-12", "futebol_brasileiro", "impossivel", "Qual clube de Belo Horizonte, fora de Atletico e Cruzeiro, venceu o Campeonato Mineiro de 1971?", "America Mineiro", { acceptedAnswers: ["america-mg", "america mg", "america"], explanation: "O America bateu o Cruzeiro na disputa daquele ano.", sourceUrl: MINEIRO, seasonRef: "1971" }),
  q("b8-i-13", "competicoes_internacionais", "impossivel", "Qual clube uruguaio venceu o Benfica no jogo-desempate do Intercontinental de 1961?", "Penarol", { explanation: "O Penarol perdeu em Lisboa, goleou por 5 a 0 em Montevideu e venceu o desempate por 2 a 1.", sourceUrl: IC_LIST, seasonRef: "1961" }),
  q("b8-i-14", "competicoes_internacionais", "impossivel", "Qual clube alemao derrotou o Cruzeiro no Intercontinental de 1976?", "Bayern de Munique", { acceptedAnswers: ["bayern", "bayern munique"], explanation: "O Bayern venceu por 2 a 0 no placar agregado.", sourceUrl: IC_LIST, seasonRef: "1976" }),
  q("b8-i-15", "competicoes_internacionais", "impossivel", "Qual clube alemao perdeu para o Boca Juniors o Intercontinental de 1977?", "Borussia Monchengladbach", { acceptedAnswers: ["monchengladbach", "gladbach", "borussia moenchengladbach"], explanation: "O Gladbach substituiu o Liverpool, campeao europeu, que recusou disputar.", sourceUrl: IC_LIST, seasonRef: "1977" }),
  q("b8-i-16", "competicoes_internacionais", "impossivel", "Qual clube sueco perdeu para o Olimpia o Intercontinental de 1979?", "Malmo", { acceptedAnswers: ["malmo ff", "malmoe"], explanation: "O Olimpia venceu os dois jogos.", sourceUrl: IC_LIST, seasonRef: "1979" }),
  q("b8-i-17", "competicoes_internacionais", "impossivel", "Qual clube ingles perdeu para o Nacional (URU) o Intercontinental de 1980?", "Nottingham Forest", { explanation: "Foi o primeiro Intercontinental disputado em jogo unico no Japao.", sourceUrl: IC_LIST, seasonRef: "1980" }),
  q("b8-i-18", "competicoes_internacionais", "impossivel", "Qual clube holandes derrotou o Estudiantes no Intercontinental de 1970?", "Feyenoord", { explanation: "Foi o primeiro titulo mundial de um clube holandes.", sourceUrl: IC_LIST, seasonRef: "1970" }),
  q("b8-i-19", "competicoes_internacionais", "impossivel", "Qual clube grego perdeu para o Nacional (URU) o Intercontinental de 1971?", "Panathinaikos", { explanation: "O Panathinaikos substituiu o Ajax, campeao europeu, que recusou disputar.", sourceUrl: IC_LIST, seasonRef: "1971" }),
  q("b8-i-20", "competicoes_internacionais", "impossivel", "Qual clube holandes goleou o Independiente por 3 a 0 em Amsterda no Intercontinental de 1972?", "Ajax", { explanation: "Apos 1 a 1 em Avellaneda, o Ajax de Cruyff venceu em casa.", sourceUrl: IC_LIST, seasonRef: "1972" }),
  q("b8-i-21", "competicoes_internacionais", "impossivel", "Qual clube espanhol derrotou o Independiente no Intercontinental de 1974?", "Atletico de Madrid", { acceptedAnswers: ["atletico madrid", "atleti"], explanation: "O Atletico substituiu o Bayern, campeao europeu, e venceu por 2 a 1 no agregado.", sourceUrl: IC_LIST, seasonRef: "1974" }),
  q("b8-i-22", "competicoes_internacionais", "impossivel", "Qual clube mexicano venceu o Real Madrid nos penaltis na disputa do terceiro lugar do Mundial de Clubes de 2000?", "Necaxa", { explanation: "O jogo terminou 1 a 1 e foi decidido nos penaltis.", sourceUrl: CWC_LIST, seasonRef: "2000" }),
  q("b8-i-23", "competicoes_internacionais", "impossivel", "Por qual placar o Milan venceu o Boca Juniors na final do Mundial de Clubes de 2007?", "4 a 2", { acceptedAnswers: ["4x2", "4-2"], explanation: "Kaka e Inzaghi brilharam na final de Yokohama.", sourceUrl: CWC_LIST, seasonRef: "2007" }),
  q("b8-i-24", "competicoes_internacionais", "impossivel", "Qual clube equatoriano perdeu para o Manchester United a final do Mundial de Clubes de 2008?", "LDU", { acceptedAnswers: ["ldu quito", "liga de quito", "ldu de quito"], explanation: "O United venceu por 1 a 0, gol de Rooney.", sourceUrl: CWC_LIST, seasonRef: "2008" }),
];
