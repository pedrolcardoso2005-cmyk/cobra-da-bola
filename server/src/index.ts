import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "socket.io";
import { SOCKET_PATH } from "@cobra/shared";
import { authRouter } from "./auth/routes.js";
import { questionsRouter } from "./questions/routes.js";
import { rankingRouter } from "./ranking/routes.js";
import { roomsRouter } from "./game/routes.js";
import { soloRouter } from "./solo/routes.js";
import { registerSocketHandlers } from "./realtime/socket.js";
import { seedDatabase } from "./questions/seed.js";
import { loadQuestionBank } from "./questions/bank/index.js";
import { loadAiQuestionsConfig } from "./questions/ai/config.js";
import { checkAndTopUp, logTopUpSummary } from "./questions/ai/stock.js";
import { DB_PATH } from "./db/db.js";
import { countAiGeneratedQuestions } from "./db/questions.js";

seedDatabase();
const bankResult = loadQuestionBank();
if (bankResult.inserted > 0) {
  // eslint-disable-next-line no-console
  console.log(`Banco de perguntas: ${bankResult.inserted} novas, ${bankResult.skipped} ja existiam (total no banco ate agora: ${bankResult.total}).`);
}

// Persistence diagnostic (see auditoria de persistencia): logs the exact
// resolved DB file path and how many AI-generated questions already exist
// in it, every boot. If this number unexpectedly drops to (or stays at) 0
// right after a deploy that should have had AI-generated stock, the
// Railway logs say so immediately -- no need to compare /estoque by hand
// across deploys to notice the database reset.
// eslint-disable-next-line no-console
console.log(`[persistencia] DB_PATH=${DB_PATH} perguntas_geradas_por_ia_no_banco=${countAiGeneratedQuestions()}`);

// Background stock top-up for the AI-generated question pipeline (see
// server/src/questions/ai/). Fire-and-forget on purpose: checkAndTopUp()
// never rejects (see stock.ts) and must never delay the HTTP/WebSocket
// server from coming up. A no-op unless AI_QUESTIONS_ENABLED=true is set,
// so simply deploying this code changes nothing in production by itself.
const aiQuestionsConfig = loadAiQuestionsConfig();
if (aiQuestionsConfig.enabled) {
  // Every run logs explicitly -- whether it was skipped (and why) or which
  // buckets it processed (with requested/generated/approved/pending/
  // rejected counts) -- so "a IA realmente rodou?" is always answerable
  // from the Railway logs alone, never a silent no-op.
  const runAndLog = (trigger: string) =>
    checkAndTopUp(aiQuestionsConfig)
      .then((summary) => logTopUpSummary(trigger, summary))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`[ai-questions] ${trigger}: falha inesperada ao verificar estoque -- ${err instanceof Error ? err.message : err}`);
      });

  void runAndLog("boot");
  // Periodic re-check while the process is up (every 6h) so stock keeps
  // getting topped up during long-running deploys, not just at boot.
  setInterval(() => void runAndLog("intervalo de 6h"), 6 * 60 * 60 * 1000);
}

const app = express();
app.use(cors({ origin: process.env.WEB_ORIGIN ?? "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/perguntas", questionsRouter);
app.use("/api/ranking", rankingRouter);
app.use("/api/salas", roomsRouter);
app.use("/api/solo", soloRouter);

// In production, the web app is built and served from the same process
// (see server/ENV_SETUP.md / deploy notes) so there's a single Railway
// service and no cross-origin requests to configure. Local dev is
// unaffected: `web/dist` only exists after `npm run build --workspace web`,
// which the dev workflow never runs.
const webDist = join(dirname(fileURLToPath(import.meta.url)), "../../web/dist");
if (existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(join(webDist, "index.html"));
  });
}

app.use((err: any, _req: any, res: any, _next: any) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor" });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  path: SOCKET_PATH,
  cors: { origin: process.env.WEB_ORIGIN ?? "http://localhost:5173", credentials: true },
});
registerSocketHandlers(io as any);

const port = Number(process.env.PORT ?? 8787);
httpServer.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Cobra da Bola server rodando em http://localhost:${port}`);
});
