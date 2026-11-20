import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import "./Ranking.css";

interface SoloKindSummary {
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
}

interface SoloMatchSummary {
  sessionId: string;
  startedAt: number;
  correct: number;
  wrong: number;
  skipped: number;
  reachedChampion: boolean;
}

interface SoloHistorySummary {
  perguntas: SoloKindSummary & { bestScore: number; matches: SoloMatchSummary[] };
  carreiras: SoloKindSummary;
}

export default function SoloHistory() {
  const [data, setData] = useState<SoloHistorySummary | null>(null);

  useEffect(() => {
    api.get<SoloHistorySummary>("/api/solo/historico").then(setData);
  }, []);

  if (!data) return <div className="home-shell"><p>Carregando historico...</p></div>;

  const { perguntas, carreiras } = data;

  return (
    <div className="home-shell">
      <Link className="link-muted" to="/">Voltar</Link>
      <h1 className="font-display" style={{ color: "var(--lima)" }}>Meu historico</h1>

      <section className="panel sticker home-card">
        <h2 className="font-display">Perguntas</h2>
        <div className="row" style={{ flexWrap: "wrap", gap: "1.5rem" }}>
          <Stat label="Respondidas" value={perguntas.total} />
          <Stat label="Acertos" value={perguntas.correct} />
          <Stat label="Erros" value={perguntas.wrong} />
          <Stat label="Puladas" value={perguntas.skipped} />
          <Stat label="% de acerto" value={`${perguntas.accuracy}%`} />
          <Stat label="Melhor pontuacao" value={perguntas.bestScore} />
        </div>
      </section>

      <section className="panel sticker home-card">
        <h2 className="font-display">Desafio das Carreiras</h2>
        <div className="row" style={{ flexWrap: "wrap", gap: "1.5rem" }}>
          <Stat label="Respondidas" value={carreiras.total} />
          <Stat label="Acertos" value={carreiras.correct} />
          <Stat label="Erros" value={carreiras.wrong} />
          <Stat label="Puladas" value={carreiras.skipped} />
          <Stat label="% de acerto" value={`${carreiras.accuracy}%`} />
        </div>
      </section>

      <section className="panel sticker home-card">
        <h2 className="font-display">Historico de partidas (Perguntas)</h2>
        {perguntas.matches.length === 0 ? (
          <p>Nenhuma partida de Perguntas ainda -- jogue no Modo Solo para comecar seu historico.</p>
        ) : (
          <table className="ranking-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Acertos</th>
                <th>Erros</th>
                <th>Puladas</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {perguntas.matches.map((m) => (
                <tr key={m.sessionId}>
                  <td>{new Date(m.startedAt).toLocaleString("pt-BR")}</td>
                  <td>{m.correct}</td>
                  <td>{m.wrong}</td>
                  <td>{m.skipped}</td>
                  <td>{m.reachedChampion ? "Cobra da Bola!" : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="font-score" style={{ fontSize: "1.4rem" }}>{value}</div>
      <div style={{ color: "var(--giz-dim)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    </div>
  );
}
