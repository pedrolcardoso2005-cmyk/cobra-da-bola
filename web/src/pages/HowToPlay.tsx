import { Link } from "react-router-dom";
import {
  CareerChallengeIllustration,
  FinalIllustration,
  Phase1Illustration,
  SemifinalIllustration,
} from "../components/HowToPlayIllustrations";
import "./HowToPlay.css";

const STEPS = [
  {
    title: "1. Primeira etapa -- Perguntas",
    text: "Os jogadores sao divididos em grupos e disputam perguntas. Quem chegar a 10 pontos se classifica.",
    Illustration: Phase1Illustration,
  },
  {
    title: "2. Desafio das Carreiras",
    text: 'Os classificados disputam carreiras de jogadores. Os clubes aparecem um por um. Quem souber pode responder antes de aparecerem todos os clubes. Se errar, fica fora daquela carreira e volta a participar quando comecar a carreira do proximo jogador.',
    Illustration: CareerChallengeIllustration,
  },
  {
    title: "3. Semifinal",
    text: "Quando houver semifinal, os classificados disputam confrontos X1. Quem vencer avanca.",
    Illustration: SemifinalIllustration,
  },
  {
    title: "4. Final",
    text: "Os vencedores disputam a final X1. Quem chegar a 10 pontos e o campeao.",
    Illustration: FinalIllustration,
  },
];

/** Shared "Como Jogar" explainer -- used both on the public landing (before
 * login) and from the post-login hub. `ctaTo`/`ctaLabel` let the caller
 * decide what the closing button does; omit `ctaTo` to hide it entirely
 * (e.g. when reached from inside the already-logged-in app). */
export default function HowToPlay({ ctaTo, ctaLabel }: { ctaTo?: string; ctaLabel?: string }) {
  return (
    <div className="howto-page">
      <header className="howto-page__header">
        <h1 className="font-display brand-title">Como jogar</h1>
        <p className="brand-subtitle">
          Um exemplo com uma partida grande (10 jogadores) -- o jogo se adapta sozinho conforme a quantidade de participantes.
        </p>
      </header>

      <div className="howto-steps">
        {STEPS.map(({ title, text, Illustration }) => (
          <section key={title} className="howto-step panel sticker">
            <Illustration />
            <h2 className="font-display howto-step__title">{title}</h2>
            <p className="howto-step__text">{text}</p>
          </section>
        ))}
      </div>

      <p className="howto-page__players-note sticker-sm font-display">Quantidade de jogadores: 1 a 12</p>

      {ctaTo && (
        <Link className="btn btn-primary btn-block howto-page__cta" to={ctaTo}>
          {ctaLabel ?? "Vamos jogar"}
        </Link>
      )}
    </div>
  );
}
