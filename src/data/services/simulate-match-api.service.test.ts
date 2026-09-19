import assert from "node:assert/strict";
import { test } from "node:test";
import { simulateMatchApi } from "./simulate-match-api.service.js";

const authenticatedContext = () => ({
  getCurrentViewer: async () => ({ id: "viewer-1", email: null, userName: null }),
});

test("returns a deterministic match result for valid authenticated input", async () => {
  const result = await simulateMatchApi(
    {
      cookies: [],
      body: {
        homeTeam: { id: "home", name: "Home", strength: 70 },
        awayTeam: { id: "away", name: "Away", strength: 65 },
        seed: 42,
      },
    },
    { createRequestContext: authenticatedContext },
  );

  assert.deepEqual(result, {
    status: "success",
    match: {
      homeTeamId: "home",
      awayTeamId: "away",
      homeGoals: 3,
      awayGoals: 2,
      seed: 42,
    },
  });
});

test("rejects an unauthenticated request", async () => {
  const result = await simulateMatchApi(
    {
      body: {},
      cookies: [],
    },
    { createRequestContext: () => ({ getCurrentViewer: async () => null }) },
  );

  assert.deepEqual(result, { status: "unauthenticated" });
});

test("rejects an invalid request body", async () => {
  const dependencies = { createRequestContext: authenticatedContext };
  const invalid = await simulateMatchApi(
    { body: { seed: 42 }, cookies: [] },
    dependencies,
  );

  assert.deepEqual(invalid, { status: "invalid-input" });
});
