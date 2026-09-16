import assert from "node:assert/strict";
import test from "node:test";
import { getSafeNextPath } from "./redirect";

test("accepts an application-relative path", () => {
  assert.equal(getSafeNextPath("/career?season=2"), "/career?season=2");
});

test("rejects absolute and protocol-relative redirects", () => {
  assert.equal(getSafeNextPath("https://example.com"), "/");
  assert.equal(getSafeNextPath("//example.com"), "/");
  assert.equal(getSafeNextPath("/\\example.com"), "/");
});

test("falls back to the home page when no path is provided", () => {
  assert.equal(getSafeNextPath(null), "/");
});
