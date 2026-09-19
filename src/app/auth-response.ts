import type { NextRequest, NextResponse } from "next/server";
import type { AuthEffects } from "@/data/auth";

export function applyAuthEffects<T extends NextResponse>(
  response: T,
  effects: AuthEffects,
): T {
  for (const { name, value, options } of effects.cookies) {
    response.cookies.set(name, value, options);
  }

  for (const { name, value } of effects.headers) {
    response.headers.set(name, value);
  }

  return response;
}

export function applyAuthCookiesToRequest(
  request: NextRequest,
  effects: AuthEffects,
): void {
  for (const { name, value } of effects.cookies) {
    request.cookies.set(name, value);
  }
}
