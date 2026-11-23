import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRoom } from "../state/useRoom";
import { useAuth } from "../state/AuthContext";
import { PlayerButton } from "../components/PlayerButton";
import "../components/CareerBoard.css";
import { sfx } from "../sound/sfx";
import { REVEAL_WORD_MS, teamDisplayName } from "@cobra/shared";
import { LiveScore } from "../components/LiveScore";
import { Fireworks } from "../components/scenes/Fireworks";
import { SoloCharacter } from "../components/SoloCharacter";
import "./PlayerView.css";

export default function PlayerView() {
  const { code } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { match, playerView, careerClubs, revealedAnswer, error, notice, actions } = useRoom(code, "player");
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

  // Um botao so: ao apertar RESPONDER a pergunta congela na hora, na
  // palavra que estava na tela (localmente ja, e o servidor confirma).
  const [localFreeze, setLocalFreeze] = useState<number | null>(null);
  useEffect(() => {
    setLocalFreeze(null);
  }, [playerView?.currentQuestion?.id, questionOpenedAt]);

  // Forces a re-render every tick while the reveal is still live, purely
  // to recompute the derived count below from the server anchor -- holds
  // no reveal state of its own (there's nothing local left to reset per
  // question; the displayed count is always recomputed from server data).
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!questionOpenedAt || frozenWordCount != null || localFreeze != null) return;
    const id = setInterval(() => forceTick((n) => n + 1), REVEAL_WORD_MS);
    return () => clearInterval(id);
  }, [questionOpenedAt, frozenWordCount, localFreeze]);

  const revealedCount = (() => {
    if (!questionOpenedAt) return 0; // buzzers not armed yet -- nothing to show
    if (frozenWordCount != null) return frozenWordCount;
    if (localFreeze != null) return localFreeze;
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

  // Cronometro local: o servidor manda so o horario em que o tempo acaba,
  // e a tela conta os segundos sozinha.
  const timerEndsAt = match?.timer?.endsAt ?? null;
  const countdownEndsAt = match?.phase === "lobby" ? match?.countdownEndsAt ?? null : null;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!timerEndsAt && !countdownEndsAt) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [timerEndsAt, countdownEndsAt]);
  const countdownLeft = countdownEndsAt ? Math.max(0, Math.ceil((countdownEndsAt - now) / 1000)) : null;
  const secondsLeft = timerEndsAt ? Math.max(0, Math.ceil((timerEndsAt - now) / 1000)) : null;

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
    const isCreator = match.hostUserId === user?.id;
    const canStart = match.players.length >= 2 && !countdownLeft;
    const lobbyRow = (p: (typeof match.players)[number], team: "A" | "B" | null, pos = 0, total = 0) => (
      <li key={p.id} className={p.connected ? "" : "is-offline"}>
        <span>
          {team ? `${pos + 1}o ` : ""}
          {p.displayName}
          {p.userId === match.hostUserId ? " (criou a sala)" : ""}
        </span>
        {isCreator && (
          <span className="row" style={{ gap: 6 }}>
            {team && pos > 0 && (
              <button type="button" className="btn btn-ghost lobby-kick" aria-label="Subir na ordem" onClick={() => actions.movePlayer(p.id, -1)}>
                ↑
              </button>
            )}
            {team && pos < total - 1 && (
              <button type="button" className="btn btn-ghost lobby-kick" aria-label="Descer na ordem" onClick={() => actions.movePlayer(p.id, 1)}>
                ↓
              </button>
            )}
            {team && (
              <button type="button" className="btn btn-ghost lobby-kick" onClick={() => actions.setTeams({ [p.id]: team === "A" ? "B" : "A" })}>
                Mudar p/ {team === "A" ? "B" : "A"}
              </button>
            )}
            {p.userId !== user?.id && (
              <button type="button" className="btn btn-ghost lobby-kick" onClick={() => actions.kickPlayer(p.id)}>
                Remover
              </button>
            )}
          </span>
        )}
      </li>
    );
    if (countdownLeft != null) {
      return (
        <div className="center-page">
          <h1 className="font-display brand-title">Sala {match.code}</h1>
          <p>A partida vai comecar!</p>
          <p className="font-score lobby-countdown">{countdownLeft}</p>
          <p>{match.players.map((p) => p.displayName).join(" - ")}</p>
        </div>
      );
    }
    return (
      <div className="center-page">
        <h1 className="font-display brand-title">Sala {match.code}</h1>
        <p>Passe o codigo <strong>{match.code}</strong> para seus amigos entrarem.</p>
        <p className="font-display" style={{ color: "var(--lima)", fontSize: "1.6rem" }}>
          {match.players.length} de {target} jogadores
        </p>
        {match.players.length >= 4 ? (
          <div className="lobby-teams">
            {(["A", "B"] as const).map((t) => {
              const members = match.players.filter((p) => p.teamId === t);
              return (
                <section key={t} className={`lobby-team lobby-team--${t.toLowerCase()}`}>
                  {isCreator ? (
                    <input
                      key={`${t}-${match.settings.teamNames?.[t] ?? ""}`}
                      className="lobby-team__name-input font-display"
                      defaultValue={teamDisplayName(match.settings, t)}
                      maxLength={24}
                      aria-label={`Nome da equipe ${t}`}
                      onBlur={(e) => {
                        const v = e.currentTarget.value.trim();
                        if (v && v !== teamDisplayName(match.settings, t)) actions.setTeamName(t, v);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                      }}
                    />
                  ) : (
                    <h2 className="font-display">{teamDisplayName(match.settings, t)}</h2>
                  )}
                  <p className="lobby-team__hint">{members.length} jogadores -- respondem nesta ordem:</p>
                  <ol className="player-lobby-list">
                    {members.map((p, i) => lobbyRow(p, t, i, members.length))}
                  </ol>
                </section>
              );
            })}
          </div>
        ) : (
          <>
            <ul className="player-lobby-list">{match.players.map((p) => lobbyRow(p, null))}</ul>
            <p className="player-view__note">
              {match.players.length === 2 ? "Com 2 jogadores: duelo 1 x 1 direto na final." : match.players.length === 3 ? "Com 3 jogadores: comeca no Desafio das Carreiras." : "Com 4 ou mais, o jogo e em duas equipes."}
            </p>
          </>
        )}
        {notice && <p className="error-text">{notice}</p>}
        {isCreator ? (
          <button className="btn btn-primary" disabled={!canStart} onClick={actions.start}>
            {match.players.length < 2 ? "Esperando jogadores..." : "Iniciar partida"}
          </button>
        ) : (
          <p className="player-view__note">Esperando quem criou a sala iniciar a partida...</p>
        )}
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
    const winner = match.players.find((p) => p.userId === match.winnerUserId);
    const f = match.final;
    return (
      <div className="center-page champion-party">
        <div className="champion-party__fireworks" aria-hidden="true">
          <div style={{ left: "15%", top: "18%" }}><Fireworks intense /></div>
          <div style={{ left: "82%", top: "22%" }}><Fireworks intense /></div>
          <div style={{ left: "30%", top: "70%" }}><Fireworks intense /></div>
          <div style={{ left: "72%", top: "75%" }}><Fireworks intense /></div>
          <div style={{ left: "50%", top: "10%" }}><Fireworks intense /></div>
        </div>
        <h1 className="font-display champion-party__title">
          {won ? "Voce e o Cobra da Bola!" : `${winner?.displayName ?? "Temos um campeao"} e o Cobra da Bola!`}
        </h1>
        <div className="champion-party__snake">
          <SoloCharacter state="champion" caption={null} />
        </div>
        {f && (
          <p className="font-score champion-party__score">
            {match.players.find((p) => p.id === f.playerAId)?.displayName} {f.scoreA} x {f.scoreB}{" "}
            {match.players.find((p) => p.id === f.playerBId)?.displayName}
          </p>
        )}
        <p>Voce: {self.correctAnswers} acertos - {self.wrongAnswers} erros</p>
        <button className="btn btn-primary" onClick={() => navigate("/")}>Voltar ao inicio</button>
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
          {team && match.teams && <span className={`badge-team badge-team-${team.toLowerCase()}`} style={{ marginLeft: 8 }}>{teamDisplayName(match.settings, team)}</span>}
        </div>
        <span className="player-view__phase">{phaseLabel(match.phase)}</span>
      </header>

      <main className="player-view__main">
        <LiveScore match={match} selfId={self.id} />
        {playerView.currentQuestion && questionOpenedAt && (
          <div className="player-answer">
            <p className="player-answer__question">{words.slice(0, revealedCount).join(" ")}</p>
            {revealInterrupted && (
              <p className="error-text">
                A pergunta foi interrompida porque {interruptedBy === self.displayName ? "voce respondeu" : `${interruptedBy ?? "alguem"} respondeu`} antes de ela terminar.
              </p>
            )}
          </div>
        )}



        {playerView.myButtonState === "armed" && !buzz?.firstPlayerId && match.phase !== "career" && (
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
            if (!currentItemId) return;
            if (playerView.currentQuestion && questionOpenedAt && frozenWordCount == null) {
              setLocalFreeze(revealedCount);
              actions.buzz(currentItemId, revealedCount);
            } else {
              actions.buzz(currentItemId);
            }
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
            {secondsLeft != null && (
              <div className={`player-answer__timer ${secondsLeft <= 5 ? "is-urgent" : ""}`}>
                {secondsLeft}s
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
              <p className="player-answer__sent">Resposta enviada: {match.lastAnswer.submittedAnswer}. Conferindo...</p>
            )}
          </form>
        )}

        {playerView.myButtonState === "buzzed_other" && secondsLeft != null && !match.lastAnswer && (
          <p className="player-view__note">
            {buzzedOtherName(match, "buzzed_other") ?? "Outro jogador"} esta respondendo... <strong>{secondsLeft}s</strong>
          </p>
        )}

        <RoundResult match={match} selfId={self.id} revealedAnswer={revealedAnswer} />
        {notice && <p className="error-text">{notice}</p>}
      </main>
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

/** Resultado da rodada para todos: quem acertou/errou e a resposta certa. */
function RoundResult({ match, selfId, revealedAnswer }: { match: any; selfId: string; revealedAnswer: string | null }) {
  const la = match.lastAnswer;
  if (!la) return null;
  const judged = la.skipped || la.pointsAwardedTo !== null;
  if (!judged) return null;
  const name = la.playerId === selfId ? "Voce" : match.players.find((p: any) => p.id === la.playerId)?.displayName ?? "Jogador";
  const verb = la.playerId === selfId ? { ok: "acertou!", bad: "errou.", late: "nao respondeu a tempo." } : { ok: "acertou!", bad: "errou.", late: "nao respondeu a tempo." };
  const text = la.skipped ? "Ninguem pontuou nesta pergunta." : `${name} ${la.timedOut ? verb.late : la.correct ? verb.ok : verb.bad}`;
  const cls = la.skipped ? "" : la.correct ? "is-correct" : "is-wrong";
  return (
    <div className={`player-result ${cls}`}>
      <strong>{text}</strong>
      {revealedAnswer && (
        <span>
          {" "}Resposta: <strong className="player-result__answer">{revealedAnswer}</strong>
        </span>
      )}
      {!revealedAnswer && match.phase === "career" && !la.correct && <span> Os outros ainda podem tentar.</span>}
    </div>
  );
}
