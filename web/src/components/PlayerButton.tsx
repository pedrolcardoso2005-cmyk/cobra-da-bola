import type { PlayerButtonState } from "@cobra/shared";
import "./PlayerButton.css";

export function PlayerButton({
  state,
  buzzedOtherName,
  teamLabel,
  onPress,
}: {
  state: PlayerButtonState;
  buzzedOtherName?: string;
  teamLabel?: string;
  onPress: () => void;
}) {
  const disabled = state !== "armed";

  return (
    <button
      className={`player-button player-button--${state} sticker`}
      onClick={onPress}
      disabled={disabled}
      aria-live="polite"
    >
      {teamLabel && <span className="player-button__team badge-team" data-team={teamLabel}>{teamLabel}</span>}
      {state === "blocked" && (
        <>
          <LockIcon />
          <span className="font-display player-button__label">Aguarde</span>
        </>
      )}
      {state === "armed" && (
        <>
          <span className="font-display player-button__label player-button__label--big">Apertar para responder</span>
        </>
      )}
      {state === "buzzed_self" && (
        <>
          <BoltIcon />
          <span className="font-display player-button__label player-button__label--big">Responda!</span>
        </>
      )}
      {state === "buzzed_other" && (
        <>
          <span className="player-button__sub">Apertou primeiro:</span>
          <span className="font-display player-button__label">{buzzedOtherName ?? "outro jogador"}</span>
        </>
      )}
      {state === "qualified" && <span className="font-display player-button__label">Classificado</span>}
      {state === "eliminated" && <span className="font-display player-button__label">Eliminado</span>}
      {state === "spectating" && <span className="font-display player-button__label">Aguardando sua vez</span>}
    </button>
  );
}

function LockIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="player-button__icon">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="player-button__icon">
      <path d="M13 2 3 14h7l-1 8 11-14h-7l0-6Z" />
    </svg>
  );
}
