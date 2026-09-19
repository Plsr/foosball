import assert from "node:assert/strict";
import { test } from "node:test";
import { getLoginPageData } from "./login-page.service.js";

test("returns the exact login page view model", () => {
  const result = getLoginPageData(
    { error: "oauth_start", next: "/career?season=2" },
    {
      createRequestContext: () => ({ isAuthConfigured: () => true }),
    },
  );

  assert.deepEqual(result, {
    configured: true,
    errorMessage: "GitHub sign-in could not be started. Please try again.",
    signInAction: "/auth/sign-in?next=%2Fcareer%3Fseason%3D2",
  });
});

test("sanitizes the post-login destination", () => {
  const result = getLoginPageData(
    { next: "https://example.com" },
    {
      createRequestContext: () => ({ isAuthConfigured: () => false }),
    },
  );

  assert.deepEqual(result, {
    configured: false,
    errorMessage: undefined,
    signInAction: "/auth/sign-in",
  });
});
