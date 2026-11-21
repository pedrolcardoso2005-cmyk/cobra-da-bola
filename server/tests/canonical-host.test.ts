import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SOCKET_PATH } from "@cobra/shared";
import { canonicalRedirectTarget } from "../src/http/canonicalHost.js";

const PUBLIC_URL = "https://www.cobradabola.com.br";

describe("canonicalRedirectTarget", () => {
  it("nao redireciona nada quando PUBLIC_URL nao esta definido", () => {
    assert.equal(canonicalRedirectTarget(undefined, "GET", "cobra-da-bola-production.up.railway.app", "/"), null);
  });

  it("redireciona o endereco do Railway para o dominio oficial, mantendo caminho e query", () => {
    assert.equal(
      canonicalRedirectTarget(PUBLIC_URL, "GET", "cobra-da-bola-production.up.railway.app", "/como-jogar?x=1"),
      "https://www.cobradabola.com.br/como-jogar?x=1",
    );
  });

  it("redireciona o dominio sem www", () => {
    assert.equal(canonicalRedirectTarget(PUBLIC_URL, "GET", "cobradabola.com.br", "/"), "https://www.cobradabola.com.br/");
  });

  it("nao redireciona quando ja esta no dominio oficial (sem diferenciar maiusculas)", () => {
    assert.equal(canonicalRedirectTarget(PUBLIC_URL, "GET", "WWW.cobradabola.com.br", "/"), null);
  });

  it("nunca redireciona API, socket ou metodos que nao sejam GET/HEAD", () => {
    const host = "cobra-da-bola-production.up.railway.app";
    assert.equal(canonicalRedirectTarget(PUBLIC_URL, "GET", host, "/api/health"), null);
    assert.equal(canonicalRedirectTarget(PUBLIC_URL, "GET", host, `${SOCKET_PATH}/?EIO=4`), null);
    assert.equal(canonicalRedirectTarget(PUBLIC_URL, "POST", host, "/"), null);
  });

  it("ignora PUBLIC_URL invalido em vez de quebrar o site", () => {
    assert.equal(canonicalRedirectTarget("nao-e-url", "GET", "cobradabola.com.br", "/"), null);
  });
});
