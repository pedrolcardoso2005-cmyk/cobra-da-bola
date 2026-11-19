const K_FACTOR = 32;

/** Standard Elo update for a 1v1 ranked result. Returns the rating delta
 * to apply to the winner (the loser gets the negated amount). */
export function eloDelta(winnerRating: number, loserRating: number): number {
  const expectedWin = 1 / (1 + 10 ** ((loserRating - winnerRating) / 400));
  return Math.round(K_FACTOR * (1 - expectedWin));
}
