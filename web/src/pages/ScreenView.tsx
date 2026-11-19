import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useRoom } from "../state/useRoom";
import { PresenterCharacter, type PresenterState } from "../components/Presenter/PresenterCharacter";
import { QuestionPanel } from "../components/QuestionPanel";
import { ScoreBoard } from "../components/ScoreBoard";
import { CareerBoard } from "../components/CareerBoard";
import { BracketBoard } from "../components/BracketBoard";
import { ChampionScreen } from "../components/ChampionScreen";
import { sfx } from "../sound/sfx";
import { careerQuotaFor } from "@cobra/shared";
import "./ScreenView.css";

export default function ScreenView() {
  const { code } = useParams();
  const { match, question, careerClubs, error } = useRoom(code, "screen");
  const [countdownN, setCountdownN] = useState<3 | 2 | 1 | null>(null);
  const lastHistoryLen = useRef(0);
  const playedChampion = useRef(false);

  useEffect(() => {
    if (!match?.timer?.endsAt) {
      setCountdownN(null);
      return;
    }
    const id = setInterval(() => {
      const remaining = match.timer!.endsAt! - Date.now();
      if (remaining <= 0) {
        setCountdownN(null);
        return;
      }
      const n = Math.ceil(remaining / 1000);
      setCountdownN(n <= 3 ? (n as 3 | 2 | 1) : null);
    }, 120);
    return () => clearInterval(id);
  }, [match?.timer?.endsAt]);

  useEffect(() => {
    if (countdownN) sfx.play(countdownN === 3 ? "tick3" : countdownN === 2 ? "tick2" : "tick1");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdownN]);

  useEffect(() => {
    if (!match) return;
    if (match.history.length === lastHistoryLen.current) return;
    lastHistoryLen.current = match.history.length;
    const cue = match.presenterCue;
    if (cue.type === "correct") sfx.play("correct");
    if (cue.type === "wrong") sfx.play("wrong");
    if (cue.type === "qualified") sfx.play("qualified");
    if (cue.type === "eliminated") sfx.play("eliminated");
    if (cue.type === "semifinal_start" || cue.type === "final_start") sfx.play("matchStart");
  }, [match?.history.length, match]);

  useEffect(() => {
    if (match?.phase === "champion" && !playedChampion.current) {
      playedChampion.current = true;
      sfx.play("champion");
    }
  }, [match?.phase]);

  if (error) return <div className="screen-shell center-page"><p className="error-text">{error}</p></div>;
  if (!match) return <div className="screen-shell center-page"><p>Conectando a sala {code}...</p></div>;

  const presenterState: PresenterState = countdownN ? "countdown" : cueToPresenter(match.presenterCue.type);

  const nameOf = (id: string) => match.players.find((p) => p.id === id)?.displayName ?? "?";

  return (
    <div className="screen-shell">
      <div className="screen-shell__bg" />
      <header className="screen-header">
        <span className="font-display screen-header__brand">COBRA DA BOLA</span>
        <span className="screen-header__code">Sala {match.code}</span>
      </header>

      <main className="screen-main">
        {match.phase === "lobby" && <LobbyBoard match={match} />}

        {match.phase === "phase1" && match.teams && (
          <ScoreBoard teamA={match.teams[0]} teamB={match.teams[1]} nameOf={nameOf} />
        )}

        {match.phase === "career" && match.career && (
          <CareerBoard
            clubs={careerClubs ?? []}
            totalClubs={4}
            cohort={match.players.filter((p) => match.career!.eligiblePlayerIds.includes(p.id) || p.careerRank)}
            quota={careerQuotaFor(match.career.eligiblePlayerIds.length + match.careerResults.length)}
            classifiedCount={match.careerResults.length}
          />
        )}

        {(match.phase === "semifinal" || match.phase === "final") && (match.semifinal || match.final) && (
          <BracketBoard
            current={(match.phase === "semifinal" ? match.semifinal![match.semifinalActiveIndex!] : match.final)!}
            nameOf={nameOf}
            semifinals={match.semifinal}
            activeIndex={match.semifinalActiveIndex}
            final={match.final}
          />
        )}

        {match.phase === "champion" && <ChampionScreen match={match} />}

        {question && match.phase !== "champion" && (
          <div className="screen-main__question">
            <QuestionPanel prompt={question.prompt} choices={question.choices} />
          </div>
        )}

        <div className="screen-main__presenter">
          <PresenterCharacter state={presenterState} countdownNumber={countdownN ?? undefined} />
        </div>
      </main>

      {match.lastAnswer && (
        <div className={`screen-banner hazard-stripes ${match.lastAnswer.correct ? "is-correct" : "is-wrong"}`}>
          <span className="font-display">
            {nameOf(match.lastAnswer.playerId)}: {match.lastAnswer.timedOut ? "tempo esgotado" : match.lastAnswer.correct ? "ACERTOU!" : "ERROU!"}
          </span>
        </div>
      )}
      {!match.lastAnswer && activeBuzzFirstPlayer(match) && (
        <div className="screen-banner hazard-stripes">
          <span className="font-display">Apertou primeiro: {nameOf(activeBuzzFirstPlayer(match)!)}</span>
        </div>
      )}
    </div>
  );
}

function cueToPresenter(type: string): PresenterState {
  if (type === "presenting_question") return "talking";
  if (type === "semifinal_start") return "semifinal";
  if (type === "final_start") return "final";
  if (["correct", "wrong", "qualified", "eliminated", "champion"].includes(type)) return type as PresenterState;
  return "idle";
}

function activeBuzzFirstPlayer(match: any): string | null {
  return match.phase1?.buzz?.firstPlayerId ?? match.career?.buzz?.firstPlayerId ?? match.bracketRound?.buzz?.firstPlayerId ?? null;
}

function LobbyBoard({ match }: { match: any }) {
  return (
    <div className="lobby-board sticker">
      <span className="font-display">Aguardando inicio... {match.players.length} jogador(es) na sala</span>
      <div className="lobby-board__players">
        {match.players.map((p: any) => (
          <span key={p.id} className="lobby-board__chip sticker-sm font-display">{p.displayName}</span>
        ))}
      </div>
    </div>
  );
}
