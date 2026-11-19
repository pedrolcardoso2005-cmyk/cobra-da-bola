import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import "./Ranking.css";

interface RankingRow {
  position: number;
  displayName: string;
  avatarUrl: string | null;
  rating: number;
  matchesPlayed: number;
  matchesWon: number;
  bestWinStreak: number;
}

export default function Ranking() {
  const [scope, setScope] = useState<"overall" | "season">("overall");
  const [rows, setRows] = useState<RankingRow[]>([]);

  useEffect(() => {
    api.get<{ ranking: RankingRow[] }>(`/api/ranking?scope=${scope}`).then((d) => setRows(d.ranking));
  }, [scope]);

  return (
    <div className="home-shell">
      <Link className="link-muted" to="/">Voltar</Link>
      <h1 className="font-display" style={{ color: "var(--lima)" }}>Ranking</h1>
      <div className="row" style={{ marginBottom: "1rem" }}>
        <button className={`chip ${scope === "overall" ? "is-active" : ""}`} onClick={() => setScope("overall")}>Geral</button>
        <button className={`chip ${scope === "season" ? "is-active" : ""}`} onClick={() => setScope("season")}>Temporada</button>
      </div>
      <table className="ranking-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Jogador</th>
            <th>Rating</th>
            <th>Partidas</th>
            <th>Vitorias</th>
            <th>Melhor sequencia</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.position}>
              <td>{r.position}</td>
              <td>{r.displayName}</td>
              <td className="font-score">{r.rating}</td>
              <td>{r.matchesPlayed}</td>
              <td>{r.matchesWon}</td>
              <td>{r.bestWinStreak}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
