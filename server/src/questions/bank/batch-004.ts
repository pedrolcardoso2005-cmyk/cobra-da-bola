// Question bank, batch 004 (100 questions: 19 facil, 19 moderado, 19 medio,
// 19 dificil, 24 impossivel). Same format/loader/idempotency pattern as
// batch-003.ts -- see server/src/questions/bank/PROGRESS.md.
//
// Written by hand (no AI pipeline). Checked against the full text of seed.ts
// and batches 001-003 so no fact is asked again, in either direction. Every
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
const UEFA_BDO = "https://www.uefa.com/ballondor/";
const CONMEBOL = "https://www.conmebol.com/libertadores/";
const COPA_AMERICA = "https://www.conmebol.com/copa-america/";
const CBF = "https://www.cbf.com.br/futebol-brasileiro/competicoes/campeonato-brasileiro-serie-a";
const CBF_CDB = "https://www.cbf.com.br/futebol-brasileiro/competicoes/copa-brasil-masculino";
const PL = "https://www.premierleague.com/history";

// Sources actually used to verify the dificil/impossivel entries.
const WC_MANAGERS = "https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_winning_managers";
const WC_GOLDEN_BOOT = "https://www.aljazeera.com/sports/2022/11/14/world-cup-golden-boot-winners-over-the-years";
const WC_FINALS_BR = "https://www.lance.com.br/copa-do-mundo/de-1930-a-2018-relembre-todas-as-21-finais-de-copa-do-mundo-na-historia.html";
const WC_1990_BREHME = "https://www.lance.com.br/lancepedia/final-da-copa-de-1990-alemanha-argentina.html";
const UCL_1998 = "https://en.wikipedia.org/wiki/1998_UEFA_Champions_League_final";
const UCL_2010 = "https://en.wikipedia.com/wiki/2010_UEFA_Champions_League_final";
const EURO_2004 = "https://uefa.com/uefaeuro/history/news/0254-0d7b673abd33-d04e3bb2cd62-1000--greece-crowned-kings-of-europe-after-euro-2004-final-win-ag";
const BR_COACHES = "https://rsssfbrasil.com/miscellaneous/brcoaches.htm";
const BR_1971 = "https://en.wikipedia.org/wiki/1971_Campeonato_Brasileiro_S%C3%A9rie_A";
const BR_1974 = "https://en.wikipedia.org/wiki/1974_Campeonato_Brasileiro_S%C3%A9rie_A";
const BR_1980 = "https://en.wikipedia.org/wiki/1980_Campeonato_Brasileiro_S%C3%A9rie_A";
const BR_1981 = "https://gremio.net/titulos/titulo/44";
const BR_FINALS = "https://netvasco.com.br/mauroprais/futbr/campbr.html";
const BR_1988 = "https://en.wikipedia.org/wiki/1988_in_Brazilian_football";
const CDB_HISTORY = "https://netvasco.com.br/mauroprais/futbr/copabr.html";
const LIB_FINALS = "https://rsssf.org/sacups/copalib.html";
const LIB_1977 = "https://www.wikipedia.org/wiki/1977_Copa_Libertadores_Finals";
const IC_1962 = "https://rsssf.org/tablesi/intconclub62.html";
const IC_1963 = "https://rsssf.org/tablesi/intconclub63.html";
const TACA_1966 = "https://www.rsssfbrasil.com/tablesae/cbr1966.htm";

export const batch004: BankQuestion[] = [
  // ---------- FACIL (19) ----------
  q("b4-f-01", "selecoes", "facil", "Qual selecao e conhecida pelo apelido \"Laranja Mecanica\"?", "Holanda", { acceptedAnswers: ["paises baixos"], explanation: "O apelido vem da camisa laranja e do futebol total da Holanda dos anos 70.", sourceUrl: FIFA }),
  q("b4-f-02", "jogadores", "facil", "Qual craque brasileiro ficou conhecido pelo apelido \"Bruxo\"?", "Ronaldinho Gaucho", { acceptedAnswers: ["ronaldinho", "ronaldo de assis moreira"], explanation: "Ronaldinho ganhou o apelido pelas jogadas de magica com a bola.", sourceUrl: UEFA_BDO }),
  q("b4-f-03", "clubes", "facil", "Em que cidade fica o clube Boca Juniors?", "Buenos Aires", { explanation: "O Boca e do bairro de La Boca, em Buenos Aires.", sourceUrl: CONMEBOL }),
  q("b4-f-04", "clubes", "facil", "Em que pais fica o clube Benfica?", "Portugal", { explanation: "O Benfica e de Lisboa, capital de Portugal.", sourceUrl: UEFA_CL }),
  q("b4-f-05", "clubes", "facil", "Em que pais fica o clube Juventus?", "Italia", { explanation: "A Juventus e de Turim, no norte da Italia.", sourceUrl: UEFA_CL }),
  q("b4-f-06", "clubes", "facil", "Qual clube e o grande rival do Real Madrid no classico conhecido como \"El Clasico\"?", "Barcelona", { acceptedAnswers: ["fc barcelona", "barca"], explanation: "Real Madrid x Barcelona e o maior classico do futebol espanhol.", sourceUrl: UEFA_CL }),
  q("b4-f-07", "futebol_brasileiro", "facil", "Qual clube paulista manda seus jogos na Vila Belmiro?", "Santos", { acceptedAnswers: ["santos fc"], explanation: "A Vila Belmiro, em Santos, e a casa do clube desde 1916.", sourceUrl: CBF }),
  q("b4-f-08", "clubes", "facil", "Em que pais fica o clube Galatasaray?", "Turquia", { explanation: "O Galatasaray e de Istambul, na Turquia.", sourceUrl: UEFA_CL }),
  q("b4-f-09", "futebol_brasileiro", "facil", "Qual clube gaucho manda seus jogos no estadio Beira-Rio?", "Internacional", { acceptedAnswers: ["inter", "colorado"], explanation: "O Beira-Rio, em Porto Alegre, e a casa do Internacional.", sourceUrl: CBF }),
  q("b4-f-10", "jogadores", "facil", "Por qual selecao Zinedine Zidane jogou?", "Franca", { explanation: "Zidane foi campeao do mundo pela Franca em 1998.", sourceUrl: FIFA }),
  q("b4-f-11", "jogadores", "facil", "Por qual selecao o atacante Zlatan Ibrahimovic jogou?", "Suecia", { explanation: "Ibrahimovic e o maior idolo da selecao sueca.", sourceUrl: UEFA_CL }),
  q("b4-f-12", "jogadores", "facil", "Por qual selecao o atacante Harry Kane joga?", "Inglaterra", { explanation: "Kane e o capitao e principal goleador da Inglaterra.", sourceUrl: FIFA }),
  q("b4-f-13", "jogadores", "facil", "Por qual selecao o atacante Robert Lewandowski joga?", "Polonia", { explanation: "Lewandowski e o maior idolo da selecao polonesa.", sourceUrl: UEFA_CL }),
  q("b4-f-14", "copa_do_mundo", "facil", "Alem de Estados Unidos e Canada, qual pais sediou a Copa do Mundo de 2026?", "Mexico", { explanation: "A Copa de 2026 foi a primeira com tres paises-sede.", sourceUrl: FIFA, seasonRef: "2026" }),
  q("b4-f-15", "futebol_brasileiro", "facil", "Qual clube carioca manda seus jogos no estadio Nilton Santos, o Engenhao?", "Botafogo", { acceptedAnswers: ["fogao"], explanation: "O estadio leva o nome do maior idolo da historia do Botafogo.", sourceUrl: CBF }),
  q("b4-f-16", "futebol_brasileiro", "facil", "Em que cidade jogam Athletico Paranaense e Coritiba, rivais do \"Atletiba\"?", "Curitiba", { explanation: "O Atletiba e o grande classico da capital paranaense.", sourceUrl: CBF }),
  q("b4-f-17", "futebol_brasileiro", "facil", "Em que cidade jogam Bahia e Vitoria, rivais do \"Ba-Vi\"?", "Salvador", { explanation: "O Ba-Vi e o maior classico da capital baiana.", sourceUrl: CBF }),
  q("b4-f-18", "futebol_brasileiro", "facil", "Em que cidade jogam Ceara e Fortaleza, rivais do \"Classico-Rei\"?", "Fortaleza", { explanation: "O Classico-Rei e o maior duelo do futebol cearense.", sourceUrl: CBF }),
  q("b4-f-19", "clubes", "facil", "Em que pais fica o clube Bayern de Munique?", "Alemanha", { explanation: "O Bayern e de Munique, capital da Baviera, na Alemanha.", sourceUrl: UEFA_CL }),

  // ---------- MODERADO (19) ----------
  q("b4-mo-01", "selecoes", "moderado", "Qual selecao e conhecida pelo apelido \"Celeste Olimpica\"?", "Uruguai", { explanation: "O apelido vem dos ouros olimpicos de 1924 e 1928 e da camisa celeste.", sourceUrl: FIFA }),
  q("b4-mo-02", "selecoes", "moderado", "Qual selecao africana e conhecida como \"Leoes Indomaveis\"?", "Camaroes", { explanation: "Camaroes ficou famoso com Roger Milla na Copa de 1990.", sourceUrl: FIFA }),
  q("b4-mo-03", "futebol_brasileiro", "moderado", "O classico \"Majestoso\" opoe o Corinthians a qual clube?", "Sao Paulo", { acceptedAnswers: ["sao paulo fc", "spfc"], explanation: "Majestoso e o nome do classico entre Corinthians e Sao Paulo.", sourceUrl: CBF }),
  q("b4-mo-04", "futebol_brasileiro", "moderado", "O classico \"Choque-Rei\" opoe o Sao Paulo a qual clube?", "Palmeiras", { acceptedAnswers: ["verdao"], explanation: "Choque-Rei e o nome do classico entre Sao Paulo e Palmeiras.", sourceUrl: CBF }),
  q("b4-mo-05", "futebol_brasileiro", "moderado", "O \"Classico dos Milhoes\" opoe o Flamengo a qual clube?", "Vasco da Gama", { acceptedAnswers: ["vasco"], explanation: "Flamengo x Vasco reune as duas maiores torcidas do Rio.", sourceUrl: CBF }),
  q("b4-mo-06", "clubes", "moderado", "Qual clube alemao e famoso pela \"Muralha Amarela\" de sua torcida?", "Borussia Dortmund", { acceptedAnswers: ["dortmund", "bvb"], explanation: "A Muralha Amarela e a arquibancada sul do estadio do Dortmund.", sourceUrl: UEFA_CL }),
  q("b4-mo-07", "futebol_brasileiro", "moderado", "Qual clube foi bicampeao brasileiro em 2013 e 2014?", "Cruzeiro", { acceptedAnswers: ["raposa"], explanation: "O Cruzeiro venceu dois Brasileiroes seguidos com Marcelo Oliveira.", sourceUrl: CBF, seasonRef: "2013-2014" }),
  q("b4-mo-08", "futebol_brasileiro", "moderado", "Qual clube foi campeao brasileiro em 2016, encerrando um jejum de 22 anos?", "Palmeiras", { acceptedAnswers: ["verdao"], explanation: "O Palmeiras de Cuca voltou a ganhar o Brasileirao depois de 1994.", sourceUrl: CBF, seasonRef: "2016" }),
  q("b4-mo-09", "futebol_brasileiro", "moderado", "Qual clube foi campeao brasileiro em 2011?", "Corinthians", { acceptedAnswers: ["timao"], explanation: "O Corinthians de Tite venceu o Brasileirao de 2011.", sourceUrl: CBF, seasonRef: "2011" }),
  q("b4-mo-10", "futebol_brasileiro", "moderado", "Qual clube venceu a Copa do Brasil de 2023, derrotando o Flamengo na final?", "Sao Paulo", { acceptedAnswers: ["sao paulo fc", "spfc"], explanation: "Foi o primeiro titulo de Copa do Brasil da historia do Sao Paulo.", sourceUrl: CBF_CDB, seasonRef: "2023" }),
  q("b4-mo-11", "futebol_brasileiro", "moderado", "Qual clube venceu a Copa do Brasil de 2024, derrotando o Atletico Mineiro na final?", "Flamengo", { acceptedAnswers: ["mengao"], explanation: "O Flamengo venceu os dois jogos da final contra o Atletico.", sourceUrl: CBF_CDB, seasonRef: "2024" }),
  q("b4-mo-12", "competicoes_internacionais", "moderado", "Qual selecao venceu a Copa das Confederacoes de 2017, na Russia?", "Alemanha", { explanation: "A Alemanha, com time alternativo, venceu o Chile por 1 a 0 na final.", sourceUrl: FIFA, seasonRef: "2017" }),
  q("b4-mo-13", "jogadores", "moderado", "Qual jogador brasileiro foi eleito o melhor do mundo pela FIFA e ganhou a Bola de Ouro em 1999?", "Rivaldo", { acceptedAnswers: ["rivaldo vitor borba ferreira"], explanation: "Rivaldo brilhou no Barcelona e levou os dois premios em 1999.", sourceUrl: UEFA_BDO, seasonRef: "1999" }),
  q("b4-mo-14", "jogadores", "moderado", "Qual meio-campista croata ganhou a Bola de Ouro de 2018?", "Luka Modric", { acceptedAnswers: ["modric"], explanation: "Modric quebrou a sequencia de Messi e Cristiano Ronaldo em 2018.", sourceUrl: UEFA_BDO, seasonRef: "2018" }),
  q("b4-mo-15", "competicoes_nacionais", "moderado", "Qual clube venceu a Premier League 2019-20, encerrando um jejum de 30 anos sem titulo ingles?", "Liverpool", { explanation: "O Liverpool de Klopp nao era campeao ingles desde 1990.", sourceUrl: PL, seasonRef: "2019-20" }),
  q("b4-mo-16", "champions_league", "moderado", "Qual tecnico alemao comandou o Liverpool campeao da Liga dos Campeoes de 2019?", "Jurgen Klopp", { acceptedAnswers: ["klopp", "juergen klopp"], explanation: "Klopp venceu o Tottenham por 2 a 0 na final de Madri.", sourceUrl: UEFA_CL, seasonRef: "2018-19" }),
  q("b4-mo-17", "champions_league", "moderado", "Qual tecnico italiano comandou o Real Madrid nos titulos da Liga dos Campeoes de 2022 e 2024?", "Carlo Ancelotti", { acceptedAnswers: ["ancelotti"], explanation: "Ancelotti e o tecnico com mais titulos da Liga dos Campeoes.", sourceUrl: UEFA_CL, seasonRef: "2022-2024" }),
  q("b4-mo-18", "jogadores", "moderado", "Por qual clube brasileiro Ronaldo Fenomeno jogou ao voltar ao Brasil, em 2009?", "Corinthians", { acceptedAnswers: ["timao"], explanation: "Ronaldo foi campeao paulista e da Copa do Brasil pelo Corinthians em 2009.", sourceUrl: CBF, seasonRef: "2009" }),
  q("b4-mo-19", "competicoes_internacionais", "moderado", "Qual selecao venceu a Copa America de 2007, goleando a Argentina por 3 a 0 na final?", "Brasil", { explanation: "O Brasil de Dunga venceu a final na Venezuela.", sourceUrl: COPA_AMERICA, seasonRef: "2007" }),

  // ---------- MEDIO (19) ----------
  q("b4-me-01", "selecoes", "medio", "Qual zagueiro foi capitao da Italia campea do mundo em 2006 e ganhou a Bola de Ouro naquele ano?", "Fabio Cannavaro", { acceptedAnswers: ["cannavaro"], explanation: "Cannavaro foi o ultimo defensor a vencer a Bola de Ouro.", sourceUrl: UEFA_BDO, seasonRef: "2006" }),
  q("b4-me-02", "copa_do_mundo", "medio", "Qual atacante uruguaio foi eleito o melhor jogador da Copa do Mundo de 2010?", "Diego Forlan", { acceptedAnswers: ["forlan"], explanation: "Forlan levou o Uruguai ao quarto lugar na Africa do Sul.", sourceUrl: FIFA, seasonRef: "2010" }),
  q("b4-me-03", "jogadores", "medio", "Por qual clube italiano Zico jogou nos anos 80?", "Udinese", { explanation: "Zico jogou pela Udinese entre 1983 e 1985.", sourceUrl: UEFA_CL }),
  q("b4-me-04", "jogadores", "medio", "Em qual clube japones Zico encerrou a carreira de jogador?", "Kashima Antlers", { acceptedAnswers: ["kashima", "sumitomo"], explanation: "Zico e o maior idolo do Kashima Antlers, onde se aposentou.", sourceUrl: FIFA }),
  q("b4-me-05", "futebol_brasileiro", "medio", "Qual e o nome oficial do estadio do Maracana?", "Jornalista Mario Filho", { acceptedAnswers: ["mario filho", "estadio jornalista mario filho"], explanation: "O estadio homenageia o jornalista Mario Filho, que defendeu sua construcao.", sourceUrl: CBF }),
  q("b4-me-06", "futebol_brasileiro", "medio", "Qual clube venceu a Copa do Brasil de 2019, derrotando o Internacional na final?", "Athletico Paranaense", { acceptedAnswers: ["athletico", "athletico-pr", "atletico paranaense", "furacao"], explanation: "Foi o primeiro titulo de Copa do Brasil do Athletico.", sourceUrl: CBF_CDB, seasonRef: "2019" }),
  q("b4-me-07", "futebol_brasileiro", "medio", "Qual clube venceu a Copa do Brasil de 2021, derrotando o Athletico Paranaense na final?", "Atletico Mineiro", { acceptedAnswers: ["atletico-mg", "atletico mg", "galo"], explanation: "O Atletico fez a dobradinha Brasileirao e Copa do Brasil em 2021.", sourceUrl: CBF_CDB, seasonRef: "2021" }),
  q("b4-me-08", "futebol_brasileiro", "medio", "Qual clube venceu a Copa do Brasil de 2020, derrotando o Gremio na final?", "Palmeiras", { acceptedAnswers: ["verdao"], explanation: "A final da edicao de 2020 foi disputada em marco de 2021.", sourceUrl: CBF_CDB, seasonRef: "2020" }),
  q("b4-me-09", "copa_do_mundo", "medio", "Qual atacante brasileiro foi eleito o melhor jogador da Copa do Mundo de 1994?", "Romario", { acceptedAnswers: ["romario de souza faria", "baixinho"], explanation: "Romario fez 5 gols e levou a Bola de Ouro do tetra.", sourceUrl: FIFA, seasonRef: "1994" }),
  q("b4-me-10", "clubes", "medio", "Qual clube Pep Guardiola treinou entre o Barcelona e o Manchester City?", "Bayern de Munique", { acceptedAnswers: ["bayern", "bayern munique"], explanation: "Guardiola comandou o Bayern de 2013 a 2016.", sourceUrl: UEFA_CL }),
  q("b4-me-11", "champions_league", "medio", "Qual tecnico espanhol comandou o Liverpool no \"Milagre de Istambul\", em 2005?", "Rafael Benitez", { acceptedAnswers: ["benitez", "rafa benitez"], explanation: "Benitez virou um 0 a 3 contra o Milan e venceu nos penaltis.", sourceUrl: UEFA_CL, seasonRef: "2004-05" }),
  q("b4-me-12", "clubes", "medio", "Qual tecnico escoces comandou o Manchester United por 26 anos, de 1986 a 2013?", "Alex Ferguson", { acceptedAnswers: ["ferguson", "sir alex ferguson"], explanation: "Ferguson ganhou 13 Premier Leagues e 2 Champions pelo United.", sourceUrl: PL }),
  q("b4-me-13", "jogadores", "medio", "De qual clube o PSG contratou o zagueiro Thiago Silva em 2012?", "Milan", { acceptedAnswers: ["ac milan"], explanation: "Thiago Silva trocou o Milan pelo PSG em 2012.", sourceUrl: UEFA_CL, seasonRef: "2012" }),
  q("b4-me-14", "jogadores", "medio", "Por qual clube brasileiro Casemiro foi revelado antes de ir para o Real Madrid?", "Sao Paulo", { acceptedAnswers: ["sao paulo fc", "spfc"], explanation: "Casemiro saiu da base do Sao Paulo para o Real Madrid em 2013.", sourceUrl: UEFA_CL }),
  q("b4-me-15", "libertadores", "medio", "Quem marcou o gol do titulo do Palmeiras na prorrogacao da final da Libertadores de 2021, contra o Flamengo?", "Deyverson", { explanation: "Deyverson aproveitou erro de Andreas Pereira e o Palmeiras venceu por 2 a 1 em Montevideu.", sourceUrl: CONMEBOL, seasonRef: "2021" }),
  q("b4-me-16", "libertadores", "medio", "Contra qual clube argentino o Gremio venceu a final da Libertadores de 2017?", "Lanus", { explanation: "O Gremio venceu os dois jogos e conquistou o tri.", sourceUrl: CONMEBOL, seasonRef: "2017" }),
  q("b4-me-17", "libertadores", "medio", "Contra qual clube paraguaio o Atletico Mineiro venceu a final da Libertadores de 2013?", "Olimpia", { explanation: "O Galo reverteu o 0 a 2 no Mineirao e venceu nos penaltis.", sourceUrl: CONMEBOL, seasonRef: "2013" }),
  q("b4-me-18", "libertadores", "medio", "Contra qual clube uruguaio o Santos venceu a final da Libertadores de 2011?", "Penarol", { explanation: "O Santos de Neymar venceu por 2 a 1 no Pacaembu.", sourceUrl: CONMEBOL, seasonRef: "2011" }),
  q("b4-me-19", "libertadores", "medio", "Contra qual clube argentino o Corinthians venceu a final da Libertadores de 2012?", "Boca Juniors", { acceptedAnswers: ["boca"], explanation: "Emerson Sheik fez os dois gols da vitoria no Pacaembu.", sourceUrl: CONMEBOL, seasonRef: "2012" }),

  // ---------- DIFICIL (19) ----------
  q("b4-d-01", "copa_do_mundo", "dificil", "Qual jogador portugues foi o artilheiro da Copa do Mundo de 1966, com 9 gols?", "Eusebio", { acceptedAnswers: ["eusebio da silva ferreira", "pantera negra"], explanation: "Eusebio levou Portugal ao terceiro lugar na Inglaterra.", sourceUrl: WC_GOLDEN_BOOT, seasonRef: "1966" }),
  q("b4-d-02", "copa_do_mundo", "dificil", "Qual jogador polones foi o artilheiro da Copa do Mundo de 1974, com 7 gols?", "Grzegorz Lato", { acceptedAnswers: ["lato"], explanation: "Lato levou a Polonia ao terceiro lugar na Alemanha Ocidental.", sourceUrl: WC_GOLDEN_BOOT, seasonRef: "1974" }),
  q("b4-d-03", "copa_do_mundo", "dificil", "Qual jogador argentino foi o artilheiro da Copa do Mundo de 1978, marcando inclusive dois gols na final?", "Mario Kempes", { acceptedAnswers: ["kempes"], explanation: "Kempes fez 6 gols, dois deles na final contra a Holanda.", sourceUrl: WC_GOLDEN_BOOT, seasonRef: "1978" }),
  q("b4-d-04", "copa_do_mundo", "dificil", "Qual jogador ingles foi o artilheiro da Copa do Mundo de 1986, com 6 gols?", "Gary Lineker", { acceptedAnswers: ["lineker"], explanation: "Lineker ganhou a artilharia no Mexico.", sourceUrl: WC_GOLDEN_BOOT, seasonRef: "1986" }),
  q("b4-d-05", "selecoes", "dificil", "Quem era o tecnico da Inglaterra campea da Copa do Mundo de 1966?", "Alf Ramsey", { acceptedAnswers: ["ramsey", "alfred ramsey"], explanation: "Sir Alf Ramsey comandou o unico titulo mundial ingles.", sourceUrl: WC_MANAGERS, seasonRef: "1966" }),
  q("b4-d-06", "selecoes", "dificil", "Quem era o tecnico da selecao brasileira campea da Copa do Mundo de 1958?", "Vicente Feola", { acceptedAnswers: ["feola"], explanation: "Feola comandou o primeiro titulo mundial do Brasil, na Suecia.", sourceUrl: WC_MANAGERS, seasonRef: "1958" }),
  q("b4-d-07", "selecoes", "dificil", "Quem era o tecnico da selecao brasileira campea da Copa do Mundo de 1962?", "Aymore Moreira", { acceptedAnswers: ["aymore"], explanation: "Aymore Moreira conquistou o bi no Chile.", sourceUrl: WC_MANAGERS, seasonRef: "1962" }),
  q("b4-d-08", "selecoes", "dificil", "Quem era o tecnico da Argentina campea da Copa do Mundo de 1978?", "Cesar Luis Menotti", { acceptedAnswers: ["menotti"], explanation: "Menotti, o Flaco, comandou o primeiro titulo argentino, em casa.", sourceUrl: WC_MANAGERS, seasonRef: "1978" }),
  q("b4-d-09", "selecoes", "dificil", "Quem era o tecnico da Argentina campea da Copa do Mundo de 1986?", "Carlos Bilardo", { acceptedAnswers: ["bilardo", "carlos salvador bilardo"], explanation: "Bilardo montou a Argentina de Maradona campea no Mexico.", sourceUrl: WC_MANAGERS, seasonRef: "1986" }),
  q("b4-d-10", "selecoes", "dificil", "Quem era o tecnico da Italia campea da Copa do Mundo de 2006?", "Marcello Lippi", { acceptedAnswers: ["lippi"], explanation: "Lippi venceu a Franca nos penaltis na final de Berlim.", sourceUrl: WC_MANAGERS, seasonRef: "2006" }),
  q("b4-d-11", "selecoes", "dificil", "Quem era o tecnico da Espanha campea da Copa do Mundo de 2010?", "Vicente del Bosque", { acceptedAnswers: ["del bosque"], explanation: "Del Bosque levou a Espanha ao seu primeiro titulo mundial.", sourceUrl: WC_MANAGERS, seasonRef: "2010" }),
  q("b4-d-12", "selecoes", "dificil", "Quem era o tecnico da Italia campea da Copa do Mundo de 1982?", "Enzo Bearzot", { acceptedAnswers: ["bearzot"], explanation: "Bearzot comandou a Italia de Paolo Rossi na Espanha.", sourceUrl: WC_MANAGERS, seasonRef: "1982" }),
  q("b4-d-13", "selecoes", "dificil", "Quem era o tecnico da Alemanha Ocidental campea da Copa do Mundo de 1990?", "Franz Beckenbauer", { acceptedAnswers: ["beckenbauer"], explanation: "Beckenbauer ja tinha sido campeao como capitao em 1974.", sourceUrl: WC_MANAGERS, seasonRef: "1990" }),
  q("b4-d-14", "copa_do_mundo", "dificil", "Qual foi o placar da final da Copa do Mundo de 1954, Alemanha Ocidental contra Hungria, o \"Milagre de Berna\"?", "3 a 2", { acceptedAnswers: ["3x2", "3-2"], explanation: "A Alemanha Ocidental virou sobre a favorita Hungria de Puskas.", sourceUrl: WC_FINALS_BR, seasonRef: "1954" }),
  q("b4-d-15", "copa_do_mundo", "dificil", "Qual foi o placar da final da Copa do Mundo de 1982, Italia contra Alemanha Ocidental?", "3 a 1", { acceptedAnswers: ["3x1", "3-1"], explanation: "Rossi, Tardelli e Altobelli marcaram para a Italia; Breitner descontou.", sourceUrl: WC_FINALS_BR, seasonRef: "1982" }),
  q("b4-d-16", "copa_do_mundo", "dificil", "Quem marcou de penalti o gol do titulo da Alemanha Ocidental na final da Copa do Mundo de 1990, contra a Argentina?", "Andreas Brehme", { acceptedAnswers: ["brehme"], explanation: "Brehme converteu o penalti no fim do jogo e a Alemanha venceu por 1 a 0, em Roma.", sourceUrl: WC_1990_BREHME, seasonRef: "1990" }),
  q("b4-d-17", "champions_league", "dificil", "Quem marcou o gol do Real Madrid na vitoria por 1 a 0 sobre a Juventus, na final da Liga dos Campeoes de 1998?", "Predrag Mijatovic", { acceptedAnswers: ["mijatovic"], explanation: "O gol do montenegrino encerrou um jejum europeu de 32 anos do Real, em Amsterda.", sourceUrl: UCL_1998, seasonRef: "1997-98" }),
  q("b4-d-18", "champions_league", "dificil", "Qual atacante argentino marcou os dois gols da Inter na vitoria por 2 a 0 sobre o Bayern, na final da Liga dos Campeoes de 2010?", "Diego Milito", { acceptedAnswers: ["milito"], explanation: "Milito decidiu a final de Madri e completou a triplice coroa da Inter.", sourceUrl: UCL_2010, seasonRef: "2009-10" }),
  q("b4-d-19", "futebol_europeu", "dificil", "Quem marcou de cabeca o gol da Grecia na vitoria por 1 a 0 sobre Portugal, na final da Eurocopa de 2004?", "Angelos Charisteas", { acceptedAnswers: ["charisteas"], explanation: "Charisteas marcou aos 57 minutos no Estadio da Luz, em Lisboa.", sourceUrl: EURO_2004, seasonRef: "2004" }),

  // ---------- IMPOSSIVEL (24) ----------
  q("b4-i-01", "futebol_brasileiro", "impossivel", "Qual atacante do Atletico Mineiro foi o artilheiro do primeiro Campeonato Brasileiro, em 1971?", "Dario", { acceptedAnswers: ["dada maravilha", "dada", "dario jose dos santos"], explanation: "Dada Maravilha fez 15 gols, incluindo o do titulo contra o Botafogo.", sourceUrl: BR_1971, seasonRef: "1971" }),
  q("b4-i-02", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Atletico Mineiro campeao brasileiro de 1971?", "Tele Santana", { acceptedAnswers: ["tele"], explanation: "Tele conquistou o primeiro Brasileirao da historia pelo Galo.", sourceUrl: BR_COACHES, seasonRef: "1971" }),
  q("b4-i-03", "futebol_brasileiro", "impossivel", "Qual tecnico foi tricampeao brasileiro seguido em 1975, 1976 e 1977, duas vezes pelo Internacional e uma pelo Sao Paulo?", "Rubens Minelli", { acceptedAnswers: ["minelli"], explanation: "Minelli foi o primeiro tecnico a ganhar tres Brasileiroes seguidos.", sourceUrl: BR_COACHES, seasonRef: "1975-1977" }),
  q("b4-i-04", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Guarani campeao brasileiro de 1978?", "Carlos Alberto Silva", { explanation: "O Guarani de Careca e Zenon foi o primeiro campeao do interior.", sourceUrl: BR_COACHES, seasonRef: "1978" }),
  q("b4-i-05", "futebol_brasileiro", "impossivel", "Qual atacante do Vasco foi o artilheiro do Brasileirao de 1974, ano do primeiro titulo nacional do clube?", "Roberto Dinamite", { acceptedAnswers: ["dinamite", "carlos roberto de oliveira"], explanation: "Roberto Dinamite fez 16 gols na campanha do titulo vascaino.", sourceUrl: BR_1974, seasonRef: "1974" }),
  q("b4-i-06", "futebol_brasileiro", "impossivel", "Quem foi o artilheiro do Brasileirao de 1980, com 21 gols, no primeiro titulo nacional do Flamengo?", "Zico", { acceptedAnswers: ["arthur antunes coimbra", "galinho"], explanation: "Zico foi artilheiro e melhor jogador da competicao.", sourceUrl: BR_1980, seasonRef: "1980" }),
  q("b4-i-07", "futebol_brasileiro", "impossivel", "Contra qual clube carioca o Coritiba decidiu e venceu o Brasileirao de 1985?", "Bangu", { explanation: "O Coritiba foi campeao nos penaltis contra o Bangu, no Maracana.", sourceUrl: BR_FINALS, seasonRef: "1985" }),
  q("b4-i-08", "futebol_brasileiro", "impossivel", "Qual clube nordestino foi campeao brasileiro de 1988, decidindo o titulo contra o Internacional?", "Bahia", { acceptedAnswers: ["ec bahia", "esporte clube bahia"], explanation: "O Bahia venceu o Inter por 2 a 1 no placar agregado.", sourceUrl: BR_1988, seasonRef: "1988" }),
  q("b4-i-09", "futebol_brasileiro", "impossivel", "Qual clube catarinense venceu a Copa do Brasil de 1991, com Luiz Felipe Scolari como tecnico?", "Criciuma", { acceptedAnswers: ["criciuma ec", "tigre"], explanation: "Foi o maior titulo da historia do Criciuma.", sourceUrl: CDB_HISTORY, seasonRef: "1991" }),
  q("b4-i-10", "futebol_brasileiro", "impossivel", "Qual clube de Caxias do Sul venceu a Copa do Brasil de 1999?", "Juventude", { acceptedAnswers: ["ec juventude"], explanation: "O Juventude conquistou o titulo nacional mais importante de sua historia.", sourceUrl: CDB_HISTORY, seasonRef: "1999" }),
  q("b4-i-11", "futebol_brasileiro", "impossivel", "Qual clube do ABC paulista venceu a Copa do Brasil de 2004, batendo o Flamengo no Maracana?", "Santo Andre", { acceptedAnswers: ["ec santo andre"], explanation: "O Santo Andre venceu por 2 a 0 no jogo decisivo, no Maracana.", sourceUrl: CDB_HISTORY, seasonRef: "2004" }),
  q("b4-i-12", "futebol_brasileiro", "impossivel", "Qual clube de Jundiai venceu a Copa do Brasil de 2005, derrotando o Fluminense na final?", "Paulista", { acceptedAnswers: ["paulista de jundiai", "paulista fc"], explanation: "Foi o unico titulo nacional da historia do Paulista.", sourceUrl: CDB_HISTORY, seasonRef: "2005" }),
  q("b4-i-13", "libertadores", "impossivel", "Qual clube brasileiro perdeu para o Boca Juniors, nos penaltis, a final da Libertadores de 1977?", "Cruzeiro", { acceptedAnswers: ["raposa"], explanation: "O jogo-desempate terminou 0 a 0 e o Boca venceu por 5 a 4 nos penaltis.", sourceUrl: LIB_1977, seasonRef: "1977" }),
  q("b4-i-14", "libertadores", "impossivel", "Qual clube colombiano perdeu para o Boca Juniors a final da Libertadores de 1978?", "Deportivo Cali", { acceptedAnswers: ["cali"], explanation: "Apos 0 a 0 em Cali, o Boca venceu por 4 a 0 em Buenos Aires.", sourceUrl: LIB_FINALS, seasonRef: "1978" }),
  q("b4-i-15", "libertadores", "impossivel", "Qual clube brasileiro perdeu para o Nacional (URU) a final da Libertadores de 1980?", "Internacional", { acceptedAnswers: ["inter", "colorado"], explanation: "Apos 0 a 0 em Porto Alegre, o Nacional venceu por 1 a 0 em Montevideu.", sourceUrl: LIB_FINALS, seasonRef: "1980" }),
  q("b4-i-16", "libertadores", "impossivel", "Qual clube brasileiro perdeu para o Independiente, em jogo-desempate, a final da Libertadores de 1974?", "Sao Paulo", { acceptedAnswers: ["sao paulo fc", "spfc"], explanation: "O Independiente venceu o desempate por 1 a 0 em Santiago.", sourceUrl: LIB_FINALS, seasonRef: "1974" }),
  q("b4-i-17", "libertadores", "impossivel", "Qual clube peruano perdeu para o Independiente a final da Libertadores de 1972?", "Universitario", { acceptedAnswers: ["universitario de deportes"], explanation: "Apos 0 a 0 em Lima, o Independiente venceu por 2 a 1 em Avellaneda.", sourceUrl: LIB_FINALS, seasonRef: "1972" }),
  q("b4-i-18", "competicoes_internacionais", "impossivel", "Em que cidade o Santos venceu o Benfica por 5 a 2, com tres gols de Pele, no Intercontinental de 1962?", "Lisboa", { explanation: "A goleada no Estadio da Luz garantiu o primeiro titulo mundial do Santos.", sourceUrl: IC_1962, seasonRef: "1962" }),
  q("b4-i-19", "competicoes_internacionais", "impossivel", "Quem marcou de penalti o gol do titulo do Santos no jogo-desempate do Intercontinental de 1963, contra o Milan, no Maracana?", "Dalmo", { acceptedAnswers: ["dalmo gaspar"], explanation: "O lateral Dalmo converteu o penalti e o Santos venceu por 1 a 0.", sourceUrl: IC_1963, seasonRef: "1963" }),
  q("b4-i-20", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Flamengo campeao brasileiro de 1980?", "Claudio Coutinho", { acceptedAnswers: ["coutinho"], explanation: "Coutinho deu ao Flamengo seu primeiro Brasileirao.", sourceUrl: BR_COACHES, seasonRef: "1980" }),
  q("b4-i-21", "futebol_brasileiro", "impossivel", "Quem marcou o gol da vitoria do Gremio por 1 a 0 sobre o Sao Paulo, no Morumbi, que decidiu o Brasileirao de 1981?", "Baltazar", { explanation: "Baltazar matou no peito e chutou no angulo de Waldir Peres.", sourceUrl: BR_1981, seasonRef: "1981" }),
  q("b4-i-22", "futebol_brasileiro", "impossivel", "Qual tecnico foi campeao brasileiro pelo Internacional (1979), pelo Gremio (1981) e pelo Coritiba (1985)?", "Enio Andrade", { acceptedAnswers: ["enio"], explanation: "Enio Andrade venceu o Brasileirao por tres clubes diferentes.", sourceUrl: BR_COACHES, seasonRef: "1979-1985" }),
  q("b4-i-23", "futebol_brasileiro", "impossivel", "Contra qual clube o Flamengo decidiu e venceu o Brasileirao de 1983?", "Santos", { acceptedAnswers: ["santos fc"], explanation: "Foi o segundo titulo brasileiro do Flamengo de Zico.", sourceUrl: BR_FINALS, seasonRef: "1983" }),
  q("b4-i-24", "futebol_brasileiro", "impossivel", "Por qual placar o Cruzeiro goleou o Santos de Pele no primeiro jogo da final da Taca Brasil de 1966, no Mineirao?", "6 a 2", { acceptedAnswers: ["6x2", "6-2"], explanation: "Dirceu Lopes fez tres gols e o Cruzeiro ainda venceu a volta por 3 a 2.", sourceUrl: TACA_1966, seasonRef: "1966" }),
];
