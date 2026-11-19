import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { api } from "../lib/api";
import "./Profile.css";

interface MatchHistoryRow {
  id: string;
  code: string;
  kind: string;
  participant_count: number;
  started_at: number;
  finished_at: number | null;
  winner_user_id: string | null;
  final_position: number | null;
  correct_answers: number;
  wrong_answers: number;
  rating_delta: number;
}

export default function Profile() {
  const { user, refresh } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<MatchHistoryRow[]>([]);

  useEffect(() => {
    api.get<{ matches: MatchHistoryRow[] }>("/api/ranking/historico").then((d) => setHistory(d.matches)).catch(() => {});
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await api.put("/api/auth/perfil", { displayName });
    await refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!user) return null;

  return (
    <div className="home-shell">
      <Link className="link-muted" to="/">Voltar</Link>
      <h1 className="font-display" style={{ color: "var(--lima)" }}>Perfil</h1>

      <section className="panel sticker home-card" style={{ maxWidth: 480 }}>
        <form onSubmit={onSubmit} className="stack">
          <div className="field">
            <label>Nome de exibicao</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} minLength={2} maxLength={40} />
          </div>
          <button className="btn btn-primary" type="submit">Salvar</button>
          {saved && <span>Salvo!</span>}
        </form>
      </section>

      <section className="stats-grid">
        <Stat label="Rating geral" value={user.ratingOverall} />
        <Stat label="Rating temporada" value={user.ratingSeason} />
        <Stat label="Partidas" value={user.matchesPlayed} />
        <Stat label="Vitorias" value={user.matchesWon} />
        <Stat label="Derrotas" value={user.matchesLost} />
        <Stat label="Sequencia atual" value={user.winStreak} />
        <Stat label="Melhor sequencia" value={user.bestWinStreak} />
      </section>

      <h2 className="font-display" style={{ color: "var(--lima)" }}>Historico de partidas</h2>
      <div className="stack">
        {history.length === 0 && <p>Nenhuma partida registrada ainda.</p>}
        {history.map((m) => (
          <div key={m.id} className="panel-dark sticker-sm" style={{ padding: "0.75rem 1rem" }}>
            Sala {m.code} - {m.participant_count} jogadores - {m.kind === "ranked" ? "ranqueada" : "casual"} -{" "}
            {m.correct_answers} acertos / {m.wrong_answers} erros
            {m.rating_delta !== 0 && <span> ({m.rating_delta > 0 ? "+" : ""}{m.rating_delta})</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card sticker-sm">
      <span className="font-score stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}
