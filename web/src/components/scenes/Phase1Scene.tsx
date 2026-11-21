import { phase1Lineup, type MatchState } from "@cobra/shared";
import { PlayerIcon } from "./PlayerIcon";
import "./Phase1Scene.css";

/**
 * "Mesa do grupo": as duas equipes reais lado a lado, cada uma em uma
 * linha flex-wrap (nunca coordenadas fixas), entao escala sozinha de 1 a
 * 6 jogadores por lado sem overlap. So renderiza quando phase1Lineup
 * retorna algo -- nunca aparece para n=2/n=3, nem depois que a fase 1 ja
 * terminou (null nesses casos, por design).
 */
export function Phase1Scene({ match }: { match: MatchState }) {
  const lineup = phase1Lineup(match);
  if (!lineup) return null;

  return (
    <div className="phase1-scene sticker-sm" role="img" aria-label="Mesa do grupo: duas equipes disputando a Fase 1">
      <div className="phase1-scene__team phase1-scene__team--a">
        {lineup.teamA.map((p) => (
          <PlayerIcon key={p.id} name={p.displayName} variant="team-a" onDeck={p.id === lineup.onDeckAId} />
        ))}
      </div>
      <span className="phase1-scene__vs font-display">X</span>
      <div className="phase1-scene__team phase1-scene__team--b">
        {lineup.teamB.map((p) => (
          <PlayerIcon key={p.id} name={p.displayName} variant="team-b" onDeck={p.id === lineup.onDeckBId} />
        ))}
      </div>
    </div>
  );
}
