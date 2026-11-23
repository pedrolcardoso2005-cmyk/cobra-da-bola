// Table-driven implementation of the competitive format table (document
// section 10). Encoding it as data + two small generic rules, instead of
// special-casing every player count, is what lets 2..12 all share one engine
// without bending any of the stated numbers:
//
//  - n === 2: a single 1v1 stage to 10 points IS the final (no teams).
//  - n === 3: no Phase 1; all three go straight to the career stage.
//  - n >= 4: two teams of ceil(n/2) and floor(n/2) play Phase 1 to 10.
//            The winning team's players dispute the career stage.
//
// What the career stage does with its cohort is itself a single generic
// rule, not per-n special casing:
//  - cohort size 2 -> both go directly to the Final.
//  - cohort size 3 -> top 2 correct-answer order go to the Final, 3rd eliminated.
//  - cohort size 4 -> all 4 ranked by order of correct answers -> Semifinals.
//  - cohort size 5 or 6 -> first 4 correct answers classify (ranked) -> Semifinals,
//                          the rest are eliminated.

export type ParticipantCount = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export function isValidParticipantCount(n: number): n is ParticipantCount {
  return Number.isInteger(n) && n >= 2 && n <= 12;
}

export interface FormatPlan {
  n: ParticipantCount;
  hasTeams: boolean;
  hasPhase1: boolean;
  teamASize: number;
  teamBSize: number;
}

export function planForParticipantCount(n: ParticipantCount): FormatPlan {
  if (n === 2) {
    return { n, hasTeams: false, hasPhase1: true, teamASize: 0, teamBSize: 0 };
  }
  if (n === 3) {
    return { n, hasTeams: false, hasPhase1: false, teamASize: 0, teamBSize: 0 };
  }
  const teamASize = Math.ceil(n / 2);
  const teamBSize = Math.floor(n / 2);
  return { n, hasTeams: true, hasPhase1: true, teamASize, teamBSize };
}

export type CareerRouting =
  | { outcome: "direct_final"; finalists: [string, string] }
  | { outcome: "top2_to_final"; finalists: [string, string]; eliminated: string[] }
  | { outcome: "to_semifinals"; seeded: string[]; eliminated: string[] };

/**
 * Given the players who disputed the career stage, in the order they
 * classified (index 0 = first correct answer = rank 1), decide where they go.
 * `rankedIds` must already reflect only players who actually classified;
 * callers eliminate anyone who never got a correct answer when the cohort
 * is larger than the classification quota (handled by the engine, which
 * knows how many attempts/questions were used).
 */
export function routeCareerResult(cohortIds: string[], rankedIds: string[]): CareerRouting {
  const cohortSize = cohortIds.length;
  if (cohortSize === 2) {
    return { outcome: "direct_final", finalists: [cohortIds[0], cohortIds[1]] };
  }
  if (cohortSize === 3) {
    const finalists = rankedIds.slice(0, 2) as [string, string];
    const eliminated = cohortIds.filter((id) => !finalists.includes(id));
    return { outcome: "top2_to_final", finalists, eliminated };
  }
  // cohortSize === 4, 5, or 6
  const seeded = rankedIds.slice(0, 4);
  const eliminated = cohortIds.filter((id) => !seeded.includes(id));
  return { outcome: "to_semifinals", seeded, eliminated };
}

/** How many career classification slots a cohort of this size has. */
export function careerQuotaFor(cohortSize: number): number {
  if (cohortSize <= 3) return cohortSize === 3 ? 2 : cohortSize;
  return 4;
}

/** 1st vs 4th, 2nd vs 3rd, per section 11. */
export function semifinalPairings(seeded: string[]): [[string, string], [string, string]] {
  if (seeded.length !== 4) {
    throw new Error("semifinalPairings requires exactly 4 seeded players");
  }
  const [first, second, third, fourth] = seeded;
  return [
    [first, fourth],
    [second, third],
  ];
}

/** Nome da equipe para mostrar na tela ("Equipe A" se o anfitriao nao mudou). */
export function teamDisplayName(settings: { teamNames?: Partial<Record<"A" | "B", string>> }, team: "A" | "B"): string {
  const name = settings.teamNames?.[team]?.trim();
  return name ? name : `Equipe ${team}`;
}
