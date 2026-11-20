import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoom } from "../state/useRoom";
import { useAuth } from "../state/AuthContext";
import { PlayerButton } from "../components/PlayerButton";
import { BracketControls, CareerControls, Phase1Controls } from "../components/HostControls";
import { sfx } from "../sound/sfx";
import "./PlayerView.css";

// Moderate, comfortable reading pace for the word-by-word reveal -- not an
// instant dump of the text, not slow enough to make players wait.
const REVEAL_WORD_MS = 200;

export default function PlayerView() {
  const { code } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { match, playerView, question, careerClubs, answerKey, error, actions } = useRoom(code, "player");
  const [answer, setAnswer] = useState("");
  const prevButtonState = useRef<string | null>(null);
  const prevLastAnswerId = useRef<string | null>(null);

  // Progressive word-by-word reveal of the current question, on the
  // player's own screen. Purely a client-side presentation detail: the
  // server already sent the full prompt in playerView.currentQuestion, this
  // just staggers how much of it is shown. Pressing the buzzer (any
  // player's own local press, win the race or not) freezes it exactly
  // where it was -- the rest of the words are never shown to that player.
  const questionId = playerView?.currentQuestion?.id ?? null;
  const words = useMemo(
    () => (playerView?.currentQuestion?.prompt ?? "").split(/\s+/).filter(Boolean),
    [playerView?.currentQuestion?.prompt],
  );
  const [revealedCount, setRevealedCount] = useState(0);
  const [revealInterrupted, setRevealInterrupted] = useState(false);
  const revealFrozenRef = useRef(false);

  useEffect(() => {
    setRevealedCount(words.length > 0 ? 1 : 0);
    setRevealInterrupted(false);
    revealFrozenRef.current = false;
    // Only a new question (by id) should restart the reveal -- re-renders
    // of the same question (timer ticking, score changes, etc.) must not
    // reset it, so `words` is deliberately left out of the dependency list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]);

  useEffect(() => {
    if (revealFrozenRef.current || revealedCount >= words.length) return;
    const id = setTimeout(() => {
      if (revealFrozenRef.current) return;
      setRevealedCount((n) => n + 1);
    }, REVEAL_WORD_MS);
    return () => clearTimeout(id);
  }, [revealedCount, words.length]);

  function freezeReveal() {
    if (revealFrozenRef.current) return;
    revealFrozenRef.current = true;
    if (revealedCount < words.length) setRevealInterrupted(true);
  }

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
        {playerView.currentQuestion && (
          <div className="player-answer">
            <p className="player-answer__question">{words.slice(0, revealedCount).join(" ")}</p>
            {revealInterrupted && <p className="error-text">A pergunta foi interrompida porque voce respondeu antes de ela terminar.</p>}
          </div>
        )}

        <PlayerButton
          state={playerView.myButtonState}
          buzzedOtherName={buzzedOtherName(match, playerView.myButtonState)}
          teamLabel={team ?? undefined}
          onPress={() => {
            if (playerView.currentQuestion) {
              freezeReveal();
              actions.buzz(playerView.currentQuestion.id);
            }
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
