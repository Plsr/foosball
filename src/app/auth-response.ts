import type { NextResponse } from "next/server";

type ResponseEffects = {
  cookies: Array<{
    name: string;
    value: string;
    options: {
      domain?: string;
      expires?: Date;
      httpOnly?: boolean;
      maxAge?: number;
      partitioned?: boolean;
      path?: string;
      priority?: "low" | "medium" | "high";
      sameSite?: boolean | "lax" | "strict" | "none";
      secure?: boolean;
    };
  }>;
  headers: Array<{ name: string; value: string }>;
};

export function applyAuthEffects<T extends NextResponse>(
  response: T,
  effects: ResponseEffects,
): T {
  for (const { name, value, options } of effects.cookies) {
    response.cookies.set(name, value, options);
  }

  for (const { name, value } of effects.headers) {
    response.headers.set(name, value);
  }

  return response;
}
