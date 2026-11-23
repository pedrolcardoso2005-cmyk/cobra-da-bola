import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoom } from "../state/useRoom";
import { useAuth } from "../state/AuthContext";
import { PlayerButton } from "../components/PlayerButton";
import "../components/CareerBoard.css";
import { BracketControls, CareerControls, Phase1Controls } from "../components/HostControls";
import { sfx } from "../sound/sfx";
import { REVEAL_WORD_MS } from "@cobra/shared";
import "./PlayerView.css";

export default function PlayerView() {
  const { code } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { match, playerView, question, careerClubs, skippedAnswer, answerKey, error, actions } = useRoom(code, "player");
  const [answer, setAnswer] = useState("");
  const prevButtonState = useRef<string | null>(null);
  const prevLastAnswerId = useRef<string | null>(null);

  // Progressive word-by-word reveal of the current question -- server
  // authoritative (Fase 1 do "programa de TV"): the server stamps
  // buzz.questionOpenedAt the instant the buzzers arm, and the moment
  // ANY player's buzz registers, it computes buzz.frozenWordCount from
  // that same anchor and REVEAL_WORD_MS (shared/src/text.ts) -- never
  // from this client's own clock. Every player's screen renders exactly
  // that frozen count once it arrives; before that, each screen just
  // animates the live count from the same server anchor, so they stay
  // in step with each other regardless of individual network latency.
  const words = useMemo(
    () => (playerView?.currentQuestion?.prompt ?? "").split(/\s+/).filter(Boolean),
    [playerView?.currentQuestion?.prompt],
  );
  const buzz = match?.phase1?.buzz ?? match?.bracketRound?.buzz ?? null;
  const frozenWordCount = buzz?.frozenWordCount ?? null;
  const questionOpenedAt = buzz?.questionOpenedAt ?? null;

  // "Parar revelacao": a purely local, personal pause -- stops THIS
  // player's own screen from advancing further, without buzzing (so it
  // never claims the right to answer) and without touching server state
  // at all. The authoritative server freeze (frozenWordCount, set the
  // instant someone actually buzzes) always takes priority over a local
  // pause, since that's the real end-of-round state everyone must agree on.
  const [locallyPaused, setLocallyPaused] = useState(false);
  const pausedAtCountRef = useRef<number | null>(null);
  useEffect(() => {
    setLocallyPaused(false);
    pausedAtCountRef.current = null;
  }, [playerView?.currentQuestion?.id]);

  // Forces a re-render every tick while the reveal is still live, purely
  // to recompute the derived count below from the server anchor -- holds
  // no reveal state of its own (there's nothing local left to reset per
  // question; the displayed count is always recomputed from server data).
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!questionOpenedAt || frozenWordCount != null || locallyPaused) return;
    const id = setInterval(() => forceTick((n) => n + 1), REVEAL_WORD_MS);
    return () => clearInterval(id);
  }, [questionOpenedAt, frozenWordCount, locallyPaused]);

  const revealedCount = (() => {
    if (!questionOpenedAt) return 0; // buzzers not armed yet -- nothing to show
    if (frozenWordCount != null) return frozenWordCount;
    if (locallyPaused && pausedAtCountRef.current != null) return pausedAtCountRef.current;
    const elapsed = Date.now() - questionOpenedAt;
    return Math.max(1, Math.min(Math.floor(elapsed / REVEAL_WORD_MS) + 1, words.length));
  })();
  const revealInterrupted = frozenWordCount != null && frozenWordCount < words.length;
  const interruptedBy = revealInterrupted ? match?.players.find((p) => p.id === buzz?.firstPlayerId)?.displayName : undefined;

  // Mutual-consent skip (Fase 1/semifinal/final only -- career keeps the
  // presenter's existing "encerrar carreira"): only offered pre-buzz, to
  // the round's own representatives, and never locks the answer timer
  // (there's nothing running yet at this point). The server resolves it
  // the instant both have asked, so this is read straight off buzz state
  // rather than tracked locally.
  const selfId = playerView?.self.id;
  const skipRequestedBy = buzz?.skipRequestedBy ?? [];
  const selfRequestedSkip = !!selfId && skipRequestedBy.includes(selfId);
  const otherSkipRequesterId = selfId ? skipRequestedBy.find((id) => id !== selfId) : undefined;
  const otherSkipRequesterName = otherSkipRequesterId
    ? match?.players.find((p) => p.id === otherSkipRequesterId)?.displayName
    : undefined;

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
  // Na fase de carreiras nao existe pergunta de texto: o "item" em disputa e
  // a carreira atual. Sem isso o botao RESPONDER nao fazia nada nessa fase.
  const careerId = match.phase === "career" ? match.career?.careerQuestionId ?? null : null;
  const currentItemId = playerView.currentQuestion?.id ?? careerId;

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
        {playerView.currentQuestion && questionOpenedAt && (
          <div className="player-answer">
            <p className="player-answer__question">{words.slice(0, revealedCount).join(" ")}</p>
            {revealInterrupted && (
              <p className="error-text">
                A pergunta foi interrompida porque {interruptedBy === self.displayName ? "voce respondeu" : `${interruptedBy ?? "alguem"} respondeu`} antes de ela terminar.
              </p>
            )}
            {locallyPaused && frozenWordCount == null && (
              <p className="player-view__note">Revelacao parada so na sua tela -- apertar RESPONDER ou pedir para pular quando quiser.</p>
            )}
            {playerView.myButtonState === "armed" && frozenWordCount == null && !locallyPaused && revealedCount < words.length && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  pausedAtCountRef.current = revealedCount;
                  setLocallyPaused(true);
                }}
              >
                Parar revelacao
              </button>
            )}
          </div>
        )}

        {match.lastAnswer?.skipped && (
          <p className="player-view__note">
            Pergunta pulada de comum acordo -- ninguem pontuou.
            {skippedAnswer && <> Resposta: <strong style={{ color: "var(--lima)" }}>{skippedAnswer}</strong></>}
          </p>
        )}

        {playerView.myButtonState === "armed" && !buzz?.firstPlayerId && (
          <div className="player-skip">
            {otherSkipRequesterName ? (
              <button className="btn btn-ghost" onClick={actions.requestSkip}>
                {otherSkipRequesterName} pediu para pular pergunta -- concordar
              </button>
            ) : selfRequestedSkip ? (
              <p className="player-view__note">Voce pediu para pular pergunta. Aguardando o outro representante concordar...</p>
            ) : (
              <button className="btn btn-ghost" onClick={actions.requestSkip}>Pular pergunta</button>
            )}
          </div>
        )}

        {careerId && (careerClubs?.length ?? 0) > 0 && (
          <div className="player-answer">
            <p className="player-answer__question">De quem e essa carreira?</p>
            <div className="career-board__clubs">
              {careerClubs!.map((club, i) => (
                <div key={i} className="career-club sticker-sm is-revealed">
                  <span className="font-display">{club}</span>
                </div>
              ))}
            </div>
            <p className="player-view__note">Sabe quem e? Aperte RESPONDER antes de revelarem o proximo clube.</p>
          </div>
        )}

        <PlayerButton
          state={playerView.myButtonState}
          buzzedOtherName={buzzedOtherName(match, playerView.myButtonState)}
          teamLabel={team ?? undefined}
          onPress={() => {
            if (currentItemId) actions.buzz(currentItemId);
          }}
        />

        {canAnswer && (
          <form
            className="player-answer"
            onSubmit={(e) => {
              e.preventDefault();
              if (!answer.trim() || !currentItemId) return;
              actions.submitAnswer(currentItemId, answer.trim());
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
                <button className="btn btn-primary" type="submit" disabled={!!match.lastAnswer || !answer.trim()}>Enviar</button>
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
    career: "Desafio das Carreiras",
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
