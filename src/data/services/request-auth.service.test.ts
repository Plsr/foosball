import assert from "node:assert/strict";
import { test } from "node:test";
import { authorizeRequest } from "./request-auth.service.js";

const noEffects = { cookies: [], headers: [] };

test("redirects protected pages when authentication is not configured", async () => {
  const result = await authorizeRequest(
    {
      cookies: [],
      origin: "https://app.example.com",
      pathname: "/career",
      search: "?season=2",
    },
    {
      createRequestContext: () => ({
        getAuthEffects: () => noEffects,
        getCurrentViewer: async () => null,
        isAuthConfigured: () => false,
      }),
    },
  );

  assert.deepEqual(result, {
    status: "redirect",
    destination: "https://app.example.com/login?error=configuration",
    responseStatus: 303,
    effects: noEffects,
  });
});

test("rejects anonymous protected API requests", async () => {
  const result = await authorizeRequest(
    {
      cookies: [],
      origin: "https://app.example.com",
      pathname: "/api/matches/simulate",
      search: "",
    },
    {
      createRequestContext: () => ({
        getAuthEffects: () => noEffects,
        getCurrentViewer: async () => null,
        isAuthConfigured: () => true,
      }),
    },
  );

  assert.deepEqual(result, {
    status: "reject",
    responseStatus: 401,
    error: "Authentication required",
    effects: noEffects,
  });
});

test("redirects anonymous page requests and preserves the requested path", async () => {
  const result = await authorizeRequest(
    {
      cookies: [],
      origin: "https://app.example.com",
      pathname: "/career",
      search: "?season=2",
    },
    {
      createRequestContext: () => ({
        getAuthEffects: () => noEffects,
        getCurrentViewer: async () => null,
        isAuthConfigured: () => true,
      }),
    },
  );

  assert.deepEqual(result, {
    status: "redirect",
    destination: "https://app.example.com/login?next=%2Fcareer%3Fseason%3D2",
    responseStatus: 303,
    effects: noEffects,
  });
});

test("returns service unavailable for APIs when auth is not configured", async () => {
  const result = await authorizeRequest(
    {
      cookies: [],
      origin: "https://app.example.com",
      pathname: "/api/matches/simulate",
      search: "",
    },
    {
      createRequestContext: () => ({
        getAuthEffects: () => noEffects,
        getCurrentViewer: async () => null,
        isAuthConfigured: () => false,
      }),
    },
  );

  assert.deepEqual(result, {
    status: "reject",
    responseStatus: 503,
    error: "Authentication is not configured",
    effects: noEffects,
  });
});

test("redirects an authenticated viewer away from login", async () => {
  const result = await authorizeRequest(
    {
      cookies: [],
      origin: "https://app.example.com",
      pathname: "/login",
      search: "",
    },
    {
      createRequestContext: () => ({
        getAuthEffects: () => noEffects,
        getCurrentViewer: async () => ({ id: "viewer-1", email: null, userName: null }),
        isAuthConfigured: () => true,
      }),
    },
  );

  assert.deepEqual(result, {
    status: "redirect",
    destination: "https://app.example.com/",
    effects: noEffects,
  });
});

test("allows public requests without a viewer", async () => {
  const result = await authorizeRequest(
    {
      cookies: [],
      origin: "https://app.example.com",
      pathname: "/auth/callback",
      search: "",
    },
    {
      createRequestContext: () => ({
        getAuthEffects: () => noEffects,
        getCurrentViewer: async () => null,
        isAuthConfigured: () => true,
      }),
    },
  );

  assert.deepEqual(result, { status: "allow", effects: noEffects });
});
