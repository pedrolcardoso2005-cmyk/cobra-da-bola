// Fase 6 ("programa de TV"): dados puros para compor os cenarios visuais de
// cada fase (quem sentar na mesa, quem esta classificado, quem disputa a
// final) -- sem nenhuma logica de pontuacao/classificacao nova, so leitura
// do MatchState ja existente. Vive em shared (nao em web/) para poder ser
// testado pelo runner de testes ja existente do servidor, sem precisar
// instalar um framework de teste so para o front-end.
import type { MatchState, PlayerRef } from "./types.js";

function findPlayer(match: MatchState, id: string): PlayerRef | undefined {
  return match.players.find((p) => p.id === id);
}

/** Nunca inventa um jogador: ids que nao forem encontrados (nao deveria
 * acontecer nunca) sao descartados em vez de virarem um personagem falso. */
function mapPlayers(match: MatchState, ids: string[]): PlayerRef[] {
  return ids.map((id) => findPlayer(match, id)).filter((p): p is PlayerRef => !!p);
}

export interface Phase1Lineup {
  teamA: PlayerRef[];
  teamB: PlayerRef[];
  /** Id de quem e o representante da vez em cada equipe (teams[].rotationIndex). */
  onDeckAId: string | null;
  onDeckBId: string | null;
}

/** null quando a fase 1 nao existe para esta partida (n=2 e n=3 nunca
 * passam por ela) ou a partida ja seguiu para outra fase -- nunca uma
 * composicao vazia/estranha, so "esta cena nao se aplica agora". */
export function phase1Lineup(match: MatchState): Phase1Lineup | null {
  if (match.phase !== "phase1" || !match.teams) return null;
  const [teamA, teamB] = match.teams;
  if (!teamA || !teamB) return null;
  return {
    teamA: mapPlayers(match, teamA.playerIds),
    teamB: mapPlayers(match, teamB.playerIds),
    onDeckAId: teamA.playerIds[teamA.rotationIndex] ?? null,
    onDeckBId: teamB.playerIds[teamB.rotationIndex] ?? null,
  };
}

export interface CareerLineup {
  stillCompeting: PlayerRef[];
  classified: PlayerRef[];
  excludedThisRound: PlayerRef[];
}

/** null quando nao ha carreira ativa agora. O cohort inteiro vem de
 * career.eligiblePlayerIds + careerResults -- nunca mais, nunca menos que
 * os participantes reais desta etapa (2 a 6, conforme planForParticipantCount
 * e routeCareerResult). */
export function careerLineup(match: MatchState): CareerLineup | null {
  if (match.phase !== "career" || !match.career) return null;
  const c = match.career;
  const excludedIds = new Set(c.excludedThisRound);
  const stillCompetingIds = c.eligiblePlayerIds.filter((id) => !excludedIds.has(id));
  const classifiedIds = match.careerResults.map((r) => r.playerId);
  return {
    stillCompeting: mapPlayers(match, stillCompetingIds),
    classified: mapPlayers(match, classifiedIds),
    excludedThisRound: mapPlayers(match, c.excludedThisRound),
  };
}

export interface BracketDuel {
  playerA: PlayerRef;
  playerB: PlayerRef;
  scoreA: number;
  scoreB: number;
}

/** Mostra so os 2 jogadores do confronto ATIVO (nunca eliminados, nunca de
 * outro confronto). null se o confronto ainda nao existir ou algum dos dois
 * ids nao resolver para um jogador real -- a cena simplesmente nao aparece
 * em vez de mostrar um espaco vazio ou um personagem inventado. */
export function bracketDuel(match: MatchState, variant: "semifinal" | "final"): BracketDuel | null {
  const matchup =
    variant === "semifinal"
      ? match.semifinal && match.semifinalActiveIndex != null
        ? (match.semifinal[match.semifinalActiveIndex] ?? null)
        : null
      : match.final;
  if (!matchup) return null;
  const playerA = findPlayer(match, matchup.playerAId);
  const playerB = findPlayer(match, matchup.playerBId);
  if (!playerA || !playerB) return null;
  return { playerA, playerB, scoreA: matchup.scoreA, scoreB: matchup.scoreB };
}
