export type Team = {
  id: string;
  name: string;
  strength: number;
};

export type MatchResult = {
  homeTeamId: string;
  awayTeamId: string;
  homeGoals: number;
  awayGoals: number;
  seed: number;
};

export function simulateMatch(
  homeTeam: Team,
  awayTeam: Team,
  seed: number,
): MatchResult {
  const homeAdvantage = 3;
  const homeGoals = goalsFor(homeTeam.strength + homeAdvantage, seed);
  const awayGoals = goalsFor(awayTeam.strength, seed + 1);

  return {
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeGoals,
    awayGoals,
    seed,
  };
}

function goalsFor(strength: number, seed: number): number {
  const normalizedStrength = Math.max(0, Math.min(100, strength));
  const randomFactor = Math.abs(Math.sin(seed * 12.9898)) % 1;
  const expectedGoals = normalizedStrength / 45;

  return Math.max(0, Math.floor(expectedGoals * randomFactor * 2.5));
}
