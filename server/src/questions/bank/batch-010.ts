// Question bank, batch 010 (100 questions: 16 facil, 16 moderado, 16 medio,
// 16 dificil, 36 impossivel) -- the last batch, closing 200 per difficulty.
// Same format/loader/idempotency pattern as batch-003.ts -- see
// server/src/questions/bank/PROGRESS.md.
//
// Written by hand (no AI pipeline). Checked against the full text of seed.ts
// and batches 001-009 so no fact is asked again, in either direction. Every
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
const UEFA_EURO = "https://www.uefa.com/uefaeuro/history/";
const CONMEBOL = "https://www.conmebol.com/libertadores/";
const CBF = "https://www.cbf.com.br/futebol-brasileiro/competicoes/campeonato-brasileiro-serie-a";
const PL = "https://www.premierleague.com/history";
const LALIGA = "https://www.laliga.com/en-GB/laliga-easports/history";
const SERIEA = "https://www.legaseriea.it/en";
const BUNDESLIGA = "https://www.bundesliga.com/en/bundesliga/history";

// Sources actually used to verify the dificil/impossivel entries.
const BR_CHAMPS = "https://en.wikipedia.org/wiki/List_of_Brazilian_football_champions";
const BR_TOPS = "https://www.rsssfbrasil.com/tablesae/brtops.htm";
const BR_COACHES = "https://rsssfbrasil.com/miscellaneous/brcoaches.htm";
const LIB_FINALS = "https://rsssf.org/sacups/copalib.html";
const CDB_FINALS = "https://en.wikipedia.org/wiki/Copa_do_Brasil";
const WC_1970 = "https://www.lance.com.br/lancepedia/copa-do-mundo-de-1970-todos-os-resultados-jogos.html";
const WC_1958_SEMI = "https://en.wikipedia.org/wiki/Brazil_v_France_(1958_FIFA_World_Cup)";
const WC_2014_THIRD = "https://trivela.com.br/copa-do-mundo/brasil-0x3-holanda/";
const BALLON_UEFA = "https://www.uefa.com/ballondor/news/0292-1c27056169a7-bc88d1fdba43-1000--ballon-d-or-laureates-who-has-won-football-s-most-prestig";
const UCL_1997 = "https://en.wikipedia.org/wiki/1997_UEFA_Champions_League_final";
const UCL_2005 = "https://en.wikipedia.org/wiki/2005_UEFA_Champions_League_final";
const UCL_2006 = "https://en.wikipedia.org/wiki/2006_UEFA_Champions_League_final";
const UCL_2007 = "https://en.wikipedia.org/wiki/2007_UEFA_Champions_League_final";
const UCL_2009 = "https://en.wikipedia.org/wiki/2009_UEFA_Champions_League_final";
const UCL_2014 = "https://en.wikipedia.org/wiki/2014_UEFA_Champions_League_final";
const EURO_2000 = "https://en.wikipedia.org/wiki/UEFA_Euro_2000_final";

export const batch010: BankQuestion[] = [
  // ---------- FACIL (16) ----------
  q("b10-f-01", "jogadores", "facil", "Por qual selecao o atacante Lamine Yamal joga?", "Espanha", { explanation: "Yamal foi campeao da Eurocopa de 2024 com a Espanha ainda adolescente.", sourceUrl: UEFA_EURO }),
  q("b10-f-02", "jogadores", "facil", "Por qual selecao o meia Florian Wirtz joga?", "Alemanha", { explanation: "Wirtz e uma das estrelas da nova geracao alema.", sourceUrl: UEFA_EURO }),
  q("b10-f-03", "jogadores", "facil", "Por qual selecao o atacante Rafael Leao joga?", "Portugal", { explanation: "Leao e um dos atacantes de Portugal.", sourceUrl: UEFA_EURO }),
  q("b10-f-04", "jogadores", "facil", "Por qual selecao o meia Phil Foden joga?", "Inglaterra", { explanation: "Foden foi revelado pelo Manchester City.", sourceUrl: PL }),
  q("b10-f-05", "jogadores", "facil", "Por qual selecao o atacante Romelu Lukaku joga?", "Belgica", { explanation: "Lukaku e um dos maiores artilheiros da historia da Belgica.", sourceUrl: UEFA_EURO }),
  q("b10-f-06", "jogadores", "facil", "Por qual selecao o meia Christian Eriksen joga?", "Dinamarca", { explanation: "Eriksen e o principal meia da Dinamarca.", sourceUrl: UEFA_EURO }),
  q("b10-f-07", "jogadores", "facil", "Por qual selecao o atacante Federico Chiesa joga?", "Italia", { explanation: "Chiesa foi campeao da Eurocopa de 2020 com a Italia.", sourceUrl: UEFA_EURO }),
  q("b10-f-08", "jogadores", "facil", "Por qual selecao o atacante Memphis Depay joga?", "Holanda", { acceptedAnswers: ["paises baixos"], explanation: "Depay e um dos maiores artilheiros da historia da Holanda.", sourceUrl: UEFA_EURO }),
  q("b10-f-09", "jogadores", "facil", "Por qual selecao o atacante Julian Alvarez joga?", "Argentina", { explanation: "Julian Alvarez foi campeao do mundo com a Argentina em 2022.", sourceUrl: FIFA }),
  q("b10-f-10", "jogadores", "facil", "Por qual selecao o atacante Darwin Nunez joga?", "Uruguai", { explanation: "Darwin Nunez e o centroavante do Uruguai.", sourceUrl: FIFA }),
  q("b10-f-11", "jogadores", "facil", "Por qual selecao o atacante Raul Jimenez joga?", "Mexico", { explanation: "Raul Jimenez e um dos principais atacantes mexicanos.", sourceUrl: FIFA }),
  q("b10-f-12", "jogadores", "facil", "Por qual selecao o volante Arturo Vidal jogou?", "Chile", { explanation: "Vidal foi bicampeao da Copa America pelo Chile.", sourceUrl: FIFA }),
  q("b10-f-13", "futebol_brasileiro", "facil", "Qual clube carioca joga com camisa branca e uma faixa diagonal preta?", "Vasco da Gama", { acceptedAnswers: ["vasco"], explanation: "A faixa diagonal e a cruz de malta sao marcas do Vasco.", sourceUrl: CBF }),
  q("b10-f-14", "futebol_brasileiro", "facil", "Qual clube paulista joga com camisa branca e faixas vermelha e preta no peito?", "Sao Paulo", { acceptedAnswers: ["sao paulo fc", "spfc"], explanation: "As cores do Sao Paulo sao vermelho, branco e preto.", sourceUrl: CBF }),
  q("b10-f-15", "futebol_brasileiro", "facil", "Qual clube mineiro joga com camisa listrada em preto e branco?", "Atletico Mineiro", { acceptedAnswers: ["atletico-mg", "atletico mg", "galo"], explanation: "O Atletico e o alvinegro de Belo Horizonte.", sourceUrl: CBF }),
  q("b10-f-16", "futebol_brasileiro", "facil", "Qual clube gaucho joga com camisa tricolor azul, preta e branca?", "Gremio", { acceptedAnswers: ["imortal"], explanation: "O Gremio e o Tricolor gaucho.", sourceUrl: CBF }),

  // ---------- MODERADO (16) ----------
  q("b10-mo-01", "futebol_brasileiro", "moderado", "Qual clube paranaense e conhecido como \"Coxa\"?", "Coritiba", { explanation: "O apelido vem de \"coxa-branca\", por causa das origens do clube.", sourceUrl: CBF }),
  q("b10-mo-02", "futebol_brasileiro", "moderado", "Qual clube paranaense e conhecido como \"Furacao\"?", "Athletico Paranaense", { acceptedAnswers: ["athletico", "athletico-pr", "atletico paranaense"], explanation: "O Furacao manda seus jogos na Arena da Baixada.", sourceUrl: CBF }),
  q("b10-mo-03", "futebol_brasileiro", "moderado", "Qual clube cearense e conhecido como \"Leao do Pici\"?", "Fortaleza", { acceptedAnswers: ["fortaleza ec"], explanation: "O Pici e o bairro da sede do Fortaleza.", sourceUrl: CBF }),
  q("b10-mo-04", "futebol_brasileiro", "moderado", "Qual clube catarinense e conhecido como \"Tigre\"?", "Criciuma", { acceptedAnswers: ["criciuma ec"], explanation: "O Tigre joga de amarelo, preto e branco.", sourceUrl: CBF }),
  q("b10-mo-05", "futebol_brasileiro", "moderado", "Qual clube paulista e conhecido como \"Massa Bruta\"?", "Bragantino", { acceptedAnswers: ["red bull bragantino"], explanation: "O clube e de Braganca Paulista.", sourceUrl: CBF }),
  q("b10-mo-06", "futebol_brasileiro", "moderado", "Qual clube baiano e conhecido como \"Leao da Barra\"?", "Vitoria", { acceptedAnswers: ["ec vitoria"], explanation: "O Vitoria e o grande rival do Bahia.", sourceUrl: CBF }),
  q("b10-mo-07", "futebol_brasileiro", "moderado", "Qual clube paulista e conhecido como \"Lusa\"?", "Portuguesa", { acceptedAnswers: ["portuguesa de desportos"], explanation: "O clube foi fundado pela colonia portuguesa de Sao Paulo.", sourceUrl: CBF }),
  q("b10-mo-08", "futebol_brasileiro", "moderado", "Qual clube mineiro e conhecido como \"Coelho\"?", "America Mineiro", { acceptedAnswers: ["america-mg", "america mg", "america"], explanation: "O coelho e o mascote do America.", sourceUrl: CBF }),
  q("b10-mo-09", "futebol_brasileiro", "moderado", "Qual clube paraense e conhecido como \"Leao Azul\"?", "Remo", { acceptedAnswers: ["clube do remo"], explanation: "O Remo e o grande rival do Paysandu.", sourceUrl: CBF }),
  q("b10-mo-10", "clubes", "moderado", "Qual clube italiano e conhecido como \"Bianconeri\"?", "Juventus", { acceptedAnswers: ["juve"], explanation: "O apelido vem da camisa branca e preta.", sourceUrl: SERIEA }),
  q("b10-mo-11", "clubes", "moderado", "Qual clube ingles e conhecido como \"Villans\"?", "Aston Villa", { acceptedAnswers: ["villa"], explanation: "O Aston Villa e de Birmingham.", sourceUrl: PL }),
  q("b10-mo-12", "clubes", "moderado", "Qual clube ingles e conhecido como \"Wolves\"?", "Wolverhampton", { acceptedAnswers: ["wolverhampton wanderers"], explanation: "Wolves e a abreviacao de Wolverhampton.", sourceUrl: PL }),
  q("b10-mo-13", "clubes", "moderado", "Qual clube ingles e conhecido como \"Seagulls\"?", "Brighton", { acceptedAnswers: ["brighton & hove albion", "brighton and hove albion"], explanation: "A gaivota e o simbolo do clube do litoral sul ingles.", sourceUrl: PL }),
  q("b10-mo-14", "clubes", "moderado", "Qual clube ingles e conhecido como \"Saints\"?", "Southampton", { explanation: "O clube foi fundado por membros de uma igreja.", sourceUrl: PL }),
  q("b10-mo-15", "clubes", "moderado", "Qual clube alemao e conhecido como \"Die Werkself\", o time da fabrica?", "Bayer Leverkusen", { acceptedAnswers: ["leverkusen"], explanation: "O clube foi fundado por funcionarios da Bayer.", sourceUrl: BUNDESLIGA }),
  q("b10-mo-16", "clubes", "moderado", "Qual clube espanhol e famoso por escalar apenas jogadores bascos?", "Athletic Bilbao", { acceptedAnswers: ["athletic", "athletic club", "bilbao"], explanation: "A politica de cantera basca e tradicao do clube de Bilbao.", sourceUrl: LALIGA }),

  // ---------- MEDIO (16) ----------
  q("b10-me-01", "libertadores", "medio", "Qual clube brasileiro perdeu para o Boca Juniors a final da Libertadores de 2003?", "Santos", { acceptedAnswers: ["santos fc"], explanation: "O Boca venceu os dois jogos da final.", sourceUrl: CONMEBOL, seasonRef: "2003" }),
  q("b10-me-02", "libertadores", "medio", "Qual clube brasileiro perdeu para o Boca Juniors a final da Libertadores de 2007?", "Gremio", { acceptedAnswers: ["imortal"], explanation: "Riquelme comandou o Boca na vitoria nos dois jogos.", sourceUrl: CONMEBOL, seasonRef: "2007" }),
  q("b10-me-03", "libertadores", "medio", "Qual clube brasileiro perdeu nos penaltis a final da Libertadores de 2008, no Maracana?", "Fluminense", { acceptedAnswers: ["flu"], explanation: "A LDU de Quito levou a taca apos a disputa de penaltis.", sourceUrl: CONMEBOL, seasonRef: "2008" }),
  q("b10-me-04", "selecoes", "medio", "Quem foi o tecnico da selecao brasileira na Copa do Mundo de 1990?", "Sebastiao Lazaroni", { acceptedAnswers: ["lazaroni"], explanation: "Lazaroni apostou no esquema com libero.", sourceUrl: FIFA, seasonRef: "1990" }),
  q("b10-me-05", "selecoes", "medio", "Quem foi o tecnico da selecao brasileira na Copa do Mundo de 1978?", "Claudio Coutinho", { acceptedAnswers: ["coutinho"], explanation: "O Brasil terminou invicto, em terceiro lugar.", sourceUrl: FIFA, seasonRef: "1978" }),
  q("b10-me-06", "copa_do_mundo", "medio", "Qual selecao, com Eusebio, eliminou o Brasil na primeira fase da Copa do Mundo de 1966?", "Portugal", { explanation: "Portugal venceu por 3 a 1 em Liverpool.", sourceUrl: FIFA, seasonRef: "1966" }),
  q("b10-me-07", "selecoes", "medio", "Qual goleiro foi o titular do Brasil no tricampeonato de 1970?", "Felix", { acceptedAnswers: ["felix mielli venerando"], explanation: "Felix jogava pelo Fluminense.", sourceUrl: FIFA, seasonRef: "1970" }),
  q("b10-me-08", "selecoes", "medio", "Qual goleiro foi o titular do Brasil no primeiro titulo mundial, em 1958?", "Gilmar", { acceptedAnswers: ["gilmar dos santos neves"], explanation: "Gilmar tambem foi titular no bi de 1962.", sourceUrl: FIFA, seasonRef: "1958" }),
  q("b10-me-09", "selecoes", "medio", "Qual goleiro foi o titular do Brasil na Copa do Mundo de 2006?", "Dida", { explanation: "Dida era o goleiro do Milan naquela epoca.", sourceUrl: FIFA, seasonRef: "2006" }),
  q("b10-me-10", "futebol_brasileiro", "medio", "Qual clube foi vice-campeao do Brasileirao de 2018, atras do Palmeiras?", "Flamengo", { acceptedAnswers: ["mengao"], explanation: "O Palmeiras de Felipao venceu aquele campeonato.", sourceUrl: CBF, seasonRef: "2018" }),
  q("b10-me-11", "futebol_brasileiro", "medio", "Qual clube foi vice-campeao do Brasileirao de 2020, um ponto atras do Flamengo?", "Internacional", { acceptedAnswers: ["inter", "colorado"], explanation: "O titulo foi decidido na ultima rodada.", sourceUrl: CBF, seasonRef: "2020" }),
  q("b10-me-12", "futebol_brasileiro", "medio", "Qual clube foi vice-campeao do Brasileirao de 2024, atras do Botafogo?", "Palmeiras", { acceptedAnswers: ["verdao"], explanation: "O Botafogo confirmou o titulo na ultima rodada.", sourceUrl: CBF, seasonRef: "2024" }),
  q("b10-me-13", "jogadores", "medio", "Por qual clube brasileiro Ronaldinho Gaucho jogou ao voltar do Milan, em 2011?", "Flamengo", { acceptedAnswers: ["mengao"], explanation: "Depois do Flamengo, Ronaldinho foi campeao da Libertadores pelo Atletico Mineiro.", sourceUrl: CBF, seasonRef: "2011" }),
  q("b10-me-14", "jogadores", "medio", "De qual clube espanhol o Barcelona contratou Rivaldo, em 1997?", "Deportivo La Coruna", { acceptedAnswers: ["deportivo", "la coruna"], explanation: "Rivaldo fez uma unica temporada no Deportivo antes do Barcelona.", sourceUrl: LALIGA, seasonRef: "1997" }),
  q("b10-me-15", "jogadores", "medio", "Por qual clube holandes Romario jogou antes de ir para o Barcelona?", "PSV", { acceptedAnswers: ["psv eindhoven"], explanation: "Romario foi artilheiro do campeonato holandes pelo PSV.", sourceUrl: UEFA_CL }),
  q("b10-me-16", "jogadores", "medio", "Por qual clube ingles o meia Juninho Paulista brilhou nos anos 90?", "Middlesbrough", { explanation: "Juninho virou idolo do Middlesbrough.", sourceUrl: PL }),

  // ---------- DIFICIL (16) ----------
  q("b10-d-01", "copa_do_mundo", "dificil", "Qual foi o placar da semifinal Italia x Alemanha Ocidental na Copa de 1970, o \"Jogo do Seculo\"?", "4 a 3", { acceptedAnswers: ["4x3", "4-3"], explanation: "Cinco dos sete gols sairam na prorrogacao, no Azteca; Rivera fez o gol da vitoria.", sourceUrl: WC_1970, seasonRef: "1970" }),
  q("b10-d-02", "copa_do_mundo", "dificil", "Qual foi o placar da semifinal Brasil x Uruguai na Copa do Mundo de 1970, em Guadalajara?", "3 a 1", { acceptedAnswers: ["3x1", "3-1"], explanation: "O jogo foi visto como uma revanche do Maracanazo.", sourceUrl: WC_1970, seasonRef: "1970" }),
  q("b10-d-03", "copa_do_mundo", "dificil", "Qual foi o placar da semifinal Brasil x Franca na Copa do Mundo de 1958?", "5 a 2", { acceptedAnswers: ["5x2", "5-2"], explanation: "Pele marcou tres gols na semifinal em Solna.", sourceUrl: WC_1958_SEMI, seasonRef: "1958" }),
  q("b10-d-04", "copa_do_mundo", "dificil", "Qual foi o placar da disputa de terceiro lugar entre Brasil e Holanda na Copa do Mundo de 2014?", "3 a 0 para a Holanda", { acceptedAnswers: ["3 a 0", "3x0", "3-0", "0 a 3"], explanation: "O jogo foi em Brasilia, quatro dias depois do 7 a 1.", sourceUrl: WC_2014_THIRD, seasonRef: "2014" }),
  q("b10-d-05", "jogadores", "dificil", "Quantas Bolas de Ouro o alemao Franz Beckenbauer conquistou?", "2", { acceptedAnswers: ["duas", "dois"], explanation: "Beckenbauer venceu em 1972 e 1976, pelo Bayern.", sourceUrl: BALLON_UEFA }),
  q("b10-d-06", "jogadores", "dificil", "Qual atacante do Bayern ganhou a Bola de Ouro em 1980 e em 1981?", "Karl-Heinz Rummenigge", { acceptedAnswers: ["rummenigge"], explanation: "Em 1981, seu companheiro Paul Breitner ficou em segundo.", sourceUrl: BALLON_UEFA, seasonRef: "1980-1981" }),
  q("b10-d-07", "champions_league", "dificil", "Qual atacante alemao marcou dois gols pelo Dortmund na final da Liga dos Campeoes de 1997, contra a Juventus?", "Karl-Heinz Riedle", { acceptedAnswers: ["riedle"], explanation: "Riedle marcou aos 29 e aos 34 minutos.", sourceUrl: UCL_1997, seasonRef: "1996-97" }),
  q("b10-d-08", "champions_league", "dificil", "Qual atacante italiano descontou para a Juventus na final da Liga dos Campeoes de 1997?", "Alessandro Del Piero", { acceptedAnswers: ["del piero"], explanation: "Del Piero marcou de calcanhar, mas o Dortmund venceu por 3 a 1.", sourceUrl: UCL_1997, seasonRef: "1996-97" }),
  q("b10-d-09", "champions_league", "dificil", "Qual capitao do Liverpool iniciou a reacao com um gol de cabeca na final da Liga dos Campeoes de 2005?", "Steven Gerrard", { acceptedAnswers: ["gerrard"], explanation: "Gerrard, Smicer e Xabi Alonso empataram em seis minutos.", sourceUrl: UCL_2005, seasonRef: "2004-05" }),
  q("b10-d-10", "champions_league", "dificil", "Qual lateral brasileiro marcou o gol da virada do Barcelona na final da Liga dos Campeoes de 2006, contra o Arsenal?", "Juliano Belletti", { acceptedAnswers: ["belletti"], explanation: "Eto'o empatou e Belletti virou para 2 a 1 em Saint-Denis.", sourceUrl: UCL_2006, seasonRef: "2005-06" }),
  q("b10-d-11", "champions_league", "dificil", "Qual atacante italiano marcou os dois gols do Milan na final da Liga dos Campeoes de 2007, contra o Liverpool?", "Filippo Inzaghi", { acceptedAnswers: ["inzaghi", "pippo inzaghi"], explanation: "O primeiro gol foi um desvio em cobranca de falta de Pirlo.", sourceUrl: UCL_2007, seasonRef: "2006-07" }),
  q("b10-d-12", "champions_league", "dificil", "Qual atacante camaronense abriu o placar aos 10 minutos da final da Liga dos Campeoes de 2009, contra o Manchester United?", "Samuel Eto'o", { acceptedAnswers: ["etoo", "eto'o"], explanation: "Messi fechou o 2 a 0 no segundo tempo, em Roma.", sourceUrl: UCL_2009, seasonRef: "2008-09" }),
  q("b10-d-13", "champions_league", "dificil", "Quem marcou de cabeca o segundo gol do Barcelona na final da Liga dos Campeoes de 2009?", "Lionel Messi", { acceptedAnswers: ["messi"], explanation: "Foi um raro gol de cabeca de Messi, sobre Rio Ferdinand.", sourceUrl: UCL_2009, seasonRef: "2008-09" }),
  q("b10-d-14", "champions_league", "dificil", "Qual lateral brasileiro marcou o terceiro gol do Real Madrid na prorrogacao da final da Liga dos Campeoes de 2014?", "Marcelo", { acceptedAnswers: ["marcelo vieira"], explanation: "O Real venceu o Atletico por 4 a 1 em Lisboa.", sourceUrl: UCL_2014, seasonRef: "2013-14" }),
  q("b10-d-15", "champions_league", "dificil", "Qual zagueiro uruguaio abriu o placar para o Atletico de Madrid na final da Liga dos Campeoes de 2014?", "Diego Godin", { acceptedAnswers: ["godin"], explanation: "O Atletico vencia ate os acrescimos, quando Ramos empatou.", sourceUrl: UCL_2014, seasonRef: "2013-14" }),
  q("b10-d-16", "futebol_europeu", "dificil", "Qual atacante frances empatou nos acrescimos a final da Eurocopa de 2000, contra a Italia?", "Sylvain Wiltord", { acceptedAnswers: ["wiltord"], explanation: "Wiltord marcou no quarto minuto de acrescimo e Trezeguet decidiu na prorrogacao.", sourceUrl: EURO_2000, seasonRef: "2000" }),

  // ---------- IMPOSSIVEL (36) ----------
  q("b10-i-01", "futebol_brasileiro", "impossivel", "Qual clube foi o vice-campeao do primeiro Campeonato Brasileiro, em 1971?", "Sao Paulo", { acceptedAnswers: ["sao paulo fc", "spfc"], explanation: "O triangular final teve Atletico Mineiro, Sao Paulo e Botafogo.", sourceUrl: BR_CHAMPS, seasonRef: "1971" }),
  q("b10-i-02", "futebol_brasileiro", "impossivel", "Qual clube carioca foi vice-campeao brasileiro em 1972, atras do Palmeiras?", "Botafogo", { acceptedAnswers: ["fogao"], explanation: "O Palmeiras conquistou ali o primeiro de seus dois titulos seguidos.", sourceUrl: BR_CHAMPS, seasonRef: "1972" }),
  q("b10-i-03", "futebol_brasileiro", "impossivel", "Qual clube mineiro perdeu para o Vasco a decisao do Brasileirao de 1974?", "Cruzeiro", { acceptedAnswers: ["raposa"], explanation: "O Vasco venceu por 2 a 1 no Maracana.", sourceUrl: BR_CHAMPS, seasonRef: "1974" }),
  q("b10-i-04", "futebol_brasileiro", "impossivel", "Qual clube paulista foi vice-campeao brasileiro em 1976, atras do Internacional?", "Corinthians", { acceptedAnswers: ["timao"], explanation: "Foi o bicampeonato seguido do Inter de Minelli.", sourceUrl: BR_CHAMPS, seasonRef: "1976" }),
  q("b10-i-05", "futebol_brasileiro", "impossivel", "Qual clube foi vice-campeao brasileiro em 1977 e tambem em 1980?", "Atletico Mineiro", { acceptedAnswers: ["atletico-mg", "atletico mg", "galo"], explanation: "Perdeu para o Sao Paulo em 1977 e para o Flamengo em 1980.", sourceUrl: BR_CHAMPS, seasonRef: "1977-1980" }),
  q("b10-i-06", "futebol_brasileiro", "impossivel", "Qual clube paulista perdeu para o Guarani a decisao do Brasileirao de 1978?", "Palmeiras", { acceptedAnswers: ["verdao"], explanation: "Foi o primeiro titulo brasileiro de um clube do interior.", sourceUrl: BR_CHAMPS, seasonRef: "1978" }),
  q("b10-i-07", "futebol_brasileiro", "impossivel", "Qual clube carioca perdeu para o Internacional a decisao do Brasileirao de 1979?", "Vasco da Gama", { acceptedAnswers: ["vasco"], explanation: "O Inter terminou aquele campeonato invicto.", sourceUrl: BR_CHAMPS, seasonRef: "1979" }),
  q("b10-i-08", "futebol_brasileiro", "impossivel", "Qual clube gaucho perdeu para o Flamengo a decisao do Brasileirao de 1982?", "Gremio", { acceptedAnswers: ["imortal"], explanation: "Foi o segundo titulo brasileiro do Flamengo de Zico.", sourceUrl: BR_CHAMPS, seasonRef: "1982" }),
  q("b10-i-09", "futebol_brasileiro", "impossivel", "Qual clube carioca perdeu para o Fluminense a decisao do Brasileirao de 1984?", "Vasco da Gama", { acceptedAnswers: ["vasco"], explanation: "Foi uma final carioca entre Fluminense e Vasco.", sourceUrl: BR_CHAMPS, seasonRef: "1984" }),
  q("b10-i-10", "futebol_brasileiro", "impossivel", "Qual clube de Campinas perdeu para o Sao Paulo a decisao do Brasileirao de 1986?", "Guarani", { explanation: "A final foi decidida nos penaltis.", sourceUrl: BR_CHAMPS, seasonRef: "1986" }),
  q("b10-i-11", "futebol_brasileiro", "impossivel", "Qual clube baiano foi vice-campeao brasileiro em 1993, atras do Palmeiras?", "Vitoria", { acceptedAnswers: ["ec vitoria"], explanation: "O Palmeiras venceu a decisao contra o clube baiano.", sourceUrl: BR_CHAMPS, seasonRef: "1993" }),
  q("b10-i-12", "futebol_brasileiro", "impossivel", "Qual clube foi vice-campeao brasileiro em 1994, para o Palmeiras, e em 2002, para o Santos?", "Corinthians", { acceptedAnswers: ["timao"], explanation: "As duas finais foram classicos paulistas.", sourceUrl: BR_CHAMPS, seasonRef: "1994-2002" }),
  q("b10-i-13", "futebol_brasileiro", "impossivel", "Qual clube paulista perdeu para o Gremio a decisao do Brasileirao de 1996?", "Portuguesa", { acceptedAnswers: ["lusa"], explanation: "Foi o segundo titulo brasileiro do Gremio.", sourceUrl: BR_CHAMPS, seasonRef: "1996" }),
  q("b10-i-14", "futebol_brasileiro", "impossivel", "Qual clube paulista perdeu para o Vasco a decisao do Brasileirao de 1997?", "Palmeiras", { acceptedAnswers: ["verdao"], explanation: "O Vasco de Edmundo foi campeao com dois empates na final.", sourceUrl: BR_CHAMPS, seasonRef: "1997" }),
  q("b10-i-15", "futebol_brasileiro", "impossivel", "Qual clube mineiro perdeu para o Corinthians a decisao do Brasileirao de 1998?", "Cruzeiro", { acceptedAnswers: ["raposa"], explanation: "Foi o primeiro titulo do bi corintiano de 1998 e 1999.", sourceUrl: BR_CHAMPS, seasonRef: "1998" }),
  q("b10-i-16", "futebol_brasileiro", "impossivel", "Qual clube mineiro perdeu para o Corinthians a decisao do Brasileirao de 1999?", "Atletico Mineiro", { acceptedAnswers: ["atletico-mg", "atletico mg", "galo"], explanation: "O Atletico tinha o artilheiro do campeonato, Guilherme.", sourceUrl: BR_CHAMPS, seasonRef: "1999" }),
  q("b10-i-17", "futebol_brasileiro", "impossivel", "Qual clube do ABC paulista foi vice-campeao brasileiro em 2000 e em 2001?", "Sao Caetano", { acceptedAnswers: ["ad sao caetano", "azulao"], explanation: "Perdeu para o Vasco em 2000 e para o Atletico Paranaense em 2001.", sourceUrl: BR_CHAMPS, seasonRef: "2000-2001" }),
  q("b10-i-18", "futebol_brasileiro", "impossivel", "Qual clube gaucho venceu a Copa do Brasil de 1992, derrotando o Fluminense na final?", "Internacional", { acceptedAnswers: ["inter", "colorado"], explanation: "Foi o primeiro titulo de Copa do Brasil do Inter.", sourceUrl: CDB_FINALS, seasonRef: "1992" }),
  q("b10-i-19", "futebol_brasileiro", "impossivel", "Qual clube cearense perdeu para o Gremio a final da Copa do Brasil de 1994?", "Ceara", { acceptedAnswers: ["ceara sc", "vozao"], explanation: "Foi o segundo titulo de Copa do Brasil do Gremio.", sourceUrl: CDB_FINALS, seasonRef: "1994" }),
  q("b10-i-20", "futebol_brasileiro", "impossivel", "Qual clube venceu a Copa do Brasil de 1995, derrotando o Gremio na final?", "Corinthians", { acceptedAnswers: ["timao"], explanation: "Foi o primeiro titulo de Copa do Brasil do Corinthians.", sourceUrl: CDB_FINALS, seasonRef: "1995" }),
  q("b10-i-21", "futebol_brasileiro", "impossivel", "Qual clube venceu a Copa do Brasil de 1997, derrotando o Flamengo na final?", "Gremio", { acceptedAnswers: ["imortal"], explanation: "Foi o terceiro titulo de Copa do Brasil do Gremio.", sourceUrl: CDB_FINALS, seasonRef: "1997" }),
  q("b10-i-22", "futebol_brasileiro", "impossivel", "Qual clube venceu a Copa do Brasil de 1998, derrotando o Cruzeiro na final?", "Palmeiras", { acceptedAnswers: ["verdao"], explanation: "O titulo abriu caminho para a Libertadores de 1999 do Palmeiras.", sourceUrl: CDB_FINALS, seasonRef: "1998" }),
  q("b10-i-23", "futebol_brasileiro", "impossivel", "Qual clube carioca perdeu para o Juventude a final da Copa do Brasil de 1999?", "Botafogo", { acceptedAnswers: ["fogao"], explanation: "O Juventude conquistou o maior titulo de sua historia.", sourceUrl: CDB_FINALS, seasonRef: "1999" }),
  q("b10-i-24", "futebol_brasileiro", "impossivel", "Qual clube venceu a Copa do Brasil de 2000, derrotando o Sao Paulo na final?", "Cruzeiro", { acceptedAnswers: ["raposa"], explanation: "Foi o terceiro titulo de Copa do Brasil do Cruzeiro.", sourceUrl: CDB_FINALS, seasonRef: "2000" }),
  q("b10-i-25", "futebol_brasileiro", "impossivel", "Qual clube gaucho perdeu para o Corinthians a final da Copa do Brasil de 2009?", "Internacional", { acceptedAnswers: ["inter", "colorado"], explanation: "Era o Corinthians de Ronaldo.", sourceUrl: CDB_FINALS, seasonRef: "2009" }),
  q("b10-i-26", "futebol_brasileiro", "impossivel", "Qual clube paulista perdeu para o Palmeiras, nos penaltis, a final da Copa do Brasil de 2015?", "Santos", { acceptedAnswers: ["santos fc"], explanation: "O goleiro Fernando Prass converteu a cobranca decisiva.", sourceUrl: CDB_FINALS, seasonRef: "2015" }),
  q("b10-i-27", "libertadores", "impossivel", "Qual clube uruguaio perdeu para o Estudiantes a final da Libertadores de 1969?", "Nacional", { acceptedAnswers: ["nacional de montevideu", "nacional de montevideo"], explanation: "O Estudiantes venceu os dois jogos.", sourceUrl: LIB_FINALS, seasonRef: "1969" }),
  q("b10-i-28", "libertadores", "impossivel", "Qual clube uruguaio perdeu para o Estudiantes a final da Libertadores de 1970?", "Penarol", { explanation: "O Estudiantes venceu por 1 a 0 em casa e segurou o 0 a 0 em Montevideu.", sourceUrl: LIB_FINALS, seasonRef: "1970" }),
  q("b10-i-29", "libertadores", "impossivel", "Qual clube chileno perdeu para o Penarol a final da Libertadores de 1982?", "Cobreloa", { explanation: "Foi o segundo vice seguido do Cobreloa.", sourceUrl: LIB_FINALS, seasonRef: "1982" }),
  q("b10-i-30", "libertadores", "impossivel", "Qual clube paraguaio perdeu para o San Lorenzo a final da Libertadores de 2014?", "Nacional", { acceptedAnswers: ["club nacional", "nacional de assuncao"], explanation: "Foi o primeiro titulo de Libertadores do San Lorenzo.", sourceUrl: LIB_FINALS, seasonRef: "2014" }),
  q("b10-i-31", "libertadores", "impossivel", "Qual clube equatoriano perdeu para o Atletico Nacional a final da Libertadores de 2016?", "Independiente del Valle", { acceptedAnswers: ["del valle"], explanation: "O Atletico Nacional empatou em 1 a 1 fora e venceu por 1 a 0 em Medellin.", sourceUrl: LIB_FINALS, seasonRef: "2016" }),
  q("b10-i-32", "futebol_brasileiro", "impossivel", "Qual clube venceu a Taca Brasil de 1960, tendo Oswaldo Brandao como tecnico?", "Palmeiras", { acceptedAnswers: ["verdao"], explanation: "Foi o primeiro titulo nacional do Palmeiras.", sourceUrl: BR_COACHES, seasonRef: "1960" }),
  q("b10-i-33", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Palmeiras campeao do primeiro Torneio Roberto Gomes Pedrosa, em 1967?", "Aymore Moreira", { acceptedAnswers: ["aymore"], explanation: "Naquele ano o Palmeiras tambem venceu a Taca Brasil.", sourceUrl: BR_COACHES, seasonRef: "1967" }),
  q("b10-i-34", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Palmeiras campeao do Torneio Roberto Gomes Pedrosa de 1969?", "Rubens Minelli", { acceptedAnswers: ["minelli"], explanation: "Minelli ainda seria tricampeao brasileiro nos anos 70.", sourceUrl: BR_COACHES, seasonRef: "1969" }),
  q("b10-i-35", "futebol_brasileiro", "impossivel", "Quantos gols Tulio marcou pelo Botafogo no Brasileirao de 1995?", "23", { acceptedAnswers: ["vinte e tres"], explanation: "Tulio foi artilheiro e campeao com o Botafogo.", sourceUrl: BR_TOPS, seasonRef: "1995" }),
  q("b10-i-36", "futebol_brasileiro", "impossivel", "Quantos gols Romario marcou pelo Vasco no Brasileirao de 2005, aos 39 anos?", "22", { acceptedAnswers: ["vinte e dois"], explanation: "Romario foi o artilheiro do campeonato.", sourceUrl: BR_TOPS, seasonRef: "2005" }),
];
