import { PasswordInput } from "../components/PasswordInput";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../lib/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.post("/api/auth/redefinir-senha", { token, password });
      setDone(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Nao foi possivel redefinir a senha");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card panel sticker">
        <h1 className="brand-title font-display">Nova senha</h1>
        {done ? (
          <p>Senha redefinida! Redirecionando para o login...</p>
        ) : (
          <form onSubmit={onSubmit} className="stack">
            <div className="field">
              <label htmlFor="password">Nova senha</label>
              <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="new-password" minLength={8} />
            </div>
            {error && <span className="error-text">{error}</span>}
            <button className="btn btn-primary btn-block" type="submit" disabled={loading || !token}>
              {loading ? "Salvando..." : "Redefinir senha"}
            </button>
            {!token && <span className="error-text">Link invalido: token ausente.</span>}
          </form>
        )}
        <div className="stack" style={{ marginTop: "1rem" }}>
          <Link className="link-muted" to="/login">Voltar para o login</Link>
        </div>
      </div>
    </div>
  );
}
