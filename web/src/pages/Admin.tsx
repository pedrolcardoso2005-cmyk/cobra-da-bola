// Painel do administrador: quantas contas existem e quantas pessoas estao
// usando o jogo. Atualiza sozinho a cada 15 segundos.
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../state/AuthContext";
import "./Ranking.css";

interface AdminSummary {
  geradoEm: number;
  usuarios: { total: number; novos24h: number; novos7d: number };
  atividade: { onlineAgora: number; ativos24h: number; ativos7d: number; respostasSolo24h: number };
  partidas: { salasAbertas: number; salasJogando: number; jogadoresEmSalas: number; iniciadas24h: number; total: number };
  ultimosCadastros: { nome: string; email: string; criadoEm: number }[];
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ minWidth: "8rem" }}>
      <div className="font-score" style={{ fontSize: "2rem" }}>{value}</div>
      <div style={{ fontSize: "0.85rem" }}>{label}</div>
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) return;
    let alive = true;
    const load = () =>
      api
        .get<AdminSummary>("/api/admin/resumo")
        .then((d) => alive && (setData(d), setError(null)))
        .catch((e) => alive && setError(e instanceof Error ? e.message : "Erro ao carregar"));
    load();
    const id = setInterval(load, 15_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [user?.isAdmin]);

  if (!user?.isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="home-shell">
      <Link className="link-muted" to="/">Voltar</Link>
      <h1 className="font-display" style={{ color: "var(--lima)" }}>Painel do admin</h1>
      {error && <p className="error-text">{error}</p>}
      {!data ? (
        <p>Carregando...</p>
      ) : (
        <>
          <section className="panel sticker home-card">
            <h2 className="font-display">Agora</h2>
            <div className="row" style={{ flexWrap: "wrap", gap: "1.5rem" }}>
              <Stat label="Online agora (ultimos 5 min)" value={data.atividade.onlineAgora} />
              <Stat label="Jogadores em salas" value={data.partidas.jogadoresEmSalas} />
              <Stat label="Salas abertas" value={data.partidas.salasAbertas} />
              <Stat label="Salas em jogo" value={data.partidas.salasJogando} />
            </div>
          </section>

          <section className="panel sticker home-card">
            <h2 className="font-display">Contas</h2>
            <div className="row" style={{ flexWrap: "wrap", gap: "1.5rem" }}>
              <Stat label="Contas criadas" value={data.usuarios.total} />
              <Stat label="Novas em 24h" value={data.usuarios.novos24h} />
              <Stat label="Novas em 7 dias" value={data.usuarios.novos7d} />
            </div>
          </section>

          <section className="panel sticker home-card">
            <h2 className="font-display">Quem esta jogando</h2>
            <div className="row" style={{ flexWrap: "wrap", gap: "1.5rem" }}>
              <Stat label="Ativos em 24h" value={data.atividade.ativos24h} />
              <Stat label="Ativos em 7 dias" value={data.atividade.ativos7d} />
              <Stat label="Respostas no Modo Solo (24h)" value={data.atividade.respostasSolo24h} />
              <Stat label="Partidas iniciadas (24h)" value={data.partidas.iniciadas24h} />
              <Stat label="Partidas no total" value={data.partidas.total} />
            </div>
          </section>

          <section className="panel sticker home-card">
            <h2 className="font-display">Ultimos cadastros</h2>
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {data.ultimosCadastros.map((u) => (
                  <tr key={u.email}>
                    <td>{u.nome}</td>
                    <td>{u.email}</td>
                    <td>{new Date(u.criadoEm).toLocaleString("pt-BR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <p style={{ fontSize: "0.8rem", color: "var(--giz-dim)" }}>
            Atualiza sozinho a cada 15 s. "Online agora" e "salas" zeram quando o site e reiniciado.
          </p>
        </>
      )}
    </div>
  );
}
