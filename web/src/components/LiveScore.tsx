// Placar sempre visivel no topo da tela do jogador: equipes (Fase 1),
// duelo 1 x 1 (semifinal/final) ou classificados (carreira). Na Fase 1
// tambem mostra de quem e a vez e a ordem de cada equipe.
import type { MatchState, PlayerRef, TeamState } from "@cobra/shared";
import { careerQuotaFor, teamDisplayName } from "@cobra/shared";
import "./LiveScore.css";

const TARGET = 10;

function nameOf(match: MatchState, id: string | null | undefined): string {
  return match.players.find((p: PlayerRef) => p.id === id)?.displayName ?? "?";
}

export function LiveScore({ match, selfId }: { match: MatchState; selfId: string }) {
  if (match.phase === "phase1" && match.teams) {
    const [a, b] = match.teams as TeamState[];
    return (
      <section className="live-score" aria-label="Placar">
        <div className="live-score__row">
          <span className="live-score__name live-score__name--a">{teamDisplayName(match.settings, "A")}</span>
          <span className="live-score__nums font-score">
            {a.score} <small>x</small> {b.score}
          </span>
          <span className="live-score__name live-score__name--b">{teamDisplayName(match.settings, "B")}</span>
        </div>
        <p className="live-score__sub">Primeira equipe a {TARGET} pontos vence</p>
        <div className="live-score__turn">
          Vez agora: <strong>{nameOf(match, a.playerIds[a.rotationIndex])}</strong> x <strong>{nameOf(match, b.playerIds[b.rotationIndex])}</strong>
        </div>
        <div className="live-score__orders">
          {[a, b].map((t) => (
            <ol key={t.id} className={`live-score__order live-score__order--${t.id.toLowerCase()}`}>
              {t.playerIds.map((pid, i) => (
                <li key={pid} className={`${i === t.rotationIndex ? "is-now" : ""} ${pid === selfId ? "is-self" : ""}`}>
                  {i === t.rotationIndex ? "▶ " : ""}
                  {nameOf(match, pid)}
                </li>
              ))}
            </ol>
          ))}
        </div>
      </section>
    );
  }

  if (match.phase === "semifinal" || match.phase === "final") {
    const m = match.phase === "final" ? match.final : match.semifinal?.[match.semifinalActiveIndex ?? 0];
    if (!m) return null;
    return (
      <section className="live-score" aria-label="Placar">
        <div className="live-score__row">
          <span className="live-score__name live-score__name--a">{nameOf(match, m.playerAId)}</span>
          <span className="live-score__nums font-score">
            {m.scoreA} <small>x</small> {m.scoreB}
          </span>
          <span className="live-score__name live-score__name--b">{nameOf(match, m.playerBId)}</span>
        </div>
        <p className="live-score__sub">
          {match.phase === "final" ? "Final" : m.label} -- primeiro a {TARGET} pontos
        </p>
      </section>
    );
  }

  if (match.phase === "career" && match.career) {
    const cohort = [...match.career.eligiblePlayerIds, ...match.careerResults.map((r) => r.playerId)];
    const rankOf = new Map(match.careerResults.map((r) => [r.playerId, r.rank]));
    return (
      <section className="live-score" aria-label="Placar">
        <div className="live-score__row">
          <span className="live-score__name">Desafio das Carreiras</span>
        </div>
        <p className="live-score__sub">
          {(() => {
            const quota = careerQuotaFor(cohort.length);
            const left = Math.max(0, quota - match.careerResults.length);
            const dest = quota === 2 ? "a final" : "a semifinal";
            return `Sem placar: acertou, vai para ${dest}. Faltam ${left} de ${quota} vagas.`;
          })()}
        </p>
        <ul className="live-score__career">
          {cohort.map((pid) => {
            const rank = rankOf.get(pid);
            return (
              <li key={pid} className={`${rank ? "is-in" : ""} ${pid === selfId ? "is-self" : ""}`}>
                <span>{nameOf(match, pid)}</span>
                <strong>{rank ? `${rank}o classificado` : "tentando"}</strong>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }
  return null;
}
