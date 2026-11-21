# Progresso do banco de 1.000 perguntas

**Meta:** 1.000 perguntas abertas, 200 em cada uma das 5 dificuldades (facil, moderado, medio, dificil, impossivel), cada uma com ID unico, resposta oficial, respostas alternativas quando aplicavel, explicacao curta, categoria, dificuldade e fonte verificavel.

## Status atual

| Lote | Arquivo | Perguntas | Facil | Moderado | Medio | Dificil | Impossivel | Status |
|---|---|---|---|---|---|---|---|---|
| 001 | `batch-001.ts` | 100 | 25 | 25 | 25 | 25 | 0 | Concluido, carregado, testado (corrigido 2x, ver abaixo) |
| 002 | `batch-002.ts` | 100 | 25 | 25 | 25 | 25 | 0 | Concluido, carregado, testado |
| 003 | `batch-003.ts` | 100 | 20 | 20 | 20 | 20 | 20 | Concluido, testado (escrito a mao, sem API de IA) |
| 004 | `batch-004.ts` | 100 | 19 | 19 | 19 | 19 | 24 | Concluido, testado (escrito a mao; dificil/impossivel conferidos na web) |
| 005 | `batch-005.ts` | 100 | 19 | 19 | 19 | 19 | 24 | Concluido, testado (escrito a mao; dificil/impossivel conferidos na web) |
| 006 | `batch-006.ts` | 100 | 19 | 19 | 19 | 19 | 24 | Concluido, testado (escrito a mao; dificil/impossivel conferidos na web) |
| 007 | `batch-007.ts` | 100 | 19 | 19 | 19 | 19 | 24 | Concluido, testado (escrito a mao; dificil/impossivel conferidos na web) |
| 008 | `batch-008.ts` | 100 | 19 | 19 | 19 | 19 | 24 | Concluido, testado (escrito a mao; dificil/impossivel conferidos na web) |
| 009 | `batch-009.ts` | 100 | 19 | 19 | 19 | 19 | 24 | Concluido, testado (escrito a mao; dificil/impossivel conferidos na web) |

**Total concluido: 900 perguntas** (facil 184, moderado 184, medio 184, dificil 184, impossivel 164).

Slugs: `bN-f-NN`, `bN-mo-NN`, `bN-me-NN`, `bN-d-NN`, `bN-i-NN`.

Plano para fechar 200 por nivel (1.000 no total):

| Lotes | Facil | Moderado | Medio | Dificil | Impossivel |
|---|---|---|---|---|---|
| 004 a 009 (cada) | 19 | 19 | 19 | 19 | 24 |
| 010 | 16 | 16 | 16 | 16 | 36 |

## Correcoes aplicadas ao lote 001

O lote 001 nunca tinha sido verificado contra as 66 perguntas originais (`seed.ts`) no
momento em que foi escrito. Ao preparar o lote 002, essa verificacao foi feita (e refeita
de forma mais completa, lendo o `seed.ts` na integra), revelando duplicatas que foram
corrigidas em duas rodadas, sempre preservando o slug original (apenas o enunciado/resposta
da entrada foi trocado por um fato novo e verificado, e as linhas antigas foram removidas e
reinseridas no banco local de desenvolvimento para refletir a correcao):

- 1a rodada (10 duplicatas): `b1-f-04`, `b1-f-07`, `b1-f-08`, `b1-f-09`, `b1-f-17`,
  `b1-m-01`, `b1-m-22`, `b1-m-23`, `b1-m-25`, `b1-h-19`.
- 2a rodada (8 duplicatas adicionais, encontradas ao ler o `seed.ts` por completo):
  `b1-f-01`, `b1-f-11`, `b1-f-24`, `b1-m-06`, `b1-m-07`, `b1-m-20`, `b1-d-09`, `b1-h-07`.

Apos as duas rodadas, o lote 001 nao repete nenhuma das 66 perguntas originais (verificado
pergunta a pergunta, nao apenas por busca de texto exato).

## Metodologia de verificacao (lote 001)

Antes de escrever o lote, foram feitas buscas na web agrupadas por competicao/premio
(uma busca cobre dezenas de fatos de uma vez, em vez de uma busca por pergunta):
campeoes da Copa do Mundo por ano, campeoes da Liga dos Campeoes da UEFA, campeoes
da Copa Libertadores, vencedores da Bola de Ouro, campeoes do Brasileirao e
artilheiros historicos das Copas do Mundo. So entraram no lote fatos consistentes
entre fontes independentes nessas buscas. Estatisticas com numeros divergentes
entre fontes (ex.: artilharia de Copas anteriores a 1990, contagem atual de titulos
da Champions League por alguns clubes) foram propositalmente deixadas de fora.

Isso significa que a maioria dos fatos do lote 001 sao eventos historicos muito
bem documentados (campeoes de Copa do Mundo, finais, recordes classicos) -- o tipo
de fato relatado de forma identica por milhares de fontes -- cruzados com as
buscas acima, e nao checados um a um contra a pagina oficial de cada orgao
individualmente (o que exigiria uma busca por pergunta). Para os proximos lotes,
perguntas sobre estatisticas mais recentes/mutaveis devem ter uma busca dedicada.

## Metodologia de verificacao (lote 002)

Mesmo processo do lote 001 (buscas agrupadas por competicao/premio: Copa America por
ano, transferencias recordes, Eurocopa por ano, Campeonato Brasileiro dos anos 1990 e
2000, Copa Libertadores por ano), mas com uma verificacao extra: cada pergunta nova foi
conferida contra o texto completo das 66 perguntas originais e das 100 perguntas do
lote 001 (nao so contra um resumo), para evitar repetir o mesmo fato na mesma direcao
(ex.: "quem venceu X" perguntado duas vezes sobre o mesmo evento). Perguntas sobre
transferencias que usavam superlativos absolutos ("a mais cara da historia") foram
revisadas para nao afirmar recordes que nao sao realmente o recorde geral (ex.: a
transferencia de Mbappe em 2017 foi uma das mais caras daquele ano, mas nao superou a
de Neymar no mesmo verao).

## Como continuar

1. Criar o proximo `batch-NNN.ts` no mesmo formato de `batch-003.ts`
   (20 perguntas por dificuldade, 5 dificuldades, slugs `bN-f/mo/me/d/i-NN`).
2. Antes de escrever, reler as perguntas originais (`seed.ts`) e TODOS os lotes
   anteriores na integra (nao so um resumo) para nao repetir fatos na mesma direcao.
3. Adicionar o lote ao array `batches` em `bank/index.ts` e uma linha em
   `LATER_BATCHES` no `server/tests/question-bank.test.ts`, com a distribuicao
   do plano acima. Nunca reutilizar um slug de `RETIRED_SLUGS`.
4. Rodar `npm test --workspace server` (o teste de idempotencia confirma que nada
   foi duplicado) e, opcionalmente, iniciar o servidor para o loader inserir no
   banco local.
5. Atualizar a tabela acima.
6. Quando a soma chegar a 1.000 (200 por dificuldade), rodar a validacao final
   completa (contagem exata, ids unicos, fontes preenchidas).

## Metodologia (lote 003)

Escrito a mao, sem nenhuma chamada de API de IA e sem o pipeline de `questions/ai/`.
Cada pergunta foi conferida contra o texto completo de `seed.ts`, `batch-001.ts` e
`batch-002.ts`. Foram evitados de proposito fatos com contagem disputada ou mutavel:
artilharias divididas (Copas de 1962, 1994 e 2010), nomes de estadios que mudam por
patrocinio, e recordes ainda em aberto (ex.: maior artilheiro da selecao brasileira).

## Metodologia (lotes 004 em diante)

Escritos a mao, sem API de IA e sem o pipeline de `questions/ai/`. Antes de cada lote,
`seed.ts` e todos os `batch-*.ts` anteriores sao relidos para nao repetir fatos, nem
invertidos. Toda pergunta `dificil` e `impossivel` e conferida com busca na web
(agrupada por competicao) e o `sourceUrl` aponta para a pagina usada; na duvida, a
pergunta e trocada. Artilheiros e tecnicos de Copa ficam no `dificil`, nunca no
`impossivel`.
