export const GOALS_PER_TEAM = 1.576;

export type MatchOutcome = "Team A wins" | "Draw" | "Team B wins";

export interface MatchResult {
  teamAGoals: number;
  teamBGoals: number;
  outcome: MatchOutcome;
}

/** Draw a Poisson-distributed value using Knuth's algorithm. */
export function samplePoisson(mean: number, random: () => number = Math.random): number {
  if (!Number.isFinite(mean) || mean <= 0) {
    throw new RangeError("The Poisson mean must be a positive finite number.");
  }

  const threshold = Math.exp(-mean);
  let product = 1;
  let draws = 0;

  do {
    draws += 1;
    product *= random();
  } while (product > threshold);

  return draws - 1;
}

/**
 * Simulate one match. This module has no framework dependencies, so the same
 * function can be called from server actions, API routes, or batch jobs.
 */
export function simulateMatch(random: () => number = Math.random): MatchResult {
  const teamAGoals = samplePoisson(GOALS_PER_TEAM, random);
  const teamBGoals = samplePoisson(GOALS_PER_TEAM, random);

  const outcome: MatchOutcome =
    teamAGoals > teamBGoals
      ? "Team A wins"
      : teamAGoals < teamBGoals
        ? "Team B wins"
        : "Draw";

  return { teamAGoals, teamBGoals, outcome };
}
