import { NextResponse, type NextRequest } from "next/server";
import { getSafeNextPath } from "@/lib/auth/redirect";
import { createRequestClient } from "@/lib/supabase/request";

export async function GET(request: NextRequest) {
  const auth = createRequestClient(request);
  const code = request.nextUrl.searchParams.get("code");
  const next = getSafeNextPath(request.nextUrl.searchParams.get("next"));

  if (code) {
    const { error } = await auth.supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return auth.applyTo(
        NextResponse.redirect(new URL(next, request.nextUrl.origin), 303),
      );
    }
  }

  return auth.applyTo(
    NextResponse.redirect(new URL("/login?error=oauth_callback", request.url), 303),
  );
}
