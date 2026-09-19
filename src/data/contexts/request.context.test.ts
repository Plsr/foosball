import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequestContext } from "./request.context.js";

test("resolves the current viewer only once per request context", async () => {
  let lookups = 0;
  const viewer = { id: "viewer-1", email: "manager@example.com", userName: "Manager" };
  const context = createRequestContext(
    { cookies: [] },
    {
      createAuthRepository: () => ({
        completeGitHubSignIn: async () => false,
        getCurrentViewer: async () => {
          lookups += 1;
          return viewer;
        },
        getEffects: () => ({ cookies: [], headers: [] }),
        isConfigured: () => true,
        signOut: async () => undefined,
        startGitHubSignIn: async () => null,
      }),
    },
  );

  const [first, second] = await Promise.all([
    context.getCurrentViewer(),
    context.getCurrentViewer(),
  ]);

  assert.equal(lookups, 1);
  assert.equal(first, viewer);
  assert.equal(second, viewer);
});
