import { careerLineup, type MatchState } from "@cobra/shared";
import { PlayerIcon } from "./PlayerIcon";
import "./CareerScene.css";

/**
 * Cenario do Desafio das Carreiras: o cohort real (2 a 6 jogadores,
 * conforme a origem) em flex-wrap, distinguindo quem ja classificou
 * (selo), quem foi excluido so nesta rodada (esmaecido) e quem ainda
 * compete -- nunca um jogador inventado para preencher espaco.
 */
export function CareerScene({ match }: { match: MatchState }) {
  const lineup = careerLineup(match);
  if (!lineup) return null;

  return (
    <div className="career-scene sticker-sm" role="img" aria-label="Cenario do Desafio das Carreiras com o grupo de jogadores que ainda disputa a vaga">
      <span className="career-scene__title font-display">De quem e essa carreira?</span>
      <div className="career-scene__players">
        {lineup.classified.map((p) => (
          <PlayerIcon key={p.id} name={p.displayName} variant="neutral" classified />
        ))}
        {lineup.stillCompeting.map((p) => (
          <PlayerIcon key={p.id} name={p.displayName} variant="neutral" />
        ))}
        {lineup.excludedThisRound.map((p) => (
          <PlayerIcon key={p.id} name={p.displayName} variant="neutral" excluded />
        ))}
      </div>
    </div>
  );
}
