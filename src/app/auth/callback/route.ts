import { NextResponse, type NextRequest } from "next/server";
import { applyAuthEffects } from "@/app/auth-response";
import { completeGitHubSignIn } from "@/data/services/complete-github-sign-in.service";

export async function GET(request: NextRequest) {
  const result = await completeGitHubSignIn({
    code: request.nextUrl.searchParams.get("code"),
    cookies: request.cookies.getAll(),
    next: request.nextUrl.searchParams.get("next"),
    origin: request.nextUrl.origin,
  });

  return applyAuthEffects(
    NextResponse.redirect(result.destination, 303),
    result.effects,
  );
}
