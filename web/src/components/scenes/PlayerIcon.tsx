import "./PlayerIcon.css";

export type PlayerIconVariant = "team-a" | "team-b" | "neutral";

/**
 * One real participant, rendered small and self-contained (own tiny SVG +
 * a name label) so scenes can lay many of these out in a plain CSS
 * flex-wrap row -- never a fixed coordinate per slot, which is what lets
 * Phase1Scene/CareerScene scale from 1 to 6 players per side without
 * overlapping or needing a special case per headcount. Same hand-built
 * shape language as HowToPlayIllustrations.tsx's `Player` primitive.
 */
export function PlayerIcon({
  name,
  variant = "neutral",
  onDeck = false,
  classified = false,
  excluded = false,
}: {
  name: string;
  variant?: PlayerIconVariant;
  onDeck?: boolean;
  classified?: boolean;
  excluded?: boolean;
}) {
  const classes = [
    "player-icon",
    `player-icon--${variant}`,
    onDeck && "player-icon--on-deck",
    classified && "player-icon--classified",
    excluded && "player-icon--excluded",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} title={name}>
      <svg viewBox="0 0 60 70" className="player-icon__svg" aria-hidden="true">
        <rect x={9} y={30} width={42} height={36} rx={14} className="player-icon__body" />
        <circle cx={30} cy={20} r={18} className="player-icon__head" />
        {classified && (
          <g className="player-icon__badge">
            <circle cx={50} cy={14} r={11} />
            <text x={50} y={18} textAnchor="middle" className="player-icon__badge-text">
              OK
            </text>
          </g>
        )}
      </svg>
      <span className="player-icon__name font-display">{name}</span>
    </div>
  );
}
