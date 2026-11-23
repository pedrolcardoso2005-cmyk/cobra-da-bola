import type { TeamState } from "@cobra/shared";
import "./ScoreBoard.css";

export function ScoreBoard({
  teamA,
  teamB,
  nameOf,
  targetScore = 10,
  questionNumber,
  teamLabel = (id) => `Equipe ${id}`,
}: {
  teamLabel?: (id: "A" | "B") => string;
  teamA: TeamState;
  teamB: TeamState;
  nameOf: (playerId: string) => string;
  targetScore?: number;
  questionNumber?: number;
}) {
  return (
    <div className="scoreboard">
      <TeamCard team={teamA} nameOf={nameOf} target={targetScore} align="left" label={teamLabel(teamA.id)} />
      <div className="scoreboard__center">
        <span className="font-display scoreboard__phase">Fase 1</span>
        <span className="scoreboard__meta sticker-sm">Meta {targetScore}</span>
        {questionNumber != null && <span className="scoreboard__question">Pergunta {questionNumber}</span>}
      </div>
      <TeamCard team={teamB} nameOf={nameOf} target={targetScore} align="right" label={teamLabel(teamB.id)} />
    </div>
  );
}

function TeamCard({ team, nameOf, target, align, label }: { team: TeamState; nameOf: (id: string) => string; target: number; align: "left" | "right"; label: string }) {
  const nextPlayerId = team.playerIds[team.rotationIndex];
  return (
    <div className={`team-card team-card--${team.color} sticker team-card--${align}`}>
      <div className="row-between">
        <span className="font-display team-card__name">{label}</span>
        <span className="font-score team-card__score">{String(team.score).padStart(2, "0")}</span>
      </div>
      <div className="team-card__pips">
        {Array.from({ length: target }).map((_, i) => (
          <span key={i} className={`team-card__pip ${i < team.score ? "is-filled" : ""}`} />
        ))}
      </div>
      {nextPlayerId && (
        <div className="team-card__next">
          Na vez: <strong className="font-display">{nameOf(nextPlayerId)}</strong>
        </div>
      )}
    </div>
  );
}
