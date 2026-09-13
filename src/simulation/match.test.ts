import assert from "node:assert/strict";
import { test } from "node:test";
import { GOALS_PER_TEAM, samplePoisson, simulateMatch } from "./match.js";

function sequence(values: number[]): () => number {
  let index = 0;
  return () => values[index++] ?? 0;
}

test("returns a score and Team A win", () => {
  const result = simulateMatch(sequence([0.5, 0.5, 0.5, 0.1, 0.1]));
  assert.deepEqual(result, { teamAGoals: 2, teamBGoals: 0, outcome: "Team A wins" });
});

test("can return a draw", () => {
  const result = simulateMatch(() => 0.1);
  assert.deepEqual(result, { teamAGoals: 0, teamBGoals: 0, outcome: "Draw" });
});

test("rejects invalid means", () => {
  assert.throws(() => samplePoisson(0), RangeError);
});

test("converges on the planned scoring average", () => {
  let state = 123456789;
  const random = () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
  const games = Array.from({ length: 50_000 }, () => simulateMatch(random));
  const mean = games.reduce((sum, game) => sum + game.teamAGoals + game.teamBGoals, 0) / games.length;
  assert.ok(Math.abs(mean - GOALS_PER_TEAM * 2) < 0.05);
});
