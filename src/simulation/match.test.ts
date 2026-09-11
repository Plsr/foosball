import { describe, expect, it } from "vitest";
import { GOALS_PER_TEAM, samplePoisson, simulateMatch } from "./match";

function sequence(values: number[]): () => number {
  let index = 0;
  return () => values[index++] ?? 0;
}

describe("simulateMatch", () => {
  it("returns a score and Team A win", () => {
    const result = simulateMatch(sequence([0.5, 0.5, 0.5, 0.1, 0.1]));
    expect(result).toEqual({ teamAGoals: 2, teamBGoals: 0, outcome: "Team A wins" });
  });

  it("can return a draw", () => {
    const result = simulateMatch(() => 0.1);
    expect(result).toEqual({ teamAGoals: 0, teamBGoals: 0, outcome: "Draw" });
  });

  it("rejects invalid means", () => {
    expect(() => samplePoisson(0)).toThrow(RangeError);
  });

  it("converges on the planned scoring average", () => {
    let state = 123456789;
    const random = () => {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 2 ** 32;
    };
    const games = Array.from({ length: 50_000 }, () => simulateMatch(random));
    const mean = games.reduce((sum, game) => sum + game.teamAGoals + game.teamBGoals, 0) / games.length;
    expect(mean).toBeCloseTo(GOALS_PER_TEAM * 2, 1);
  });
});
