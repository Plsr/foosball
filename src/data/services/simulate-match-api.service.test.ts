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
      readBody: async () => ({
        homeTeam: { id: "home", name: "Home", strength: 70 },
        awayTeam: { id: "away", name: "Away", strength: 65 },
        seed: 42,
      }),
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

test("does not read the request body before authenticating", async () => {
  let bodyWasRead = false;
  const result = await simulateMatchApi(
    {
      cookies: [],
      readBody: async () => {
        bodyWasRead = true;
        return {};
      },
    },
    { createRequestContext: () => ({ getCurrentViewer: async () => null }) },
  );

  assert.deepEqual(result, { status: "unauthenticated" });
  assert.equal(bodyWasRead, false);
});

test("rejects unreadable and invalid request bodies", async () => {
  const dependencies = { createRequestContext: authenticatedContext };
  const unreadable = await simulateMatchApi(
    { cookies: [], readBody: async () => Promise.reject(new SyntaxError("JSON")) },
    dependencies,
  );
  const invalid = await simulateMatchApi(
    { cookies: [], readBody: async () => ({ seed: 42 }) },
    dependencies,
  );

  assert.deepEqual(unreadable, { status: "invalid-input" });
  assert.deepEqual(invalid, { status: "invalid-input" });
});
