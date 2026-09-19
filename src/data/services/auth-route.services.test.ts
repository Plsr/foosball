import assert from "node:assert/strict";
import { test } from "node:test";
import { completeGitHubSignIn } from "./complete-github-sign-in.service.js";
import { signOut } from "./sign-out.service.js";
import { startGitHubSignIn } from "./start-github-sign-in.service.js";

const effects = {
  cookies: [{ name: "session", value: "token", options: { httpOnly: true } }],
  headers: [{ name: "cache-control", value: "private, no-store" }],
};

test("starts GitHub sign-in with a safe callback URL", async () => {
  let redirectTo = "";
  const result = await startGitHubSignIn(
    {
      cookies: [],
      origin: "https://app.example.com",
      next: "/career?season=2",
    },
    {
      createAuthRepository: () => ({
        getEffects: () => effects,
        startGitHubSignIn: async (value: string) => {
          redirectTo = value;
          return "https://github.com/login/oauth/authorize";
        },
      }),
    },
  );

  assert.equal(
    redirectTo,
    "https://app.example.com/auth/callback?next=%2Fcareer%3Fseason%3D2",
  );
  assert.deepEqual(result, {
    destination: "https://github.com/login/oauth/authorize",
    effects,
  });
});

test("returns to login when GitHub sign-in cannot start", async () => {
  const result = await startGitHubSignIn(
    { cookies: [], origin: "https://app.example.com", next: null },
    {
      createAuthRepository: () => ({
        getEffects: () => effects,
        startGitHubSignIn: async () => null,
      }),
    },
  );

  assert.deepEqual(result, {
    destination: "https://app.example.com/login?error=oauth_start",
    effects,
  });
});

test("completes GitHub sign-in and preserves auth effects", async () => {
  const result = await completeGitHubSignIn(
    {
      code: "code",
      cookies: [],
      next: "/career",
      origin: "https://app.example.com",
    },
    {
      createAuthRepository: () => ({
        completeGitHubSignIn: async () => true,
        getEffects: () => effects,
      }),
    },
  );

  assert.deepEqual(result, {
    destination: "https://app.example.com/career",
    effects,
  });
});

test("returns to login when the callback exchange fails", async () => {
  const result = await completeGitHubSignIn(
    {
      code: "bad-code",
      cookies: [],
      next: "/career",
      origin: "https://app.example.com",
    },
    {
      createAuthRepository: () => ({
        completeGitHubSignIn: async () => false,
        getEffects: () => effects,
      }),
    },
  );

  assert.deepEqual(result, {
    destination: "https://app.example.com/login?error=oauth_callback",
    effects,
  });
});

test("signs out and redirects to login", async () => {
  let signedOut = false;
  const result = await signOut(
    { cookies: [], origin: "https://app.example.com" },
    {
      createAuthRepository: () => ({
        getEffects: () => effects,
        signOut: async () => {
          signedOut = true;
        },
      }),
    },
  );

  assert.equal(signedOut, true);
  assert.deepEqual(result, {
    destination: "https://app.example.com/login",
    effects,
  });
});
