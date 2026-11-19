import type { BracketMatchup } from "@cobra/shared";
import "./BracketBoard.css";

export function BracketBoard({
  current,
  nameOf,
  semifinals,
  activeIndex,
  final,
}: {
  current: BracketMatchup;
  nameOf: (id: string) => string;
  semifinals?: BracketMatchup[] | null;
  activeIndex?: number | null;
  final?: BracketMatchup | null;
}) {
  return (
    <div className="bracket-board">
      <div className="bracket-board__duel sticker">
        <div className="bracket-board__side bracket-board__side--a">
          <span className="font-display bracket-board__name">{nameOf(current.playerAId)}</span>
          <span className="font-score bracket-board__score">{current.scoreA}</span>
        </div>
        <div className="bracket-board__vs font-display">VS</div>
        <div className="bracket-board__side bracket-board__side--b">
          <span className="font-score bracket-board__score">{current.scoreB}</span>
          <span className="font-display bracket-board__name">{nameOf(current.playerBId)}</span>
        </div>
      </div>
      {semifinals && (
        <div className="bracket-board__chips">
          {semifinals.map((m, i) => (
            <span key={m.id} className={`bracket-chip sticker-sm ${activeIndex === i ? "is-active" : m.winnerId ? "is-done" : ""}`}>
              {m.label}: {nameOf(m.playerAId)} {m.scoreA}x{m.scoreB} {nameOf(m.playerBId)}
            </span>
          ))}
          <span className={`bracket-chip sticker-sm ${final ? "is-active" : ""}`}>Final</span>
        </div>
      )}
    </div>
  );
}
