import { useEffect, useState } from "react";
import "./PresenterCharacter.css";

export type PresenterState =
  | "idle"
  | "talking"
  | "countdown"
  | "correct"
  | "wrong"
  | "qualified"
  | "eliminated"
  | "semifinal"
  | "final"
  | "champion";

const CAPTIONS: Record<PresenterState, string | null> = {
  idle: null,
  talking: null,
  countdown: null,
  correct: "ACERTOU!",
  wrong: "ERROU!",
  qualified: "CLASSIFICADO!",
  eliminated: "ELIMINADO",
  semifinal: "SEMIFINAL!",
  final: "FINAL!",
  champion: "CAMPEAO!",
};

/**
 * Original mascot for "Quem e o Cobra da Bola?" -- built from scratch as
 * layered SVG (not a photo) specifically so mouth/eyebrow/body states can
 * be animated independently. Deliberately does not reproduce any real
 * club crest or brand mark; the jersey uses the game's own BOTE palette
 * and a fictional snake-fang crest instead.
 */
export function PresenterCharacter({ state, countdownNumber }: { state: PresenterState; countdownNumber?: 3 | 2 | 1 }) {
  const [bounceKey, setBounceKey] = useState(0);
  useEffect(() => {
    setBounceKey((k) => k + 1);
  }, [state]);

  const caption = CAPTIONS[state];
  const urgent = state === "countdown";

  return (
    <div className={`presenter presenter--${state}`} key={bounceKey} role="img" aria-label="Apresentador Cobra da Bola">
      {caption && (
        <div className="presenter__caption sticker-sm font-display">
          {caption}
        </div>
      )}
      {urgent && countdownNumber && (
        <div className="presenter__countdown font-score">{countdownNumber}</div>
      )}
      <svg viewBox="0 0 220 320" className="presenter__svg" aria-hidden="true">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* glow silhouette */}
        <g className="presenter__glow" filter="url(#glow)">
          <ellipse cx="110" cy="300" rx="58" ry="10" />
        </g>

        {/* body */}
        <g className="presenter__body">
          <rect x="62" y="150" width="96" height="110" rx="18" className="presenter__jersey" />
          <rect x="62" y="150" width="96" height="26" rx="12" className="presenter__jersey-trim" />
          <polygon points="110,178 122,200 110,222 98,200" className="presenter__crest" />
          <rect x="30" y="160" width="34" height="90" rx="16" className="presenter__arm" />
          <rect x="158" y="160" width="34" height="90" rx="16" className="presenter__arm" />
          <rect x="78" y="250" width="28" height="60" rx="10" className="presenter__leg" />
          <rect x="116" y="250" width="28" height="60" rx="10" className="presenter__leg" />
          <rect x="70" y="300" width="42" height="16" rx="6" className="presenter__shoe" />
          <rect x="110" y="300" width="42" height="16" rx="6" className="presenter__shoe" />
        </g>

        {/* card held up */}
        <g className="presenter__card-group">
          <rect x="4" y="150" width="54" height="70" rx="6" className="presenter__card" />
          <text x="31" y="172" textAnchor="middle" className="presenter__card-text">QUEM E O</text>
          <text x="31" y="190" textAnchor="middle" className="presenter__card-text presenter__card-text--accent">COBRA</text>
          <text x="31" y="206" textAnchor="middle" className="presenter__card-text">DA BOLA?</text>
        </g>

        {/* head */}
        <g className="presenter__head-group">
          <circle cx="110" cy="96" r="54" className="presenter__head" />
          <path d="M 64 78 Q 110 30 156 78 L 156 60 Q 110 20 64 60 Z" className="presenter__hair" />
          <path d="M 86 118 Q 110 134 134 118 L 134 128 Q 110 142 86 128 Z" className="presenter__beard" />

          <g className="presenter__eyebrow-left">
            <rect x="80" y="78" width="26" height="7" rx="3.5" />
          </g>
          <g className="presenter__eyebrow-right">
            <rect x="114" y="78" width="26" height="7" rx="3.5" />
          </g>

          <g className="presenter__eye-left">
            <circle cx="92" cy="94" r="9" className="presenter__eye-white" />
            <circle cx="92" cy="94" r="4" className="presenter__pupil" />
          </g>
          <g className="presenter__eye-right">
            <circle cx="128" cy="94" r="9" className="presenter__eye-white" />
            <circle cx="128" cy="94" r="4" className="presenter__pupil" />
          </g>

          <g className="presenter__mouth-group">
            <path className="presenter__mouth" />
            <ellipse cx="110" cy="114" rx="10" ry="13" className="presenter__mouth-shout" />
          </g>
        </g>
      </svg>
    </div>
  );
}
