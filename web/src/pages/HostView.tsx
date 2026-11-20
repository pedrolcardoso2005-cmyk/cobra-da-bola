import { useState } from "react";
import { useParams } from "react-router-dom";
import { useRoom } from "../state/useRoom";
import { HistoryLog } from "../components/HistoryLog";
import { BracketControls, CareerControls, Phase1Controls } from "../components/HostControls";
import type { TeamKey } from "@cobra/shared";
import "./HostView.css";

export default function HostView() {
  const { code } = useParams();
  const { match, question, careerClubs, answerKey, error, actions } = useRoom(code, "host");

  if (error) return <div className="center-page"><p className="error-text">{error}</p></div>;
  if (!match) return <div className="center-page"><p>Conectando ao painel da sala {code}...</p></div>;

  return (
    <div className="host-view">
      <header className="host-view__header">
        <span className="font-display">Painel do Apresentador -- Sala {match.code}</span>
        <div className="row">
          <button className="btn btn-ghost" onClick={actions.undo}>Desfazer ultima acao</button>
          {match.paused ? (
            <button className="btn btn-primary" onClick={actions.resume}>Retomar</button>
          ) : (
            <button className="btn btn-ghost" onClick={actions.pause}>Pausar</button>
          )}
          <button className="btn btn-bote" onClick={() => confirm("Encerrar a partida agora?") && actions.endMatch()}>Encerrar partida</button>
        </div>
      </header>

      <div className="host-view__tabs">
        {(["lobby", "phase1", "career", "semifinal", "final", "champion"] as const).map((p) => (
          <span key={p} className={`host-tab font-display ${match.phase === p ? "is-active" : ""}`}>{tabLabel(p)}</span>
        ))}
      </div>

      <main className="host-view__grid">
        <section className="host-view__main panel-dark sticker">
          {match.phase === "lobby" && <LobbyControls match={match} actions={actions} />}
          {match.phase === "phase1" && <Phase1Controls match={match} actions={actions} answerKey={answerKey} question={question} />}
          {match.phase === "career" && <CareerControls match={match} actions={actions} answerKey={answerKey} careerClubs={careerClubs} />}
          {(match.phase === "semifinal" || match.phase === "final") && (
            <BracketControls match={match} actions={actions} answerKey={answerKey} question={question} />
          )}
          {match.phase === "champion" && <p className="font-display" style={{ color: "var(--lima)" }}>Partida encerrada. {match.players.find((p) => p.userId === match.winnerUserId)?.displayName} e o campeao!</p>}
        </section>

        <aside className="host-view__side">
          <ScoreSummary match={match} />
          <HistoryLog entries={match.history} />
        </aside>
      </main>
    </div>
  );
}

function tabLabel(p: string): string {
  const map: Record<string, string> = { lobby: "Lobby", phase1: "Fase 1", career: "Desafio das Carreiras", semifinal: "Semifinal", final: "Final", champion: "Campeao" };
  return map[p] ?? p;
}

function LobbyControls({ match, actions }: { match: any; actions: any }) {
  const [assignments, setAssignments] = useState<Record<string, TeamKey>>({});
  const needsTeams = match.players.length >= 4;

  return (
    <div className="stack">
      <h2 className="font-display">Jogadores na sala ({match.players.length})</h2>
      <ul className="host-player-list">
        {match.players.map((p: any) => (
          <li key={p.id}>
            <span>{p.displayName}</span>
            {needsTeams && (
              <div className="row">
                {(["A", "B"] as TeamKey[]).map((t) => (
                  <button
                    key={t}
                    className={`chip ${assignments[p.id] === t ? "is-active" : ""}`}
                    onClick={() => setAssignments((a) => ({ ...a, [p.id]: t }))}
                  >
                    Equipe {t}
                  </button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
      {needsTeams && (
        <div className="row">
          <button className="btn btn-ghost" onClick={() => actions.setTeams(assignments, "manual")}>Salvar times manuais</button>
          <button className="btn btn-ghost" onClick={() => actions.setTeams({}, "random")}>Sortear times automaticamente</button>
        </div>
      )}
      <button className="btn btn-primary btn-block" disabled={match.players.length < 2} onClick={actions.start}>
        Iniciar partida ({match.players.length} participante{match.players.length === 1 ? "" : "s"})
      </button>
    </div>
  );
}

function ScoreSummary({ match }: { match: any }) {
  return (
    <div className="panel-dark sticker-sm host-score-summary">
      <span className="font-display" style={{ color: "var(--lima)" }}>Formato: {match.participantCount} participantes</span>
      {match.teams && (
        <div className="row-between">
          <span>Equipe A: {match.teams[0].score}</span>
          <span>Equipe B: {match.teams[1].score}</span>
        </div>
      )}
      {match.final && (
        <div className="row-between">
          <span>{nameOf(match, match.final.playerAId)}: {match.final.scoreA}</span>
          <span>{nameOf(match, match.final.playerBId)}: {match.final.scoreB}</span>
        </div>
      )}
    </div>
  );
}

function nameOf(match: any, id: string): string {
  return match.players.find((p: any) => p.id === id)?.displayName ?? "?";
}

function isJudged(match: any): boolean {
  return !!match.lastAnswer && match.lastAnswer.pointsAwardedTo !== null;
}
