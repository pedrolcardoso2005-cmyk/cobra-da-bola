import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { ApiError } from "../lib/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nao foi possivel entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card panel sticker">
        <h1 className="brand-title font-display">Cobra da Bola</h1>
        <p className="brand-subtitle">Entre para disputar quem e o cobra da bola.</p>
        <form onSubmit={onSubmit} className="stack">
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Senha</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          {error && <span className="error-text">{error}</span>}
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div className="stack" style={{ marginTop: "1rem" }}>
          <Link className="link-muted" to="/esqueci-senha">Esqueci minha senha</Link>
          <Link className="link-muted" to="/registrar">Nao tenho conta -- criar agora</Link>
        </div>
      </div>
    </div>
  );
}
