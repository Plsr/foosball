import { NextResponse, type NextRequest } from "next/server";
import { applyAuthEffects } from "@/app/auth-response";
import { startGitHubSignIn } from "@/data/services/start-github-sign-in.service";

export async function POST(request: NextRequest) {
  const result = await startGitHubSignIn({
    cookies: request.cookies.getAll(),
    origin: request.nextUrl.origin,
    next: request.nextUrl.searchParams.get("next"),
  });

  return applyAuthEffects(NextResponse.redirect(result.destination, 303), result.effects);
}
