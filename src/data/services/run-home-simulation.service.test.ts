import assert from "node:assert/strict";
import { test } from "node:test";
import { runHomeSimulation } from "./run-home-simulation.service.js";

test("returns the simulation result for an authenticated viewer", async () => {
  const simulation = { teamAGoals: 2, teamBGoals: 1, outcome: "Team A wins" as const };
  const result = await runHomeSimulation(
    { cookies: [] },
    {
      createRequestContext: () => ({
        getCurrentViewer: async () => ({ id: "viewer-1", email: null, userName: null }),
      }),
      simulateMatch: () => simulation,
    },
  );

  assert.deepEqual(result, { status: "ready", simulation });
});
