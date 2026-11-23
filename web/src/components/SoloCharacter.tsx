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
 * Mascote do Modo Solo: uma cobra (o "Cobra da Bola") enrolada com uma bola
 * de futebol. SVG em camadas feito do zero; as classes CSS de cada estado
 * mudam a boca e a animacao, e o truque de remontar pela key reinicia a
 * animacao sempre que o estado muda.
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
          <ellipse cx="100" cy="222" rx="80" ry="20" className="solo-character__coil" />
          <ellipse cx="100" cy="196" rx="64" ry="18" className="solo-character__coil" />
          <ellipse cx="100" cy="172" rx="48" ry="16" className="solo-character__coil" />
          <ellipse cx="100" cy="222" rx="52" ry="7" className="solo-character__belly" />
          <ellipse cx="100" cy="196" rx="40" ry="6" className="solo-character__belly" />
          <rect x="76" y="112" width="48" height="66" rx="24" className="solo-character__neck" />
          <rect x="88" y="128" width="24" height="44" rx="12" className="solo-character__belly" />
          <g className="solo-character__ball">
            <circle cx="168" cy="214" r="15" />
            <polygon points="168,206 175,211 172,219 164,219 161,211" />
          </g>
        </g>

        <g className="solo-character__head-group">
          <ellipse cx="100" cy="95" rx="60" ry="48" className="solo-character__head" />
          <circle cx="66" cy="70" r="5" className="solo-character__spot" />
          <circle cx="134" cy="70" r="5" className="solo-character__spot" />
          <circle cx="100" cy="58" r="6" className="solo-character__spot" />

          <g className="solo-character__eye-left">
            <circle cx="72" cy="88" r="11" className="solo-character__eye-white" />
            <ellipse cx="72" cy="88" rx="3" ry="7" className="solo-character__pupil" />
          </g>
          <g className="solo-character__eye-right">
            <circle cx="128" cy="88" r="11" className="solo-character__eye-white" />
            <ellipse cx="128" cy="88" rx="3" ry="7" className="solo-character__pupil" />
          </g>

          <circle cx="93" cy="106" r="2.5" className="solo-character__pupil" />
          <circle cx="107" cy="106" r="2.5" className="solo-character__pupil" />

          <g className="solo-character__mouth-group">
            <path className="solo-character__mouth" />
          </g>
          <path d="M 100 126 L 100 146 M 100 146 L 92 154 M 100 146 L 108 154" className="solo-character__tongue" />
        </g>
      </svg>
    </div>
  );
}
