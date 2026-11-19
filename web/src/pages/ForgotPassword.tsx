import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/auth/esqueci-senha", { email });
    } finally {
      setLoading(false);
      setSent(true);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card panel sticker">
        <h1 className="brand-title font-display">Recuperar senha</h1>
        {sent ? (
          <p>Se existir uma conta com esse e-mail, um link de redefinicao foi gerado. Fale com o administrador do servidor caso precise do link manualmente (o envio por e-mail ainda nao esta configurado).</p>
        ) : (
          <form onSubmit={onSubmit} className="stack">
            <div className="field">
              <label htmlFor="email">E-mail da conta</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar link de redefinicao"}
            </button>
          </form>
        )}
        <div className="stack" style={{ marginTop: "1rem" }}>
          <Link className="link-muted" to="/login">Voltar para o login</Link>
        </div>
      </div>
    </div>
  );
}
