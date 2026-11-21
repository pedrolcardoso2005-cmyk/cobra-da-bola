import { useEffect, useState } from "react";
import "./SoloCharacter.css";

export type SoloCharacterState = "idle" | "correct" | "wrong" | "skipped" | "champion";

const CAPTIONS: Record<SoloCharacterState, string | null> = {
  idle: null,
  correct: "ISSO AI!",
  wrong: "XIII...",
  skipped: "TUDO BEM, PULA!",
  champion: "VOCE E O COBRA DA BOLA!",
};

/**
 * Original companion mascot for the Modo Solo -- a friendly, distinct
 * character from the multiplayer presenter ("Lucas Tilt"): brown skin, a
 * bit overweight, black glasses. Built the same way as PresenterCharacter
 * (layered inline SVG, no bitmap/photo, CSS classes drive each state's
 * expression, a key-remount trick retriggers the animation every time the
 * state changes).
 */
export function SoloCharacter({ state }: { state: SoloCharacterState }) {
  const [bounceKey, setBounceKey] = useState(0);
  useEffect(() => {
    setBounceKey((k) => k + 1);
  }, [state]);

  const caption = CAPTIONS[state];

  return (
    <div className={`solo-character solo-character--${state}`} key={bounceKey} role="img" aria-label="Seu companheiro do Modo Solo">
      {caption && <div className="solo-character__caption sticker-sm font-display">{caption}</div>}
      <svg viewBox="0 0 200 250" className="solo-character__svg" aria-hidden="true">
        <g className="solo-character__body">
          <ellipse cx="100" cy="195" rx="66" ry="46" className="solo-character__torso" />
          <rect x="18" y="160" width="26" height="62" rx="13" className="solo-character__arm" />
          <rect x="156" y="160" width="26" height="62" rx="13" className="solo-character__arm" />
          <rect x="46" y="150" width="108" height="58" rx="29" className="solo-character__shirt" />
          <rect x="46" y="150" width="108" height="18" rx="9" className="solo-character__shirt-trim" />
        </g>

        <g className="solo-character__head-group">
          <circle cx="100" cy="90" r="56" className="solo-character__head" />
          <path d="M 48 76 Q 100 34 152 76 L 150 58 Q 100 24 50 58 Z" className="solo-character__hair" />

          <g className="solo-character__eye-left">
            <circle cx="72" cy="95" r="8" className="solo-character__eye-white" />
            <circle cx="72" cy="95" r="4" className="solo-character__pupil" />
          </g>
          <g className="solo-character__eye-right">
            <circle cx="128" cy="95" r="8" className="solo-character__eye-white" />
            <circle cx="128" cy="95" r="4" className="solo-character__pupil" />
          </g>

          <g className="solo-character__glasses">
            <rect x="54" y="82" width="36" height="26" rx="9" />
            <rect x="110" y="82" width="36" height="26" rx="9" />
            <rect x="90" y="90" width="20" height="6" rx="3" />
          </g>

          <g className="solo-character__mouth-group">
            <path className="solo-character__mouth" />
          </g>
        </g>
      </svg>
    </div>
  );
}
