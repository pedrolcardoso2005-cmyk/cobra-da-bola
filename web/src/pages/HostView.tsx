import { useState } from "react";
import { useParams } from "react-router-dom";
import { useRoom } from "../state/useRoom";
import { HistoryLog } from "../components/HistoryLog";
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
  const map: Record<string, string> = { lobby: "Lobby", phase1: "Fase 1", career: "Carreira", semifinal: "Semifinal", final: "Final", champion: "Campeao" };
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

function Phase1Controls({ match, actions, answerKey, question }: any) {
  const buzz = match.phase1.buzz;
  return (
    <div className="stack">
      <h2 className="font-display">Fase 1</h2>
      {!match.phase1.currentQuestionId && (
        <button className="btn btn-primary" onClick={actions.releaseQuestion}>Liberar pergunta</button>
      )}
      {match.phase1.currentQuestionId && !buzz.armed && !buzz.firstPlayerId && (
        <button className="btn btn-primary" onClick={actions.armButtons}>Liberar botoes</button>
      )}
      {question && <AnswerKeyCard question={answerKey?.question} prompt={question.prompt} />}
      {buzz.firstPlayerId && !match.lastAnswer && (
        <p>Apertou primeiro: <strong>{nameOf(match, buzz.firstPlayerId)}</strong></p>
      )}
      {match.lastAnswer && !isJudged(match) && (
        <JudgeButtons actions={actions} playerId={match.lastAnswer.playerId} />
      )}
      {isJudged(match) && (
        <button className="btn btn-bote" onClick={actions.advance}>Proxima pergunta</button>
      )}
      <ScoreAdjust match={match} actions={actions} />
    </div>
  );
}

function CareerControls({ match, actions, answerKey, careerClubs }: any) {
  const c = match.career;
  const buzz = c.buzz;
  return (
    <div className="stack">
      <h2 className="font-display">Fase de carreira</h2>
      {!c.careerQuestionId && <button className="btn btn-primary" onClick={actions.releaseQuestion}>Revelar nova carreira</button>}
      {c.careerQuestionId && (
        <>
          <p>Clubes revelados: {careerClubs?.join(" -> ")}</p>
          <div className="row">
            <button className="btn btn-ghost" onClick={actions.revealNextClub}>Revelar proximo clube</button>
            <button className="btn btn-ghost" onClick={actions.endCareerRound}>Encerrar carreira (ninguem acertou)</button>
          </div>
        </>
      )}
      {answerKey?.careerPlayerName && (
        <div className="answer-key sticker-sm">
          <span>Resposta correta:</span>
          <strong>{answerKey.careerPlayerName}</strong>
        </div>
      )}
      {buzz?.firstPlayerId && (
        <>
          <p>Apertou primeiro: <strong>{nameOf(match, buzz.firstPlayerId)}</strong></p>
          <JudgeButtons actions={actions} playerId={buzz.firstPlayerId} />
        </>
      )}
    </div>
  );
}

function BracketControls({ match, actions, answerKey, question }: any) {
  const round = match.bracketRound;
  const buzz = round?.buzz;
  return (
    <div className="stack">
      <h2 className="font-display">{match.phase === "semifinal" ? `Semifinal ${match.semifinalActiveIndex! + 1}` : "Final"}</h2>
      {!round?.currentQuestionId && <button className="btn btn-primary" onClick={actions.releaseQuestion}>Liberar pergunta</button>}
      {round?.currentQuestionId && !buzz.armed && !buzz.firstPlayerId && (
        <button className="btn btn-primary" onClick={actions.armButtons}>Liberar botoes</button>
      )}
      {question && <AnswerKeyCard question={answerKey?.question} prompt={question.prompt} />}
      {buzz?.firstPlayerId && !match.lastAnswer && <p>Apertou primeiro: <strong>{nameOf(match, buzz.firstPlayerId)}</strong></p>}
      {match.lastAnswer && !isJudged(match) && <JudgeButtons actions={actions} playerId={match.lastAnswer.playerId} />}
      {isJudged(match) && <button className="btn btn-bote" onClick={actions.advance}>Proxima pergunta</button>}
      <ScoreAdjust match={match} actions={actions} />
    </div>
  );
}

function AnswerKeyCard({ question, prompt }: { question?: { correctAnswer: string } | null; prompt: string }) {
  return (
    <div className="answer-key sticker-sm">
      <p style={{ margin: "0 0 0.4rem" }}>{prompt}</p>
      <span>Resposta correta:</span> <strong>{question?.correctAnswer ?? "..."}</strong>
    </div>
  );
}

function JudgeButtons({ actions, playerId }: { actions: any; playerId: string }) {
  return (
    <div className="row judge-buttons">
      <button className="btn judge-btn judge-btn--correct" onClick={() => actions.judge(playerId, true)}>ACERTOU</button>
      <button className="btn judge-btn judge-btn--wrong" onClick={() => actions.judge(playerId, false)}>ERROU</button>
    </div>
  );
}

function ScoreAdjust({ match, actions }: { match: any; actions: any }) {
  if (!match.teams && !match.final && !match.semifinal) return null;
  const targets = match.teams ? match.teams.map((t: any) => ({ id: t.id, label: `Equipe ${t.id}` })) : [];
  if (targets.length === 0) return null;
  return (
    <div className="row">
      <span style={{ color: "var(--giz-dim)", fontSize: "0.8rem" }}>Ajustar placar:</span>
      {targets.map((t: any) => (
        <span key={t.id} className="row">
          {t.label}
          <button className="btn btn-ghost" onClick={() => actions.adjustScore(t.id, -1)}>-1</button>
          <button className="btn btn-ghost" onClick={() => actions.adjustScore(t.id, 1)}>+1</button>
        </span>
      ))}
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
