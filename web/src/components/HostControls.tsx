// Shared with PlayerView: the room's creator judges and drives the match
// from their own player screen now (no separate presenter tab required),
// so these phase-specific controls are used by both HostView and
// PlayerView instead of being duplicated.

export function Phase1Controls({ match, actions, answerKey, question }: any) {
  const buzz = match.phase1.buzz;
  return (
    <div className="stack">
      <h2 className="font-display">Fase 1</h2>
      {!match.phase1.currentQuestionId && (
        <button className="btn btn-primary" onClick={() => actions.releaseQuestion()}>Liberar pergunta</button>
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

export function CareerControls({ match, actions, answerKey, careerClubs }: any) {
  const c = match.career;
  const buzz = c.buzz;
  return (
    <div className="stack">
      <h2 className="font-display">Desafio das Carreiras</h2>
      {!c.careerQuestionId && <button className="btn btn-primary" onClick={() => actions.releaseQuestion()}>Revelar nova carreira</button>}
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

export function BracketControls({ match, actions, answerKey, question }: any) {
  const round = match.bracketRound;
  const buzz = round?.buzz;
  return (
    <div className="stack">
      <h2 className="font-display">{match.phase === "semifinal" ? `Semifinal ${match.semifinalActiveIndex! + 1}` : "Final"}</h2>
      {!round?.currentQuestionId && <button className="btn btn-primary" onClick={() => actions.releaseQuestion()}>Liberar pergunta</button>}
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

export function AnswerKeyCard({ question, prompt }: { question?: { correctAnswer: string } | null; prompt: string }) {
  return (
    <div className="answer-key sticker-sm">
      <p style={{ margin: "0 0 0.4rem" }}>{prompt}</p>
      <span>Resposta correta:</span> <strong>{question?.correctAnswer ?? "..."}</strong>
    </div>
  );
}

export function JudgeButtons({ actions, playerId }: { actions: any; playerId: string }) {
  return (
    <div className="row judge-buttons">
      <button className="btn judge-btn judge-btn--correct" onClick={() => actions.judge(playerId, true)}>ACERTOU</button>
      <button className="btn judge-btn judge-btn--wrong" onClick={() => actions.judge(playerId, false)}>ERROU</button>
    </div>
  );
}

export function ScoreAdjust({ match, actions }: { match: any; actions: any }) {
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

export function nameOf(match: any, id: string): string {
  return match.players.find((p: any) => p.id === id)?.displayName ?? "?";
}

export function isJudged(match: any): boolean {
  return !!match.lastAnswer && match.lastAnswer.pointsAwardedTo !== null;
}
