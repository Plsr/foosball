import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest, NextResponse } from "next/server";
import {
  applyAuthCookiesToRequest,
  applyAuthEffects,
} from "./auth-response.js";

test("applies auth cookies and cache headers to a Next.js response", () => {
  const response = applyAuthEffects(NextResponse.next(), {
    cookies: [
      {
        name: "session",
        value: "token",
        options: { httpOnly: true, sameSite: "lax", secure: true },
      },
    ],
    headers: [{ name: "cache-control", value: "private, no-store" }],
  });

  assert.equal(response.cookies.get("session")?.value, "token");
  assert.equal(response.headers.get("cache-control"), "private, no-store");
});

test("forwards refreshed auth cookies to the downstream request", () => {
  const request = new NextRequest("https://app.example.com/career", {
    headers: { cookie: "session=old-token" },
  });

  applyAuthCookiesToRequest(request, {
    cookies: [{ name: "session", value: "new-token", options: {} }],
    headers: [],
  });

  assert.equal(request.cookies.get("session")?.value, "new-token");
});
