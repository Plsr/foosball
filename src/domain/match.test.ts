import assert from "node:assert/strict";
import { test } from "node:test";
import { simulateMatch, type Team } from "./match.js";

const homeTeam: Team = { id: "home", name: "Home FC", strength: 70 };
const awayTeam: Team = { id: "away", name: "Away FC", strength: 65 };

test("simulating the same match with the same seed is deterministic", () => {
  assert.deepEqual(
    simulateMatch(homeTeam, awayTeam, 42),
    simulateMatch(homeTeam, awayTeam, 42),
  );
});

test("a result identifies both teams and the seed used", () => {
  const result = simulateMatch(homeTeam, awayTeam, 42);

  assert.equal(result.homeTeamId, "home");
  assert.equal(result.awayTeamId, "away");
  assert.equal(result.seed, 42);
  assert.ok(Number.isInteger(result.homeGoals) && result.homeGoals >= 0);
  assert.ok(Number.isInteger(result.awayGoals) && result.awayGoals >= 0);
});
