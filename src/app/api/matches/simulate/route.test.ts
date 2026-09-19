import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { POST } from "./route.js";

test("authenticates before parsing malformed JSON", async () => {
  const request = new NextRequest("https://app.example.com/api/matches/simulate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{",
  });

  const response = await POST(request);

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Authentication required" });
});
