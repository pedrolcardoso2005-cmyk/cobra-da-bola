import "./HowToPlayIllustrations.css";

/**
 * Four small inline-SVG scenes for the "Como Jogar" explainer, one per
 * stage of a match. Same idiom as PresenterCharacter.tsx: hand-built from
 * primitive shapes (no bitmaps, no real crests/photos), colored with the
 * game's existing tokens so they read as part of the same poster/comic
 * identity instead of a bolted-on illustration style.
 */

type PlayerColor = "lima" | "bote" | "giz";

function Player({ x, y, color, scale = 1 }: { x: number; y: number; color: PlayerColor; scale?: number }) {
  return (
    <g className={`howto-player howto-player--${color}`} transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-13} y={-6} width={26} height={30} rx={9} className="howto-player__body" />
      <circle cx={0} cy={-20} r={12} className="howto-player__head" />
    </g>
  );
}

function Presenter({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <g className="howto-presenter" transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-16} y={-8} width={32} height={36} rx={10} className="howto-presenter__body" />
      <rect x={-16} y={-8} width={32} height={10} rx={5} className="howto-presenter__trim" />
      <circle cx={0} cy={-24} r={13} className="howto-presenter__head" />
      <rect x={-26} y={-4} width={16} height={20} rx={4} className="howto-presenter__card" />
    </g>
  );
}

function QuestionBubble({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-34} y={-18} width={68} height={36} rx={10} className="howto-bubble" />
      <polygon points="-6,18 6,18 -2,30" className="howto-bubble" />
      <text x={0} y={6} textAnchor="middle" className="howto-bubble__text font-display">
        ?
      </text>
    </g>
  );
}

export function Phase1Illustration() {
  return (
    <svg viewBox="0 0 400 240" className="howto-illustration" role="img" aria-label="Jogadores divididos em duas equipes disputam perguntas no buzzer, com o apresentador no centro">
      <QuestionBubble x={200} y={38} />
      {[0, 1, 2].map((i) => (
        <Player key={`a${i}`} x={60 + i * 10} y={150 + i * 4} color="lima" scale={0.95 - i * 0.05} />
      ))}
      {[0, 1, 2].map((i) => (
        <Player key={`b${i}`} x={340 - i * 10} y={150 + i * 4} color="bote" scale={0.95 - i * 0.05} />
      ))}
      <Presenter x={200} y={150} scale={1.15} />
      <circle cx={200} cy={206} r={20} className="howto-buzzer" />
      <text x={200} y={211} textAnchor="middle" className="howto-buzzer__text font-display">
        !
      </text>
    </svg>
  );
}

export function CareerChallengeIllustration() {
  const clubs = ["SANTOS", "BARCELONA", "PSG"];
  return (
    <svg viewBox="0 0 400 240" className="howto-illustration" role="img" aria-label="Apresentador revela clubes um por um enquanto jogadores classificados tentam descobrir qual jogador e esse">
      <Presenter x={200} y={48} scale={1.1} />
      {clubs.map((club, i) => (
        <g key={club} transform={`translate(${58 + i * 102} 110)`}>
          <rect x={-43} y={-20} width={86} height={40} rx={8} className="howto-club-card" />
          <text x={0} y={5} textAnchor="middle" className="howto-club-card__text font-display">
            {club}
          </text>
        </g>
      ))}
      <g transform="translate(348 110)">
        <rect x={-28} y={-20} width={56} height={40} rx={8} className="howto-club-card howto-club-card--mystery" />
        <text x={0} y={7} textAnchor="middle" className="howto-club-card__text font-display">
          ?
        </text>
      </g>
      <path d="M 15 110 H 320" className="howto-arrow-line" />
      {[0, 1, 2].map((i) => (
        <Player key={i} x={150 + i * 50} y={195} color={i === 1 ? "lima" : "giz"} scale={0.9} />
      ))}
    </svg>
  );
}

export function SemifinalIllustration() {
  return (
    <svg viewBox="0 0 400 240" className="howto-illustration" role="img" aria-label="Dois jogadores se enfrentam um contra um na semifinal, com o apresentador ao fundo e uma pergunta no centro">
      <Presenter x={200} y={54} scale={0.9} />
      <QuestionBubble x={200} y={120} />
      <Player x={90} y={175} color="lima" scale={1.3} />
      <Player x={310} y={175} color="bote" scale={1.3} />
      <text x={200} y={200} textAnchor="middle" className="howto-vs font-display">
        X1
      </text>
    </svg>
  );
}

export function FinalIllustration() {
  return (
    <svg viewBox="0 0 400 240" className="howto-illustration" role="img" aria-label="Final entre dois jogadores disputando o titulo de campeao, com uma taca estilizada e o apresentador ao fundo">
      <polygon
        points="200,16 206.5,31.1 222.8,32.6 210.5,43.4 214.1,59.4 200,51 185.9,59.4 189.5,43.4 177.2,32.6 193.5,31.1"
        className="howto-trophy"
      />
      <Presenter x={200} y={102} scale={0.85} />
      <QuestionBubble x={200} y={150} />
      <Player x={90} y={200} color="lima" scale={1.3} />
      <Player x={310} y={200} color="bote" scale={1.3} />
      <text x={200} y={226} textAnchor="middle" className="howto-vs font-display">
        X1 -- CAMPEAO
      </text>
    </svg>
  );
}
