// Naja do campeao: capelo aberto, olhos vermelhos, presas e lingua, dando o
// bote no ritmo da festa. SVG feito do zero, animado so com CSS.
import "./ChampionCobra.css";

export function ChampionCobra() {
  return (
    <div className="cobra-champ" aria-hidden="true">
      <svg viewBox="0 0 300 360" className="cobra-champ__svg">
        <defs>
          <radialGradient id="cc-hood" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#2f9e44" />
            <stop offset="70%" stopColor="#14532d" />
            <stop offset="100%" stopColor="#0a2e18" />
          </radialGradient>
          <radialGradient id="cc-eye" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff3b0" />
            <stop offset="35%" stopColor="#ff3b1f" />
            <stop offset="100%" stopColor="#7a0000" />
          </radialGradient>
          <filter id="cc-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* corpo enrolado */}
        <g className="cobra-champ__coils">
          <ellipse cx="150" cy="330" rx="125" ry="24" fill="#14532d" stroke="#0d0d0d" strokeWidth="5" />
          <ellipse cx="150" cy="300" rx="100" ry="22" fill="#1f7a37" stroke="#0d0d0d" strokeWidth="5" />
          <ellipse cx="150" cy="300" rx="70" ry="7" fill="#d4f000" opacity="0.75" />
          <ellipse cx="150" cy="330" rx="88" ry="7" fill="#d4f000" opacity="0.6" />
          <g className="cobra-champ__ball">
            <circle cx="252" cy="318" r="20" fill="#f4f4ea" stroke="#0d0d0d" strokeWidth="4" />
            <polygon points="252,307 262,314 258,326 246,326 242,314" fill="#0d0d0d" />
          </g>
        </g>

        {/* pescoco + cabeca dando o bote */}
        <g className="cobra-champ__strike">
          <path d="M150 290 C 120 250, 180 220, 150 175" fill="none" stroke="#0d0d0d" strokeWidth="50" strokeLinecap="round" />
          <path d="M150 290 C 120 250, 180 220, 150 175" fill="none" stroke="#1f7a37" strokeWidth="40" strokeLinecap="round" />
          <path d="M150 288 C 126 252, 172 222, 150 180" fill="none" stroke="#d4f000" strokeWidth="14" strokeLinecap="round" opacity="0.8" />

          {/* capelo */}
          <g className="cobra-champ__hood">
            <path d="M150 40 C 60 50, 40 150, 90 205 C 110 225, 190 225, 210 205 C 260 150, 240 50, 150 40 Z" fill="url(#cc-hood)" stroke="#0d0d0d" strokeWidth="6" />
            <path d="M150 70 C 100 80, 90 150, 120 190 L 180 190 C 210 150, 200 80, 150 70 Z" fill="#d4f000" opacity="0.22" />
            <path d="M118 120 Q 150 100 182 120 Q 150 140 118 120 Z" fill="#0d0d0d" opacity="0.55" />
            <circle cx="105" cy="150" r="7" fill="#0d0d0d" opacity="0.5" />
            <circle cx="195" cy="150" r="7" fill="#0d0d0d" opacity="0.5" />
          </g>

          {/* cabeca */}
          <g className="cobra-champ__head">
            <path d="M150 62 C 112 62, 100 92, 108 112 C 116 132, 132 140, 150 140 C 168 140, 184 132, 192 112 C 200 92, 188 62, 150 62 Z" fill="#2f9e44" stroke="#0d0d0d" strokeWidth="6" />
            {/* sobrancelhas bravas */}
            <path d="M112 86 L 138 96" stroke="#0d0d0d" strokeWidth="7" strokeLinecap="round" />
            <path d="M188 86 L 162 96" stroke="#0d0d0d" strokeWidth="7" strokeLinecap="round" />
            {/* olhos */}
            <g className="cobra-champ__eyes" filter="url(#cc-glow)">
              <ellipse cx="128" cy="102" rx="11" ry="9" fill="url(#cc-eye)" stroke="#0d0d0d" strokeWidth="3" />
              <ellipse cx="172" cy="102" rx="11" ry="9" fill="url(#cc-eye)" stroke="#0d0d0d" strokeWidth="3" />
              <ellipse cx="128" cy="102" rx="2.5" ry="8" fill="#0d0d0d" />
              <ellipse cx="172" cy="102" rx="2.5" ry="8" fill="#0d0d0d" />
            </g>
            {/* boca aberta com presas */}
            <path className="cobra-champ__mouth" d="M122 122 Q 150 160 178 122 Q 150 132 122 122 Z" fill="#5c0a0a" stroke="#0d0d0d" strokeWidth="4" />
            <path d="M132 125 L 137 142 L 141 127 Z" fill="#f4f4ea" stroke="#0d0d0d" strokeWidth="1.5" />
            <path d="M168 125 L 163 142 L 159 127 Z" fill="#f4f4ea" stroke="#0d0d0d" strokeWidth="1.5" />
            {/* lingua bifurcada */}
            <path className="cobra-champ__tongue" d="M150 135 L 150 168 M150 168 L 140 182 M150 168 L 160 182" stroke="#ff3b1f" strokeWidth="5" strokeLinecap="round" fill="none" />
          </g>

          {/* coroa de campeao */}
          <g className="cobra-champ__crown">
            <path d="M122 58 L 128 30 L 140 46 L 150 22 L 160 46 L 172 30 L 178 58 Z" fill="#ffc400" stroke="#0d0d0d" strokeWidth="4" strokeLinejoin="round" />
            <circle cx="150" cy="44" r="4" fill="#ff3b1f" />
          </g>
        </g>
      </svg>
    </div>
  );
}
