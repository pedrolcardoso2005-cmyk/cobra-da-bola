import { Link } from "react-router-dom";
import "./Landing.css";

/** First thing an unauthenticated visitor sees at "/" -- no account needed
 * to understand the game. The real post-login hub (Home.tsx) only renders
 * once there's a logged-in user; see the `Entry` component in App.tsx. */
export default function Landing() {
  return (
    <div className="landing-shell">
      <div className="landing-card auth-card panel sticker">
        <h1 className="font-display brand-title">Cobra da Bola</h1>
        <p className="brand-subtitle">O quiz de futebol em grupo -- perguntas, carreiras e confrontos ate o campeao.</p>
        <Link className="btn btn-primary btn-block" to="/como-jogar">
          Como jogar
        </Link>
        <Link className="link-muted landing-shell__login-link" to="/login">
          Ja tenho conta -- entrar
        </Link>
      </div>
    </div>
  );
}
