import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { getSocket } from "../lib/socket";
import { ANSWER_SECONDS_OPTIONS, type AnswerSeconds } from "@cobra/shared";
import "./Home.css";

const PARTICIPANT_COUNTS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [answerSeconds, setAnswerSeconds] = useState<AnswerSeconds>(20);
  const [targetCount, setTargetCount] = useState(4);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  function createRoom() {
    setCreating(true);
    setError(null);
    const socket = getSocket();
    // Sem escolha de tema/dificuldade: sempre sorteia do banco inteiro.
    socket.emit("room:create", { answerSeconds, categories: ["aleatorio"], difficulties: [], careerThemes: ["aleatorio"], targetCount }, (res) => {
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
          <Link className="btn btn-ghost" to="/historico">Meu historico</Link>
          {user?.isAdmin && <Link className="btn btn-ghost" to="/admin">Admin</Link>}
          <button className="btn btn-ghost" onClick={logout}>Sair</button>
        </nav>
      </header>

      <p className="home-players-note sticker-sm font-display">Quantidade de jogadores: 1 a 12</p>

      <main className="home-grid">
        <section className="panel sticker home-card">
          <h2 className="font-display">Jogar sozinho</h2>
          <p>Responda perguntas e jogue o Desafio das Carreiras sem precisar de outro jogador.</p>
          <Link className="btn btn-primary btn-block" to="/sozinho">
            Jogar sozinho
          </Link>
        </section>

        <section className="panel sticker home-card">
          <h3 className="font-display">Entrar com codigo</h3>
          <p>Peca o codigo da sala ao anfitriao e entre para jogar.</p>
          <div className="field">
            <label htmlFor="code">Codigo da sala</label>
            <input id="code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={6} />
          </div>
          <button className="btn btn-bote btn-block" onClick={joinRoom}>Entrar na sala</button>
        </section>

        <section className="panel sticker home-card">
          <h2 className="font-display">Meu historico</h2>
          <p>Veja seus acertos, erros, puladas e suas ultimas partidas no Modo Solo.</p>
          <Link className="btn btn-primary btn-block" to="/historico">
            Meu historico
          </Link>
        </section>

        <section className="panel sticker home-card">
          <h2 className="font-display">Como jogar</h2>
          <p>Veja as quatro etapas do jogo: perguntas, Desafio das Carreiras, semifinal e final.</p>
          <Link className="btn btn-primary btn-block" to="/como-jogar">
            Ver como jogar
          </Link>
        </section>

        <section className="panel sticker home-card home-card--wide">
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
          {error &&<span className="error-text">{error}</span>}
          <button className="btn btn-primary btn-block" onClick={createRoom} disabled={creating}>
            {creating ? "Criando sala..." : "Criar sala"}
          </button>
          <p style={{ color: "var(--giz-dim)", fontSize: "0.8rem" }}>
            Voce entra como jogador. Quando a turma chegar, aperte "Iniciar partida" na sala.
          </p>
        </section>
      </main>
    </div>
  );
}
