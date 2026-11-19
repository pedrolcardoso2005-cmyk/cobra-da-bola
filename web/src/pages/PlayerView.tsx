import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoom } from "../state/useRoom";
import { useAuth } from "../state/AuthContext";
import { PlayerButton } from "../components/PlayerButton";
import { BracketControls, CareerControls, Phase1Controls } from "../components/HostControls";
import { sfx } from "../sound/sfx";
import "./PlayerView.css";

export default function PlayerView() {
  const { code } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { match, playerView, question, careerClubs, answerKey, error, actions } = useRoom(code, "player");
  const [answer, setAnswer] = useState("");
  const prevButtonState = useRef<string | null>(null);
  const prevLastAnswerId = useRef<string | null>(null);

  useEffect(() => {
    const st = playerView?.myButtonState;
    if (st && st !== prevButtonState.current) {
      if (st === "buzzed_self") sfx.play("buzz");
      if (st === "armed" && prevButtonState.current === "blocked") sfx.play("armed");
      prevButtonState.current = st;
    }
  }, [playerView?.myButtonState]);

  useEffect(() => {
    if (!match?.lastAnswer) return;
    const key = `${match.lastAnswer.playerId}-${match.lastAnswer.correct}-${match.history.length}`;
    if (prevLastAnswerId.current === key) return;
    prevLastAnswerId.current = key;
    if (match.lastAnswer.playerId === playerView?.self.id) {
      sfx.play(match.lastAnswer.correct ? "correct" : "wrong");
    }
  }, [match?.lastAnswer, match?.history.length, playerView?.self.id]);

  useEffect(() => {
    setAnswer("");
  }, [match?.phase1?.currentQuestionId, match?.career?.careerQuestionId, match?.bracketRound?.currentQuestionId]);

  if (error) return <div className="center-page"><p className="error-text">{error}</p></div>;
  if (!match || !playerView) return <div className="center-page"><p>Conectando a sala {code}...</p></div>;

  const self = playerView.self;
  const team = self.teamId;

  if (match.phase === "lobby") {
    const target = match.settings.targetCount;
    return (
      <div className="center-page">
        <h1 className="font-display brand-title">Sala {match.code}</h1>
        <p>Ola, {self.displayName}! A partida comeca automaticamente assim que a sala encher.</p>
        <p className="font-display" style={{ color: "var(--lima)", fontSize: "1.6rem" }}>
          {match.players.length}/{target} jogadores
        </p>
        <ul className="player-lobby-list">
          {match.players.map((p) => (
            <li key={p.id} className={p.connected ? "" : "is-offline"}>{p.displayName}{p.teamId ? ` - Equipe ${p.teamId}` : ""}</li>
          ))}
        </ul>
        <button
          className="btn btn-ghost"
          onClick={() => {
            actions.leaveRoom();
            navigate("/");
          }}
        >
          Sair da sala
        </button>
      </div>
    );
  }

  if (match.phase === "champion") {
    const won = match.winnerUserId === user?.id;
    return (
      <div className="center-page">
        <h1 className="font-display" style={{ color: won ? "var(--lima)" : "var(--giz-dim)", fontSize: "2.4rem" }}>
          {won ? "Voce e o Cobra da Bola!" : "Fim de jogo"}
        </h1>
        <p>{self.correctAnswers} acertos - {self.wrongAnswers} erros</p>
      </div>
    );
  }

  const canAnswer = playerView.canSubmitAnswer;

  return (
    <div className="player-view">
      <header className="player-view__header">
        <div>
          <span className="font-display">{self.displayName}</span>
          {team && <span className={`badge-team badge-team-${team.toLowerCase()}`} style={{ marginLeft: 8 }}>Equipe {team}</span>}
        </div>
        <span className="player-view__phase">{phaseLabel(match.phase)}</span>
      </header>

      <main className="player-view__main">
        <PlayerButton
          state={playerView.myButtonState}
          buzzedOtherName={buzzedOtherName(match, playerView.myButtonState)}
          teamLabel={team ?? undefined}
          onPress={() => {
            if (playerView.currentQuestion) actions.buzz(playerView.currentQuestion.id);
          }}
        />

        {canAnswer && (
          <form
            className="player-answer"
            onSubmit={(e) => {
              e.preventDefault();
              if (!answer.trim() || !playerView.currentQuestion) return;
              actions.submitAnswer(playerView.currentQuestion.id, answer.trim());
            }}
          >
            {playerView.currentQuestion && <p className="player-answer__question">{playerView.currentQuestion.prompt}</p>}
            {playerView.myTimerSecondsLeft != null && (
              <div className={`player-answer__timer ${playerView.myTimerSecondsLeft <= 3 ? "is-urgent" : ""}`}>
                {playerView.myTimerSecondsLeft}s
              </div>
            )}
            {playerView.currentQuestion?.choices ? (
              <div className="player-answer__choices">
                {playerView.currentQuestion.choices.map((c) => (
                  <button type="button" key={c} className="btn btn-ghost" onClick={() => actions.submitAnswer(playerView.currentQuestion!.id, c)}>
                    {c}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <input
                  autoFocus
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Digite sua resposta"
                  disabled={!!match.lastAnswer}
                />
                <button className="btn btn-primary" type="submit" disabled={!!match.lastAnswer}>Enviar</button>
              </>
            )}
            {match.lastAnswer?.playerId === self.id && (
              <p className="player-answer__sent">Resposta enviada: {match.lastAnswer.submittedAnswer}. Aguardando confirmacao do apresentador...</p>
            )}
          </form>
        )}

        {match.lastAnswer && match.lastAnswer.playerId !== self.id && (
          <p className="player-view__note">Aguardando resultado...</p>
        )}
      </main>

      {self.userId === match.hostUserId && (
        <section className="player-view__host-panel panel-dark sticker">
          <h2 className="font-display" style={{ color: "var(--lima)" }}>Voce criou esta sala -- controles do apresentador</h2>
          {match.phase === "phase1" && <Phase1Controls match={match} actions={actions} answerKey={answerKey} question={question} />}
          {match.phase === "career" && <CareerControls match={match} actions={actions} answerKey={answerKey} careerClubs={careerClubs} />}
          {(match.phase === "semifinal" || match.phase === "final") && (
            <BracketControls match={match} actions={actions} answerKey={answerKey} question={question} />
          )}
        </section>
      )}
    </div>
  );
}

function phaseLabel(phase: string): string {
  const map: Record<string, string> = {
    phase1: "Fase 1",
    career: "Fase de carreira",
    semifinal: "Semifinal",
    final: "Final",
  };
  return map[phase] ?? phase;
}

function buzzedOtherName(match: any, state: string): string | undefined {
  if (state !== "buzzed_other") return undefined;
  const buzz = match.phase1?.buzz ?? match.career?.buzz ?? match.bracketRound?.buzz;
  const id = buzz?.firstPlayerId;
  return match.players.find((p: any) => p.id === id)?.displayName;
}
