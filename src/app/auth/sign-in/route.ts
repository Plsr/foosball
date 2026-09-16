import { NextResponse, type NextRequest } from "next/server";
import { createRequestClient } from "@/lib/supabase/request";

export async function POST(request: NextRequest) {
  const auth = createRequestClient(request);
  const callbackUrl = new URL("/auth/callback", request.nextUrl.origin);
  const next = request.nextUrl.searchParams.get("next");

  if (next) {
    callbackUrl.searchParams.set("next", next);
  }

  const { data, error } = await auth.supabase.auth.signInWithOAuth({
    provider: "github",
    options: { redirectTo: callbackUrl.toString() },
  });

  const destination =
    error || !data.url ? new URL("/login?error=oauth_start", request.url) : data.url;

  return auth.applyTo(NextResponse.redirect(destination, 303));
}
