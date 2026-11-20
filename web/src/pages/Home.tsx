import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { getSocket } from "../lib/socket";
import { ANSWER_SECONDS_OPTIONS, type AnswerSeconds, type CareerTheme, type Difficulty, type QuestionCategory } from "@cobra/shared";
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

const CAREER_THEME_LABELS: Record<CareerTheme, string> = {
  aleatorio: "Aleatorio",
  brasileiros: "Brasileiros",
  sul_americanos: "Sul-americanos",
  europeus: "Europeus",
  norte_americanos: "Norte-americanos",
  asiaticos: "Asiaticos",
  jogadores_de_copa: "Jogadores de Copa do Mundo",
  campeoes: "Campeoes",
  idolos: "Idolos / Icons",
  icones_atuais: "Icones atuais",
  historicos: "Jogadores historicos",
};

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [answerSeconds, setAnswerSeconds] = useState<AnswerSeconds>(20);
  const [targetCount, setTargetCount] = useState(4);
  const [categories, setCategories] = useState<QuestionCategory[]>(["aleatorio"]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
  const [careerThemes, setCareerThemes] = useState<CareerTheme[]>(["aleatorio"]);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  function toggleCategory(cat: QuestionCategory) {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }
  function toggleDifficulty(d: Difficulty) {
    setDifficulties((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  }
  function toggleCareerTheme(t: CareerTheme) {
    setCareerThemes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function createRoom() {
    setCreating(true);
    setError(null);
    const socket = getSocket();
    socket.emit("room:create", { answerSeconds, categories, difficulties, careerThemes, targetCount }, (res) => {
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

      <p className="home-players-note sticker-sm font-display">Quantidade de jogadores: 1 a 12</p>

      <main className="home-grid">
        <section className="panel sticker home-card">
          <h2 className="font-display">Jogar sozinho</h2>
          <p>Responda perguntas e jogue o Desafio das Carreiras sem precisar de outro jogador.</p>
          <button className="btn btn-primary btn-block" disabled title="Em breve">
            Em breve
          </button>
        </section>

        <section className="panel sticker home-card">
          <h2 className="font-display">Criar partida</h2>
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
            <label>Tema (nenhum selecionado = aleatorio)</label>
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
          <div className="field">
            <label>Tema do Desafio das Carreiras</label>
            <div className="chip-grid">
              {(Object.keys(CAREER_THEME_LABELS) as CareerTheme[]).map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`chip ${careerThemes.includes(t) ? "is-active" : ""}`}
                  onClick={() => toggleCareerTheme(t)}
                >
                  {CAREER_THEME_LABELS[t]}
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

          <hr className="home-card__divider" />

          <h3 className="font-display">Entrar com codigo</h3>
          <p>Peca o codigo da sala ao anfitriao e entre para jogar.</p>
          <div className="field">
            <label htmlFor="code">Codigo da sala</label>
            <input id="code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={6} />
          </div>
          <button className="btn btn-bote btn-block" onClick={joinRoom}>Entrar na sala</button>
        </section>

        <section className="panel sticker home-card">
          <h2 className="font-display">Como jogar</h2>
          <p>Veja as quatro etapas do jogo: perguntas, Desafio das Carreiras, semifinal e final.</p>
          <Link className="btn btn-primary btn-block" to="/como-jogar">
            Ver como jogar
          </Link>
        </section>
      </main>
    </div>
  );
}
