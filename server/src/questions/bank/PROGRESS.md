# Progresso do banco de 3.000 perguntas

**Meta:** 3.000 perguntas abertas (750 faceis, 750 moderadas, 750 medias, 750 dificeis), cada uma com ID unico, resposta oficial, respostas alternativas quando aplicavel, explicacao curta, categoria, dificuldade e fonte verificavel.

## Status atual

| Lote | Arquivo | Perguntas | Facil | Moderado | Medio | Dificil | Status |
|---|---|---|---|---|---|---|---|
| 001 | `batch-001.ts` | 100 | 25 | 25 | 25 | 25 | Concluido, carregado, testado (corrigido 2x, ver abaixo) |
| 002 | `batch-002.ts` | 100 | 25 | 25 | 25 | 25 | Concluido, carregado, testado |

**Total concluido: 200 / 3000 (6,7%).**
**Faltam: 2.800 perguntas (28 lotes de 100).**

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

1. Criar `batch-003.ts` seguindo o mesmo formato de `batch-001.ts`/`batch-002.ts`
   (slugs `b3-f-NN`, `b3-m-NN`, `b3-d-NN`, `b3-h-NN`), com 25 perguntas por dificuldade.
2. Antes de escrever, reler as 66 perguntas originais (`seed.ts`) e os lotes 001 e 002
   na integra (nao so um resumo) para nao repetir fatos na mesma direcao.
3. Adicionar `batch003` ao array `batches` em `bank/index.ts`.
4. Rodar `npm test --workspace server` (o teste de idempotencia confirma que nada
   foi duplicado) e, opcionalmente, iniciar o servidor para o loader inserir no
   banco local.
5. Atualizar a tabela acima.
6. So quando a soma de todos os lotes chegar a 3000 (750 por dificuldade), rodar a
   validacao final completa (contagem exata, ids unicos, fontes preenchidas) antes
   de cogitar publicar.
