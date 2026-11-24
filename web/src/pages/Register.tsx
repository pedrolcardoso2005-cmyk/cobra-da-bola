import { PasswordInput } from "../components/PasswordInput";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { ApiError } from "../lib/api";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email, password, displayName);
      navigate("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nao foi possivel criar a conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card panel sticker">
        <h1 className="brand-title font-display">Criar conta</h1>
        <p className="brand-subtitle">Todo jogador precisa de uma conta -- sem modo convidado.</p>
        <form onSubmit={onSubmit} className="stack">
          <div className="field">
            <label htmlFor="displayName">Nome de exibicao</label>
            <input id="displayName" required minLength={2} maxLength={40} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </div>
          <div className="field">
            <label htmlFor="password">Senha (minimo 8 caracteres)</label>
            <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="new-password" minLength={8} />
          </div>
          {error && <span className="error-text">{error}</span>}
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>
        <div className="stack" style={{ marginTop: "1rem" }}>
          <Link className="link-muted" to="/login">Ja tenho conta -- entrar</Link>
        </div>
      </div>
    </div>
  );
}
