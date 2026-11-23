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
  | "champion"
  | "skipped";

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
  skipped: "IHH, FUGIU!",
};

/**
 * Mascote de "Quem e o Cobra da Bola?": uma cobra apresentadora, enrolada,
 * segurando a plaquinha do jogo. SVG em camadas feito do zero, para que
 * boca, sobrancelhas e corpo possam ser animados separadamente pelos
 * estados no CSS.
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

        {/* body: coiled snake */}
        <g className="presenter__body">
          <ellipse cx="110" cy="290" rx="90" ry="22" className="presenter__coil" />
          <ellipse cx="110" cy="260" rx="74" ry="20" className="presenter__coil" />
          <ellipse cx="110" cy="232" rx="58" ry="18" className="presenter__coil" />
          <ellipse cx="110" cy="290" rx="60" ry="8" className="presenter__belly" />
          <ellipse cx="110" cy="260" rx="48" ry="7" className="presenter__belly" />
          <rect x="84" y="126" width="52" height="110" rx="26" className="presenter__coil" />
          <rect x="97" y="146" width="26" height="84" rx="13" className="presenter__belly" />
          <path d="M 84 190 Q 50 196 46 176" className="presenter__tail" />
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
          <ellipse cx="110" cy="96" rx="62" ry="50" className="presenter__head" />
          <circle cx="76" cy="66" r="5" className="presenter__spot" />
          <circle cx="144" cy="66" r="5" className="presenter__spot" />
          <circle cx="110" cy="56" r="6" className="presenter__spot" />
          <circle cx="103" cy="104" r="2.5" className="presenter__pupil" />
          <circle cx="117" cy="104" r="2.5" className="presenter__pupil" />

          <g className="presenter__eyebrow-left">
            <rect x="80" y="78" width="26" height="7" rx="3.5" />
          </g>
          <g className="presenter__eyebrow-right">
            <rect x="114" y="78" width="26" height="7" rx="3.5" />
          </g>

          <g className="presenter__eye-left">
            <circle cx="92" cy="94" r="9" className="presenter__eye-white" />
            <ellipse cx="92" cy="94" rx="3" ry="7" className="presenter__pupil" />
          </g>
          <g className="presenter__eye-right">
            <circle cx="128" cy="94" r="9" className="presenter__eye-white" />
            <ellipse cx="128" cy="94" rx="3" ry="7" className="presenter__pupil" />
          </g>

          <g className="presenter__mouth-group">
            <path className="presenter__mouth" />
            <ellipse cx="110" cy="114" rx="10" ry="13" className="presenter__mouth-shout" />
          </g>
          <path d="M 110 124 L 110 144 M 110 144 L 102 152 M 110 144 L 118 152" className="presenter__tongue" />
        </g>
      </svg>
    </div>
  );
}
