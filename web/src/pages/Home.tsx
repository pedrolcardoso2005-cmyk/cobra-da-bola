import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { getSocket } from "../lib/socket";
import { ANSWER_SECONDS_OPTIONS, type AnswerSeconds, type Difficulty, type QuestionCategory } from "@cobra/shared";
import "./Home.css";

const PARTICIPANT_COUNTS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  futebol_brasileiro: "Futebol brasileiro",
  futebol_europeu: "Futebol europeu",
  futebol_sulamericano: "Futebol sul-americano",
  libertadores: "Libertadores",
  champions_league: "Champions League",
  copa_do_mundo: "Copa do Mundo",
  selecoes: "Selecoes",
  clubes: "Clubes",
  jogadores: "Jogadores",
  historia_do_futebol: "Historia do futebol",
  competicoes_nacionais: "Competicoes nacionais",
  competicoes_internacionais: "Competicoes internacionais",
  futebol_saudita: "Futebol saudita",
  concacaf: "CONCACAF",
  aleatorio: "Aleatorio",
};

const DIFFICULTIES: Difficulty[] = ["facil", "moderado", "medio", "dificil", "impossivel"];

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [answerSeconds, setAnswerSeconds] = useState<AnswerSeconds>(20);
  const [targetCount, setTargetCount] = useState(4);
  const [categories, setCategories] = useState<QuestionCategory[]>(["aleatorio"]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [mmTarget, setMmTarget] = useState(2);
  const [mmSeconds, setMmSeconds] = useState<AnswerSeconds>(20);
  const [mmState, setMmState] = useState<{ waiting: number; targetCount: number } | null>(null);

  useEffect(() => {
    const socket = getSocket();
    function onQueued(p: { targetCount: number; waiting: number }) {
      setMmState(p);
    }
    function onFound(p: { code: string; isHost: boolean }) {
      setMmState(null);
      navigate(`/sala/${p.code}/jogador`);
    }
    socket.on("matchmaking:queued", onQueued);
    socket.on("matchmaking:found", onFound);
    return () => {
      socket.off("matchmaking:queued", onQueued);
      socket.off("matchmaking:found", onFound);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function enterMatchmaking() {
    const socket = getSocket();
    socket.emit("matchmaking:enter", { targetCount: mmTarget, answerSeconds: mmSeconds }, (res) => {
      if (!res.ok) setError(res.error);
    });
  }

  function cancelMatchmaking() {
    getSocket().emit("matchmaking:cancel");
    setMmState(null);
  }

  function toggleCategory(cat: QuestionCategory) {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }
  function toggleDifficulty(d: Difficulty) {
    setDifficulties((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }

  function createRoom() {
    setCreating(true);
    setError(null);
    const socket = getSocket();
    socket.emit("room:create", { answerSeconds, categories, difficulties, targetCount }, (res) => {
      setCreating(false);
      if (res.ok) navigate(`/sala/${res.code}/jogador`);
      else setError(res.error);
    });
  }

  function joinRoom() {
    if (!joinCode.trim()) return;
    navigate(`/sala/${joinCode.trim().toUpperCase()}/jogador`);
  }

  return (
    <div className="home-shell">
      <header className="home-header">
        <h1 className="font-display home-header__title">Cobra da Bola</h1>
        <nav className="row">
          <span className="home-header__user">Ola, {user?.displayName}</span>
          <Link className="btn btn-ghost" to="/perfil">Perfil</Link>
          <Link className="btn btn-ghost" to="/ranking">Ranking</Link>
          <button className="btn btn-ghost" onClick={logout}>Sair</button>
        </nav>
      </header>

      <main className="home-grid">
        <section className="panel sticker home-card">
          <h2 className="font-display">Criar sala privada</h2>
          <div className="field">
            <label>Quantidade exata de participantes</label>
            <select value={targetCount} onChange={(e) => setTargetCount(Number(e.target.value))}>
              {PARTICIPANT_COUNTS.map((n) => (
                <option key={n} value={n}>{n} jogadores</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Tempo de resposta</label>
            <select value={answerSeconds} onChange={(e) => setAnswerSeconds(Number(e.target.value) as AnswerSeconds)}>
              {ANSWER_SECONDS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s} segundos</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Categorias (nenhuma selecionada = aleatorio)</label>
            <div className="chip-grid">
              {(Object.keys(CATEGORY_LABELS) as QuestionCategory[]).map((cat) => (
                <button
                  type="button"
                  key={cat}
                  className={`chip ${categories.includes(cat) ? "is-active" : ""}`}
                  onClick={() => toggleCategory(cat)}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <label>Dificuldades (nenhuma = todas)</label>
            <div className="chip-grid">
              {DIFFICULTIES.map((d) => (
                <button type="button" key={d} className={`chip ${difficulties.includes(d) ? "is-active" : ""}`} onClick={() => toggleDifficulty(d)}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          {error && <span className="error-text">{error}</span>}
          <button className="btn btn-primary btn-block" onClick={createRoom} disabled={creating}>
            {creating ? "Criando sala..." : "Criar sala"}
          </button>
          <p style={{ color: "var(--giz-dim)", fontSize: "0.8rem" }}>
            A partida comeca automaticamente assim que {targetCount} jogadores entrarem -- sem precisar de anfitriao.
          </p>
        </section>

        <section className="panel sticker home-card">
          <h2 className="font-display">Entrar com codigo</h2>
          <p>Peca o codigo da sala ao anfitriao e entre para jogar.</p>
          <div className="field">
            <label htmlFor="code">Codigo da sala</label>
            <input id="code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={6} />
          </div>
          <button className="btn btn-bote btn-block" onClick={joinRoom}>Entrar na sala</button>
        </section>

        <section className="panel sticker home-card">
          <h2 className="font-display">Partida online</h2>
          <p>Encontre outros jogadores automaticamente. Partidas por aqui valem para o ranking oficial.</p>
          {mmState ? (
            <div className="stack">
              <p>
                Procurando partida de {mmState.targetCount} participantes... {mmState.waiting}/{mmState.targetCount} na fila.
              </p>
              <button className="btn btn-ghost btn-block" onClick={cancelMatchmaking}>Cancelar busca</button>
            </div>
          ) : (
            <>
              <div className="field">
                <label>Numero de participantes</label>
                <select value={mmTarget} onChange={(e) => setMmTarget(Number(e.target.value))}>
                  {PARTICIPANT_COUNTS.map((n) => (
                    <option key={n} value={n}>{n} jogadores</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Tempo de resposta</label>
                <select value={mmSeconds} onChange={(e) => setMmSeconds(Number(e.target.value) as AnswerSeconds)}>
                  {ANSWER_SECONDS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s} segundos</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary btn-block" onClick={enterMatchmaking}>Procurar partida</button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
