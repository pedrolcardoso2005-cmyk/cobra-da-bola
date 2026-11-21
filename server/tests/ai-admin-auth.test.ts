// requireAdmin gates every route in review-routes.ts (/api/perguntas/ia/*)
// -- the AI review/approve/reject/generate endpoints must never be
// reachable by a regular authenticated player, only by an admin. Access is
// granted either via the ADMIN_EMAILS env var (checked per-request, no
// restart needed) or the users.is_admin DB flag. process.env.ADMIN_EMAILS
// must be set before the dynamic import below, for the same reason
// DB_PATH is set before importing db.ts in the other ai-*.test.ts files:
// top-level consts in auth/routes.ts read it once, at module-evaluation
// time.
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import os from "node:os";

process.env.DB_PATH = `${os.tmpdir()}/cobra-ai-admin-auth-test-${process.pid}-${Date.now()}.db`;
process.env.ADMIN_EMAILS = "admin@example.com, Outro.Admin@Example.com ";

const { requireAdmin } = await import("../src/auth/routes.js");

function callMiddleware(user: Record<string, unknown>): { nextCalled: boolean; status: number | null; body: unknown } {
  const req: any = { user };
  let status: number | null = null;
  let body: unknown = null;
  const res: any = {
    status(code: number) {
      status = code;
      return { json: (b: unknown) => (body = b) };
    },
  };
  let nextCalled = false;
  requireAdmin(req, res, () => (nextCalled = true));
  return { nextCalled, status, body };
}

describe("requireAdmin -- so administradores acessam as rotas de IA", () => {
  it("rejeita (403) um jogador comum, sem is_admin e fora da ADMIN_EMAILS", () => {
    const outcome = callMiddleware({ email: "jogador@example.com", is_admin: 0 });
    assert.equal(outcome.nextCalled, false);
    assert.equal(outcome.status, 403);
  });

  it("permite quando o e-mail esta em ADMIN_EMAILS, mesmo com is_admin=0 no banco", () => {
    const outcome = callMiddleware({ email: "admin@example.com", is_admin: 0 });
    assert.equal(outcome.nextCalled, true);
    assert.equal(outcome.status, null);
  });

  it("a comparacao de ADMIN_EMAILS ignora caixa e espacos (copiar/colar do painel do Railway)", () => {
    const outcome = callMiddleware({ email: "OUTRO.ADMIN@EXAMPLE.COM", is_admin: 0 });
    assert.equal(outcome.nextCalled, true);
  });

  it("permite quando users.is_admin=1, mesmo que o e-mail nao esteja em ADMIN_EMAILS", () => {
    const outcome = callMiddleware({ email: "promovido@example.com", is_admin: 1 });
    assert.equal(outcome.nextCalled, true);
  });
});
