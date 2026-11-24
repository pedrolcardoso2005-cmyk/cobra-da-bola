// Campo de senha com "mostrar senha" (no celular e facil digitar errado e
// nao perceber). Mantem o autocomplete para o navegador oferecer salvar e
// preencher a senha em qualquer aparelho.
import { useState } from "react";

export function PasswordInput(props: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: "current-password" | "new-password";
  minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        id={props.id}
        name="password"
        type={show ? "text" : "password"}
        required
        minLength={props.minLength}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        autoComplete={props.autoComplete}
        style={{ paddingRight: "4.8rem", width: "100%" }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Esconder senha" : "Mostrar senha"}
        style={{
          position: "absolute",
          right: 6,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          color: "var(--escama)",
          fontWeight: 700,
          fontSize: "0.8rem",
          cursor: "pointer",
          padding: "0.3rem",
        }}
      >
        {show ? "Esconder" : "Mostrar"}
      </button>
    </div>
  );
}
