import { bracketDuel, type MatchState } from "@cobra/shared";
import { PlayerIcon } from "./PlayerIcon";
import { Fireworks } from "./Fireworks";
import "./BracketScene.css";

/**
 * Cena dramatica 1x1: mostra so os 2 jogadores do confronto ATIVO (nunca
 * eliminados, nunca de outro confronto) -- bracketDuel ja garante isso.
 * A final ganha troféu, brilho mais forte, animacao de entrada e fogos
 * sutis; a semifinal fica so com a luz dramatica.
 */
export function BracketScene({ match, variant }: { match: MatchState; variant: "semifinal" | "final" }) {
  const duel = bracketDuel(match, variant);
  if (!duel) return null;

  return (
    <div
      className={`bracket-scene bracket-scene--${variant} sticker-sm`}
      role="img"
      aria-label={variant === "final" ? "Cena da final entre os dois finalistas" : "Cena da semifinal entre os dois duelistas"}
    >
      {variant === "final" && (
        <>
          <Fireworks />
          <svg viewBox="0 0 40 40" className="bracket-scene__trophy" aria-hidden="true">
            <polygon points="20,2 22.6,9.5 30.8,10.3 24.6,15.7 26.5,23.8 20,19.3 13.5,23.8 15.4,15.7 9.2,10.3 17.4,9.5" />
          </svg>
        </>
      )}
      <div className="bracket-scene__side">
        <PlayerIcon name={duel.playerA.displayName} variant="team-a" />
        <span className="bracket-scene__score font-score">{duel.scoreA}</span>
      </div>
      <span className="bracket-scene__vs font-display">{variant === "final" ? "FINAL" : "X1"}</span>
      <div className="bracket-scene__side">
        <span className="bracket-scene__score font-score">{duel.scoreB}</span>
        <PlayerIcon name={duel.playerB.displayName} variant="team-b" />
      </div>
    </div>
  );
}
