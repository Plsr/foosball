import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";
import { getSupabaseConfig } from "./config";

type PendingCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

export function createRequestClient(request: NextRequest) {
  const { url, publishableKey } = getSupabaseConfig();
  const pendingCookies: PendingCookie[] = [];
  const pendingHeaders = new Map<string, string>();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const cookie of cookiesToSet) {
          request.cookies.set(cookie.name, cookie.value);
          pendingCookies.push(cookie);
        }

        for (const [name, value] of Object.entries(headers)) {
          pendingHeaders.set(name, value);
        }
      },
    },
  });

  function applyTo(response: NextResponse): NextResponse {
    for (const { name, value, options } of pendingCookies) {
      response.cookies.set(name, value, options);
    }

    for (const [name, value] of pendingHeaders) {
      response.headers.set(name, value);
    }

    return response;
  }

  return { applyTo, supabase };
}
