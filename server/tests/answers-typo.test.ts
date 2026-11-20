// Fase 2 do pedido "programa de TV": tolerancia conservadora a pequenos
// erros de digitacao em respostas abertas do Modo Solo (unico lugar que usa
// answersMatch para julgar automaticamente -- no multiplayer o apresentador
// sempre decide manualmente via HOST_JUDGE, entao essa mudanca nao afeta a
// partida multiplayer). Tudo aqui roda 100% local (sem IA/chamada externa).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { answersMatch } from "@cobra/shared";

describe("tolerancia a erros de digitacao (answersMatch) -- respostas longas", () => {
  it("aceita a resposta exata", () => {
    assert.ok(answersMatch("Real Madrid", "Real Madrid"));
  });

  it("aceita letra faltando (ex. 'Real Madri' por 'Real Madrid')", () => {
    assert.ok(answersMatch("Real Madri", "Real Madrid"));
  });

  it("aceita letras adjacentes trocadas (ex. 'Ronadlo' por 'Ronaldo')", () => {
    assert.ok(answersMatch("Ronadlo", "Ronaldo"));
  });

  it("aceita letra repetida por engano (ex. 'Ronaldoo' por 'Ronaldo')", () => {
    assert.ok(answersMatch("Ronaldoo", "Ronaldo"));
  });

  it("aceita uma resposta alternativa cadastrada mesmo com pequeno erro de digitacao", () => {
    assert.ok(answersMatch("Edson Arantes do Nascimentoo", "Pele", ["Edson Arantes do Nascimento"]));
  });

  it("continua aceitando variacoes de acento/caixa/espaco (regressao)", () => {
    assert.ok(answersMatch("  reAL máDRID  ", "Real Madrid"));
  });
});

describe("tolerancia a erros de digitacao (answersMatch) -- nomes curtos exigem exatidao", () => {
  it("aceita nome curto exato", () => {
    assert.ok(answersMatch("Kaka", "Kaka"));
  });

  it("NAO aceita nome curto com letra faltando (sem tolerancia abaixo de 5 letras)", () => {
    assert.ok(!answersMatch("Kak", "Kaka"));
  });

  it("NAO aceita um nome curto diferente so porque fica a 1 letra de distancia (ex. 'Pepe' por 'Pele')", () => {
    assert.ok(!answersMatch("Pepe", "Pele"));
  });
});

describe("tolerancia a erros de digitacao (answersMatch) -- nunca aceita resposta realmente diferente", () => {
  it("rejeita um clube totalmente diferente", () => {
    assert.ok(!answersMatch("Barcelona", "Real Madrid"));
  });

  it("rejeita mesmo quando ha respostas alternativas cadastradas para outra coisa", () => {
    assert.ok(!answersMatch("Barcelona", "Real Madrid", ["Merengues", "Real"]));
  });

  it("rejeita resposta vazia", () => {
    assert.ok(!answersMatch("", "Real Madrid"));
    assert.ok(!answersMatch("   ", "Real Madrid"));
  });
});
