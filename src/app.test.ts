import assert from "node:assert/strict";
import { test } from "node:test";
import { buildApp } from "./app.js";

test("health endpoint reports that the service is available", async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  const response = await app.inject({ method: "GET", url: "/health" });

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.json(), { status: "ok" });
});

test("match simulation rejects malformed input", async (t) => {
  const app = buildApp();
  t.after(() => app.close());

  const response = await app.inject({
    method: "POST",
    url: "/matches/simulate",
    payload: { homeTeam: "not a team" },
  });

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.json(), { error: "Invalid match input" });
});
