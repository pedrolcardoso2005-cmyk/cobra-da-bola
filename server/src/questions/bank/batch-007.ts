// Question bank, batch 007 (100 questions: 19 facil, 19 moderado, 19 medio,
// 19 dificil, 24 impossivel). Same format/loader/idempotency pattern as
// batch-003.ts -- see server/src/questions/bank/PROGRESS.md.
//
// Written by hand (no AI pipeline). Checked against the full text of seed.ts
// and batches 001-006 so no fact is asked again, in either direction. Every
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
const UEFA_NL = "https://www.uefa.com/uefanationsleague/history/";
const CONMEBOL = "https://www.conmebol.com/libertadores/";
const CBF = "https://www.cbf.com.br/futebol-brasileiro/competicoes/campeonato-brasileiro-serie-a";
const CBF_CDB = "https://www.cbf.com.br/futebol-brasileiro/competicoes/copa-brasil-masculino";
const PL = "https://www.premierleague.com/history";
const LALIGA = "https://www.laliga.com/en-GB/laliga-easports/history";
const BUNDESLIGA = "https://www.bundesliga.com/en/bundesliga/history";

// Sources actually used to verify the dificil/impossivel entries.
const BR_TOPS = "https://www.rsssfbrasil.com/tablesae/brtops.htm";
const BR_COACHES = "https://rsssfbrasil.com/miscellaneous/brcoaches.htm";
const LIB_FINALS = "https://rsssf.org/sacups/copalib.html";
const CDB_FINALS = "https://en.wikipedia.org/wiki/Copa_do_Brasil";
const EURO_FINALS = "https://en.wikipedia.org/wiki/List_of_UEFA_European_Championship_finals";
const UCL_FINALS = "https://en.wikipedia.org/wiki/List_of_European_Cup_and_UEFA_Champions_League_finals";
const CA_FINALS = "https://en.wikipedia.org/wiki/List_of_Copa_Am%C3%A9rica_finals";

export const batch007: BankQuestion[] = [
  // ---------- FACIL (19) ----------
  q("b7-f-01", "jogadores", "facil", "Por qual selecao o meia Bruno Fernandes joga?", "Portugal", { explanation: "Bruno Fernandes e um dos lideres de Portugal ao lado de Cristiano Ronaldo.", sourceUrl: UEFA_EURO }),
  q("b7-f-02", "jogadores", "facil", "Por qual selecao o meia Jamal Musiala joga?", "Alemanha", { explanation: "Musiala escolheu defender a Alemanha, apesar de ter jogado na base inglesa.", sourceUrl: UEFA_EURO }),
  q("b7-f-03", "jogadores", "facil", "Por qual selecao o atacante Bukayo Saka joga?", "Inglaterra", { explanation: "Saka e titular da Inglaterra e idolo do Arsenal.", sourceUrl: UEFA_EURO }),
  q("b7-f-04", "jogadores", "facil", "Por qual selecao o atacante Dusan Vlahovic joga?", "Servia", { explanation: "Vlahovic e o principal centroavante da Servia.", sourceUrl: UEFA_EURO }),
  q("b7-f-05", "jogadores", "facil", "Por qual selecao o meia Mohammed Kudus joga?", "Gana", { explanation: "Kudus e a principal estrela da selecao de Gana.", sourceUrl: FIFA }),
  q("b7-f-06", "jogadores", "facil", "Por qual selecao o volante Granit Xhaka joga?", "Suica", { explanation: "Xhaka foi capitao da Suica em varias Copas e Eurocopas.", sourceUrl: UEFA_EURO }),
  q("b7-f-07", "jogadores", "facil", "Por qual selecao o atacante Hirving Lozano joga?", "Mexico", { explanation: "Lozano marcou o gol da vitoria do Mexico sobre a Alemanha na Copa de 2018.", sourceUrl: FIFA }),
  q("b7-f-08", "jogadores", "facil", "Por qual selecao o lateral Alphonso Davies joga?", "Canada", { explanation: "Davies e o maior nome da historia recente do Canada.", sourceUrl: FIFA }),
  q("b7-f-09", "jogadores", "facil", "Por qual selecao o atacante Edinson Cavani jogou?", "Uruguai", { explanation: "Cavani formou dupla historica com Luis Suarez no Uruguai.", sourceUrl: FIFA }),
  q("b7-f-10", "clubes", "facil", "Em que cidade espanhola jogam Sevilla e Betis?", "Sevilha", { acceptedAnswers: ["sevilla"], explanation: "Sevilla x Betis e o grande classico da Andaluzia.", sourceUrl: LALIGA }),
  q("b7-f-11", "clubes", "facil", "Em que cidade portuguesa jogam o Porto e o Boavista?", "Porto", { explanation: "Os dois clubes sao da segunda maior cidade de Portugal.", sourceUrl: UEFA_CL }),
  q("b7-f-12", "clubes", "facil", "Em que cidade jogam Arsenal, Chelsea e Tottenham?", "Londres", { acceptedAnswers: ["london"], explanation: "Londres concentra varios clubes da Premier League.", sourceUrl: PL }),
  q("b7-f-13", "futebol_brasileiro", "facil", "Em que cidade fica o estadio Mane Garrincha?", "Brasilia", { explanation: "O estadio da capital federal foi uma das sedes da Copa de 2014.", sourceUrl: CBF }),
  q("b7-f-14", "selecoes", "facil", "Qual e a cor tradicional da camisa titular da selecao da Alemanha?", "Branca", { acceptedAnswers: ["branco"], explanation: "A Alemanha joga de camisa branca e calcao preto.", sourceUrl: FIFA }),
  q("b7-f-15", "clubes", "facil", "Quais sao as cores tradicionais da camisa do Barcelona?", "Azul e grena", { acceptedAnswers: ["blaugrana", "azul-grena", "grena e azul"], explanation: "Blaugrana e o apelido que vem dessas cores.", sourceUrl: LALIGA }),
  q("b7-f-16", "clubes", "facil", "Qual e a cor tradicional da camisa titular do Liverpool?", "Vermelha", { acceptedAnswers: ["vermelho"], explanation: "O Liverpool e conhecido como \"The Reds\".", sourceUrl: PL }),
  q("b7-f-17", "clubes", "facil", "Quais sao as cores tradicionais da camisa do Boca Juniors?", "Azul e amarelo", { acceptedAnswers: ["azul e ouro", "amarelo e azul"], explanation: "A camisa azul com faixa amarela e marca registrada do Boca.", sourceUrl: CONMEBOL }),
  q("b7-f-18", "futebol_brasileiro", "facil", "Qual e a cor tradicional do uniforme titular do Santos?", "Branca", { acceptedAnswers: ["branco", "todo branco"], explanation: "O Santos joga tradicionalmente todo de branco.", sourceUrl: CBF }),
  q("b7-f-19", "futebol_brasileiro", "facil", "Quais sao as tres cores tradicionais do Fluminense?", "Verde, branco e grena", { acceptedAnswers: ["grena, verde e branco", "tricolor", "verde branco e grena"], explanation: "As tres cores dao ao clube o apelido de Tricolor.", sourceUrl: CBF }),

  // ---------- MODERADO (19) ----------
  q("b7-mo-01", "jogadores", "moderado", "Por qual selecao o goleiro Jan Oblak joga?", "Eslovenia", { explanation: "Oblak e um dos maiores goleiros da historia do Atletico de Madrid.", sourceUrl: UEFA_EURO }),
  q("b7-mo-02", "jogadores", "moderado", "Por qual selecao o atacante Riyad Mahrez jogou?", "Argelia", { explanation: "Mahrez foi campeao africano com a Argelia em 2019.", sourceUrl: FIFA }),
  q("b7-mo-03", "jogadores", "moderado", "Por qual selecao o atacante Enner Valencia joga?", "Equador", { explanation: "Enner Valencia marcou o primeiro gol da Copa de 2022, contra o Catar.", sourceUrl: FIFA }),
  q("b7-mo-04", "clubes", "moderado", "Qual clube e o rival do Barcelona no derbi da cidade de Barcelona?", "Espanyol", { explanation: "Barcelona x Espanyol e o derbi barcelones.", sourceUrl: LALIGA }),
  q("b7-mo-05", "futebol_brasileiro", "moderado", "Qual clube pernambucano e conhecido como \"Leao da Ilha\"?", "Sport", { acceptedAnswers: ["sport recife", "sport club do recife"], explanation: "O apelido vem do estadio da Ilha do Retiro.", sourceUrl: CBF }),
  q("b7-mo-06", "futebol_brasileiro", "moderado", "Qual clube cearense e conhecido como \"Vozao\"?", "Ceara", { acceptedAnswers: ["ceara sc"], explanation: "Vozao e o apelido mais popular do Ceara Sporting Club.", sourceUrl: CBF }),
  q("b7-mo-07", "futebol_brasileiro", "moderado", "Em que cidade jogam Sampaio Correa e Moto Club?", "Sao Luis", { explanation: "Os dois sao os grandes rivais da capital maranhense.", sourceUrl: CBF }),
  q("b7-mo-08", "futebol_brasileiro", "moderado", "Qual clube foi bicampeao brasileiro em 1998 e 1999?", "Corinthians", { acceptedAnswers: ["timao"], explanation: "O Corinthians de Marcelinho e Rincon venceu dois Brasileiroes seguidos.", sourceUrl: CBF, seasonRef: "1998-1999" }),
  q("b7-mo-09", "futebol_brasileiro", "moderado", "Qual clube venceu a Copa do Brasil de 2006, derrotando o Vasco na final?", "Flamengo", { acceptedAnswers: ["mengao"], explanation: "O Flamengo venceu os dois jogos da final.", sourceUrl: CBF_CDB, seasonRef: "2006" }),
  q("b7-mo-10", "futebol_brasileiro", "moderado", "Qual clube venceu a Copa do Brasil de 2014, na final mineira contra o Cruzeiro?", "Atletico Mineiro", { acceptedAnswers: ["atletico-mg", "atletico mg", "galo"], explanation: "O Galo venceu os dois jogos da decisao contra o rival.", sourceUrl: CBF_CDB, seasonRef: "2014" }),
  q("b7-mo-11", "champions_league", "moderado", "Qual clube perdeu para o Real Madrid as finais da Liga dos Campeoes de 2014 e 2016?", "Atletico de Madrid", { acceptedAnswers: ["atletico madrid", "atleti"], explanation: "Os dois vices foram em derbis madrilenos, em Lisboa e em Milao.", sourceUrl: UEFA_CL, seasonRef: "2014-2016" }),
  q("b7-mo-12", "competicoes_nacionais", "moderado", "Qual atacante argentino marcou o gol do titulo do Manchester City aos 93 minutos da ultima rodada da Premier League 2011-12?", "Sergio Aguero", { acceptedAnswers: ["aguero", "kun aguero"], explanation: "O gol contra o QPR deu ao City o primeiro titulo ingles em 44 anos.", sourceUrl: PL, seasonRef: "2011-12" }),
  q("b7-mo-13", "competicoes_nacionais", "moderado", "Qual tecnico italiano comandou o Chelsea campeao da Premier League 2016-17?", "Antonio Conte", { acceptedAnswers: ["conte"], explanation: "Conte venceu a liga em sua primeira temporada na Inglaterra.", sourceUrl: PL, seasonRef: "2016-17" }),
  q("b7-mo-14", "futebol_europeu", "moderado", "Qual selecao venceu a primeira edicao da Liga das Nacoes da UEFA, em 2019?", "Portugal", { explanation: "Portugal venceu a Holanda por 1 a 0 na final, no Porto.", sourceUrl: UEFA_NL, seasonRef: "2019" }),
  q("b7-mo-15", "futebol_europeu", "moderado", "Qual selecao venceu a Liga das Nacoes da UEFA de 2021, batendo a Espanha na final?", "Franca", { explanation: "A Franca virou para 2 a 1 em Milao.", sourceUrl: UEFA_NL, seasonRef: "2021" }),
  q("b7-mo-16", "libertadores", "moderado", "Qual clube argentino venceu a Libertadores em 2015 e em 2018?", "River Plate", { acceptedAnswers: ["river"], explanation: "Os dois titulos vieram sob o comando de Marcelo Gallardo.", sourceUrl: CONMEBOL, seasonRef: "2015-2018" }),
  q("b7-mo-17", "clubes", "moderado", "Qual tecnico argentino levou o Atletico de Madrid aos titulos espanhois de 2014 e 2021?", "Diego Simeone", { acceptedAnswers: ["simeone", "cholo simeone"], explanation: "Simeone comanda o Atletico desde o fim de 2011.", sourceUrl: LALIGA }),
  q("b7-mo-18", "futebol_europeu", "moderado", "Qual tecnico portugues comandou Portugal campeao da Eurocopa de 2016?", "Fernando Santos", { explanation: "Fernando Santos tambem venceu a primeira Liga das Nacoes, em 2019.", sourceUrl: UEFA_EURO, seasonRef: "2016" }),
  q("b7-mo-19", "competicoes_nacionais", "moderado", "Qual clube foi campeao alemao invicto na temporada 2023-24, quebrando a sequencia de titulos do Bayern?", "Bayer Leverkusen", { acceptedAnswers: ["leverkusen"], explanation: "O Leverkusen de Xabi Alonso conquistou seu primeiro titulo alemao.", sourceUrl: BUNDESLIGA, seasonRef: "2023-24" }),

  // ---------- MEDIO (19) ----------
  q("b7-me-01", "champions_league", "medio", "Qual clube frances perdeu para o Bayern a final da Liga dos Campeoes de 2020, em Lisboa?", "Paris Saint-Germain", { acceptedAnswers: ["psg", "paris"], explanation: "O Bayern venceu por 1 a 0, gol de Coman.", sourceUrl: UEFA_CL, seasonRef: "2019-20" }),
  q("b7-me-02", "champions_league", "medio", "Qual clube italiano perdeu para o Manchester City a final da Liga dos Campeoes de 2023?", "Inter de Milao", { acceptedAnswers: ["inter", "internazionale"], explanation: "O City venceu por 1 a 0 em Istambul, gol de Rodri.", sourceUrl: UEFA_CL, seasonRef: "2022-23" }),
  q("b7-me-03", "champions_league", "medio", "Qual clube alemao perdeu para o Real Madrid a final da Liga dos Campeoes de 2024, em Wembley?", "Borussia Dortmund", { acceptedAnswers: ["dortmund", "bvb"], explanation: "O Real venceu por 2 a 0 e chegou a 15 titulos.", sourceUrl: UEFA_CL, seasonRef: "2023-24" }),
  q("b7-me-04", "champions_league", "medio", "Por qual placar o PSG venceu a Inter de Milao na final da Liga dos Campeoes de 2025?", "5 a 0", { acceptedAnswers: ["5x0", "5-0"], explanation: "Foi o primeiro titulo da Liga dos Campeoes do PSG.", sourceUrl: UEFA_CL, seasonRef: "2024-25" }),
  q("b7-me-05", "copa_do_mundo", "medio", "Qual selecao venceu o Brasil por 2 a 0 na segunda fase da Copa do Mundo de 1974, eliminando o entao campeao?", "Holanda", { acceptedAnswers: ["paises baixos"], explanation: "A Holanda de Cruyff avancou para a final.", sourceUrl: FIFA, seasonRef: "1974" }),
  q("b7-me-06", "copa_do_mundo", "medio", "Qual selecao o Brasil venceu na semifinal da Copa do Mundo de 2002?", "Turquia", { explanation: "O Brasil venceu por 1 a 0, gol de bico de Ronaldo.", sourceUrl: FIFA, seasonRef: "2002" }),
  q("b7-me-07", "copa_do_mundo", "medio", "Qual selecao o Brasil venceu na semifinal da Copa do Mundo de 1994?", "Suecia", { explanation: "Romario marcou de cabeca e o Brasil venceu por 1 a 0.", sourceUrl: FIFA, seasonRef: "1994" }),
  q("b7-me-08", "copa_do_mundo", "medio", "Em que estadio foi disputada a final da Copa do Mundo de 1998?", "Stade de France", { acceptedAnswers: ["estadio de franca"], explanation: "O estadio de Saint-Denis foi construido para aquela Copa.", sourceUrl: FIFA, seasonRef: "1998" }),
  q("b7-me-09", "copa_do_mundo", "medio", "Em que estadio foi disputada a final da Copa do Mundo de 2022?", "Lusail", { acceptedAnswers: ["estadio lusail", "lusail stadium"], explanation: "O estadio fica na cidade de Lusail, no Catar.", sourceUrl: FIFA, seasonRef: "2022" }),
  q("b7-me-10", "libertadores", "medio", "Qual clube brasileiro perdeu para o Flamengo a final da Libertadores de 2022, em Guayaquil?", "Athletico Paranaense", { acceptedAnswers: ["athletico", "athletico-pr", "atletico paranaense", "furacao"], explanation: "O Flamengo venceu por 1 a 0 na final unica.", sourceUrl: CONMEBOL, seasonRef: "2022" }),
  q("b7-me-11", "jogadores", "medio", "De qual clube alemao o Liverpool contratou o atacante Roberto Firmino?", "Hoffenheim", { explanation: "Firmino chegou ao Liverpool em 2015.", sourceUrl: PL }),
  q("b7-me-12", "jogadores", "medio", "Por qual clube brasileiro o lateral Marcelo foi revelado antes de ir para o Real Madrid?", "Fluminense", { acceptedAnswers: ["flu"], explanation: "Marcelo voltou ao Fluminense e venceu a Libertadores de 2023.", sourceUrl: UEFA_CL }),
  q("b7-me-13", "jogadores", "medio", "Por qual clube brasileiro Philippe Coutinho foi revelado?", "Vasco da Gama", { acceptedAnswers: ["vasco"], explanation: "Coutinho saiu da base do Vasco para a Inter de Milao.", sourceUrl: UEFA_CL }),
  q("b7-me-14", "jogadores", "medio", "Por qual clube mineiro o atacante Richarlison foi revelado?", "America Mineiro", { acceptedAnswers: ["america-mg", "america mg", "america"], explanation: "Richarlison passou pelo Fluminense antes de ir para a Europa.", sourceUrl: PL }),
  q("b7-me-15", "copa_do_mundo", "medio", "Qual selecao eliminou a Argentina nas oitavas de final da Copa do Mundo de 2018, com dois gols de Mbappe?", "Franca", { explanation: "A Franca venceu por 4 a 3 em Kazan e seguiu ate o titulo.", sourceUrl: FIFA, seasonRef: "2018" }),
  q("b7-me-16", "copa_do_mundo", "medio", "Qual selecao asiatica venceu Alemanha e Espanha na fase de grupos da Copa do Mundo de 2022?", "Japao", { explanation: "O Japao virou os dois jogos por 2 a 1 e terminou em primeiro no grupo.", sourceUrl: FIFA, seasonRef: "2022" }),
  q("b7-me-17", "jogadores", "medio", "Por qual clube paulista do interior o atacante Gabriel Martinelli foi revelado?", "Ituano", { explanation: "Martinelli saiu do Ituano direto para o Arsenal em 2019.", sourceUrl: PL }),
  q("b7-me-18", "copa_do_mundo", "medio", "Quantas Copas do Mundo a Franca tinha vencido ate a edicao de 2022?", "2", { acceptedAnswers: ["duas", "dois"], explanation: "A Franca foi campea em 1998 e 2018.", sourceUrl: FIFA }),
  q("b7-me-19", "copa_do_mundo", "medio", "Quantas Copas do Mundo a Inglaterra tinha vencido ate a edicao de 2022?", "1", { acceptedAnswers: ["uma", "um"], explanation: "O unico titulo ingles foi em casa, em 1966.", sourceUrl: FIFA }),

  // ---------- DIFICIL (19) ----------
  q("b7-d-01", "champions_league", "dificil", "Qual clube portugues perdeu para o Milan a final da Copa dos Campeoes de 1990, em Viena?", "Benfica", { explanation: "O Milan de Sacchi venceu por 1 a 0 e foi bicampeao seguido.", sourceUrl: UCL_FINALS, seasonRef: "1989-90" }),
  q("b7-d-02", "champions_league", "dificil", "Qual clube iugoslavo venceu a Copa dos Campeoes de 1991, nos penaltis contra o Marselha?", "Estrela Vermelha", { acceptedAnswers: ["estrela vermelha de belgrado", "red star", "crvena zvezda"], explanation: "A final de Bari terminou 0 a 0.", sourceUrl: UCL_FINALS, seasonRef: "1990-91" }),
  q("b7-d-03", "champions_league", "dificil", "Qual clube italiano perdeu para o Barcelona a final da Copa dos Campeoes de 1992, em Wembley?", "Sampdoria", { explanation: "O Barcelona de Cruyff venceu por 1 a 0 na prorrogacao e conquistou seu primeiro titulo europeu.", sourceUrl: UCL_FINALS, seasonRef: "1991-92" }),
  q("b7-d-04", "champions_league", "dificil", "Qual clube italiano venceu a Liga dos Campeoes de 1996, nos penaltis contra o Ajax, em Roma?", "Juventus", { acceptedAnswers: ["juve"], explanation: "A final terminou 1 a 1 no Estadio Olimpico.", sourceUrl: UCL_FINALS, seasonRef: "1995-96" }),
  q("b7-d-05", "champions_league", "dificil", "Qual clube venceu a Liga dos Campeoes de 2001, nos penaltis contra o Valencia, em Milao?", "Bayern de Munique", { acceptedAnswers: ["bayern", "bayern munique"], explanation: "Foi o segundo vice seguido do Valencia.", sourceUrl: UCL_FINALS, seasonRef: "2000-01" }),
  q("b7-d-06", "champions_league", "dificil", "Em que cidade foi disputada a final da Liga dos Campeoes de 2002, Real Madrid contra Bayer Leverkusen?", "Glasgow", { explanation: "O Real venceu por 2 a 1 em Hampden Park, com o famoso voleio de Zidane.", sourceUrl: UCL_FINALS, seasonRef: "2001-02" }),
  q("b7-d-07", "champions_league", "dificil", "Em que cidade foi disputada a final da Liga dos Campeoes de 2009, Barcelona contra Manchester United?", "Roma", { acceptedAnswers: ["rome"], explanation: "O Barcelona venceu por 2 a 0 no Estadio Olimpico.", sourceUrl: UCL_FINALS, seasonRef: "2008-09" }),
  q("b7-d-08", "champions_league", "dificil", "Qual foi o placar da final da Liga dos Campeoes de 2011, Barcelona contra Manchester United, em Wembley?", "3 a 1", { acceptedAnswers: ["3x1", "3-1"], explanation: "Foi a segunda final seguida em que o Barcelona venceu o United.", sourceUrl: UCL_FINALS, seasonRef: "2010-11" }),
  q("b7-d-09", "futebol_europeu", "dificil", "Qual selecao perdeu para a Uniao Sovietica a final da primeira Eurocopa, em 1960?", "Iugoslavia", { explanation: "A URSS venceu por 2 a 1 na prorrogacao, em Paris.", sourceUrl: EURO_FINALS, seasonRef: "1960" }),
  q("b7-d-10", "futebol_europeu", "dificil", "Qual selecao venceu a Eurocopa de 1972, goleando a Uniao Sovietica por 3 a 0 na final?", "Alemanha Ocidental", { acceptedAnswers: ["alemanha"], explanation: "Era a Alemanha de Beckenbauer e Gerd Muller.", sourceUrl: EURO_FINALS, seasonRef: "1972" }),
  q("b7-d-11", "futebol_europeu", "dificil", "Em que cidade foi disputada a final da Eurocopa de 1972?", "Bruxelas", { acceptedAnswers: ["bruxelles", "brussels"], explanation: "A final foi no Estadio Heysel.", sourceUrl: EURO_FINALS, seasonRef: "1972" }),
  q("b7-d-12", "futebol_europeu", "dificil", "Qual selecao perdeu para a Alemanha Ocidental a final da Eurocopa de 1980, em Roma?", "Belgica", { explanation: "A Alemanha Ocidental venceu por 2 a 1.", sourceUrl: EURO_FINALS, seasonRef: "1980" }),
  q("b7-d-13", "futebol_europeu", "dificil", "Qual selecao perdeu para a Dinamarca a final da Eurocopa de 1992, em Gotemburgo?", "Alemanha", { explanation: "A Dinamarca venceu por 2 a 0.", sourceUrl: EURO_FINALS, seasonRef: "1992" }),
  q("b7-d-14", "futebol_europeu", "dificil", "Em que cidade foi disputada a final da Eurocopa de 2008, Espanha contra Alemanha?", "Viena", { acceptedAnswers: ["vienna", "wien"], explanation: "A final foi no Ernst-Happel-Stadion.", sourceUrl: EURO_FINALS, seasonRef: "2008" }),
  q("b7-d-15", "competicoes_internacionais", "dificil", "Qual selecao perdeu para o Brasil a final da Copa America de 1997, disputada em casa?", "Bolivia", { explanation: "O Brasil venceu por 3 a 1 em La Paz.", sourceUrl: CA_FINALS, seasonRef: "1997" }),
  q("b7-d-16", "competicoes_internacionais", "dificil", "Qual selecao perdeu para o Brasil por 3 a 0 a final da Copa America de 1999, em Assuncao?", "Uruguai", { explanation: "O Brasil foi bicampeao seguido da Copa America.", sourceUrl: CA_FINALS, seasonRef: "1999" }),
  q("b7-d-17", "competicoes_internacionais", "dificil", "Qual selecao convidada perdeu para a Argentina a final da Copa America de 1993, em Guayaquil?", "Mexico", { explanation: "A Argentina venceu por 2 a 1.", sourceUrl: CA_FINALS, seasonRef: "1993" }),
  q("b7-d-18", "competicoes_internacionais", "dificil", "Qual selecao perdeu para o Uruguai, nos penaltis, a final da Copa America de 1995, em Montevideu?", "Brasil", { explanation: "A final terminou 1 a 1 e o Uruguai venceu por 5 a 3 nos penaltis.", sourceUrl: CA_FINALS, seasonRef: "1995" }),
  q("b7-d-19", "libertadores", "dificil", "Qual clube argentino derrotou o Cruzeiro, no Mineirao, na final da Libertadores de 2009?", "Estudiantes", { acceptedAnswers: ["estudiantes de la plata"], explanation: "Apos 0 a 0 em La Plata, o Estudiantes virou para 2 a 1 em Belo Horizonte.", sourceUrl: LIB_FINALS, seasonRef: "2009" }),

  // ---------- IMPOSSIVEL (24) ----------
  q("b7-i-01", "futebol_brasileiro", "impossivel", "Qual atacante do Fortaleza foi o artilheiro da Taca Brasil de 1960?", "Becece", { acceptedAnswers: ["bececê"], explanation: "Becece fez 7 gols na segunda edicao da Taca Brasil.", sourceUrl: BR_TOPS, seasonRef: "1960" }),
  q("b7-i-02", "futebol_brasileiro", "impossivel", "Qual atacante do Santos, parceiro de Pele, foi o artilheiro da Taca Brasil de 1962?", "Coutinho", { explanation: "Coutinho fez 7 gols na campanha do bicampeonato santista.", sourceUrl: BR_TOPS, seasonRef: "1962" }),
  q("b7-i-03", "futebol_brasileiro", "impossivel", "Qual atacante do Nautico foi o artilheiro da Taca Brasil de 1965, com 9 gols?", "Bita", { explanation: "O Nautico foi um dos grandes do Nordeste nos anos 60.", sourceUrl: BR_TOPS, seasonRef: "1965" }),
  q("b7-i-04", "futebol_brasileiro", "impossivel", "Qual atacante do Treze, da Paraiba, foi o artilheiro da Taca Brasil de 1967?", "Chiclete", { explanation: "Chiclete fez 6 gols pelo clube de Campina Grande.", sourceUrl: BR_TOPS, seasonRef: "1967" }),
  q("b7-i-05", "futebol_brasileiro", "impossivel", "Qual atacante do Botafogo foi o artilheiro da Taca Brasil de 1968?", "Ferretti", { explanation: "Ferretti fez 7 gols na campanha do titulo botafoguense.", sourceUrl: BR_TOPS, seasonRef: "1968" }),
  q("b7-i-06", "futebol_brasileiro", "impossivel", "Qual atacante do America-RJ foi o artilheiro do Torneio Roberto Gomes Pedrosa de 1969?", "Edu", { explanation: "Edu fez 14 gols no Robertao de 1969.", sourceUrl: BR_TOPS, seasonRef: "1969" }),
  q("b7-i-07", "futebol_brasileiro", "impossivel", "Qual atacante do Internacional foi o artilheiro do Brasileirao de 1988, com 15 gols?", "Nilson", { explanation: "O Inter chegou a final daquele ano e perdeu para o Bahia.", sourceUrl: BR_TOPS, seasonRef: "1988" }),
  q("b7-i-08", "futebol_brasileiro", "impossivel", "Qual atacante do Bahia foi o artilheiro do Brasileirao de 1990?", "Charles", { explanation: "Charles fez 11 gols pelo Bahia.", sourceUrl: BR_TOPS, seasonRef: "1990" }),
  q("b7-i-09", "futebol_brasileiro", "impossivel", "Qual atacante do Santos foi o artilheiro do Brasileirao de 1993, com 15 gols?", "Guga", { explanation: "Guga foi o goleador do campeonato vencido pelo Palmeiras.", sourceUrl: BR_TOPS, seasonRef: "1993" }),
  q("b7-i-10", "futebol_brasileiro", "impossivel", "Quantos gols Dimba marcou pelo Goias no Brasileirao de 2003, primeiro ano dos pontos corridos?", "31", { acceptedAnswers: ["trinta e um"], explanation: "A marca de Dimba foi superada no ano seguinte pelos 34 gols de Washington.", sourceUrl: BR_TOPS, seasonRef: "2003" }),
  q("b7-i-11", "futebol_brasileiro", "impossivel", "Qual atacante do Goias foi o artilheiro do Brasileirao de 2006, com 17 gols?", "Souza", { explanation: "Souza foi o goleador do ano do primeiro titulo do tri do Sao Paulo.", sourceUrl: BR_TOPS, seasonRef: "2006" }),
  q("b7-i-12", "futebol_brasileiro", "impossivel", "Qual atacante do Parana Clube foi o artilheiro do Brasileirao de 2007, com 20 gols?", "Josiel", { explanation: "Josiel fez 20 gols pelo Parana Clube.", sourceUrl: BR_TOPS, seasonRef: "2007" }),
  q("b7-i-13", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Gremio campeao brasileiro de 1996?", "Luiz Felipe Scolari", { acceptedAnswers: ["felipao", "scolari"], explanation: "Felipao ja tinha vencido a Libertadores com o Gremio em 1995.", sourceUrl: BR_COACHES, seasonRef: "1996" }),
  q("b7-i-14", "futebol_brasileiro", "impossivel", "Qual tecnico comandou o Palmeiras bicampeao brasileiro em 1993 e 1994?", "Vanderlei Luxemburgo", { acceptedAnswers: ["luxemburgo", "wanderley luxemburgo"], explanation: "Era o Palmeiras da parceria com a Parmalat.", sourceUrl: BR_COACHES, seasonRef: "1993-1994" }),
  q("b7-i-15", "futebol_brasileiro", "impossivel", "Qual tecnico conquistou o Campeonato Brasileiro de 1999?", "Oswaldo de Oliveira", { acceptedAnswers: ["oswaldo"], explanation: "No ano seguinte ele tambem venceria o Mundial de Clubes da FIFA.", sourceUrl: BR_COACHES, seasonRef: "1999" }),
  q("b7-i-16", "libertadores", "impossivel", "Qual clube paraguaio perdeu para o Penarol a final da primeira Libertadores, em 1960?", "Olimpia", { explanation: "O Penarol venceu por 1 a 0 em casa e empatou em 1 a 1 em Assuncao.", sourceUrl: LIB_FINALS, seasonRef: "1960" }),
  q("b7-i-17", "libertadores", "impossivel", "Qual clube chileno perdeu para o Independiente, na prorrogacao do jogo-desempate em Montevideu, a final da Libertadores de 1973?", "Colo-Colo", { acceptedAnswers: ["colo colo"], explanation: "O Independiente venceu por 2 a 1 e foi tri seguido.", sourceUrl: LIB_FINALS, seasonRef: "1973" }),
  q("b7-i-18", "libertadores", "impossivel", "Qual clube foi o primeiro colombiano a vencer a Libertadores, em 1989?", "Atletico Nacional", { acceptedAnswers: ["nacional de medellin"], explanation: "O Atletico Nacional venceu o Olimpia nos penaltis.", sourceUrl: LIB_FINALS, seasonRef: "1989" }),
  q("b7-i-19", "libertadores", "impossivel", "Qual clube argentino derrotou o Sao Paulo, nos penaltis, na final da Libertadores de 1994?", "Velez Sarsfield", { acceptedAnswers: ["velez"], explanation: "Cada time venceu por 1 a 0 em casa e o Velez levou nos penaltis.", sourceUrl: LIB_FINALS, seasonRef: "1994" }),
  q("b7-i-20", "libertadores", "impossivel", "Qual clube mexicano perdeu para o Boca Juniors, nos penaltis, a final da Libertadores de 2001?", "Cruz Azul", { explanation: "O Boca venceu a ida no Mexico, perdeu a volta em casa e levou nos penaltis.", sourceUrl: LIB_FINALS, seasonRef: "2001" }),
  q("b7-i-21", "libertadores", "impossivel", "Qual clube mexicano perdeu para o River Plate a final da Libertadores de 2015?", "Tigres", { acceptedAnswers: ["tigres uanl"], explanation: "Apos 0 a 0 no Mexico, o River venceu por 3 a 0 no Monumental.", sourceUrl: LIB_FINALS, seasonRef: "2015" }),
  q("b7-i-22", "futebol_brasileiro", "impossivel", "Qual clube catarinense perdeu para o Fluminense a final da Copa do Brasil de 2007?", "Figueirense", { explanation: "Foi o primeiro titulo de Copa do Brasil do Fluminense.", sourceUrl: CDB_FINALS, seasonRef: "2007" }),
  q("b7-i-23", "futebol_brasileiro", "impossivel", "Qual clube baiano perdeu para o Santos a final da Copa do Brasil de 2010?", "Vitoria", { acceptedAnswers: ["ec vitoria"], explanation: "Era o Santos de Neymar, Ganso e Robinho.", sourceUrl: CDB_FINALS, seasonRef: "2010" }),
  q("b7-i-24", "futebol_brasileiro", "impossivel", "Qual clube paranaense perdeu as finais da Copa do Brasil de 2011, para o Vasco, e de 2012, para o Palmeiras?", "Coritiba", { acceptedAnswers: ["coxa"], explanation: "O Coritiba foi vice em dois anos seguidos.", sourceUrl: CDB_FINALS, seasonRef: "2011-2012" }),
];
