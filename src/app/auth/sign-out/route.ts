import { NextResponse, type NextRequest } from "next/server";
import { applyAuthEffects } from "@/app/auth-response";
import { signOut } from "@/data/services/sign-out.service";

export async function POST(request: NextRequest) {
  const result = await signOut({
    cookies: request.cookies.getAll(),
    origin: request.nextUrl.origin,
  });

  return applyAuthEffects(
    NextResponse.redirect(result.destination, 303),
    result.effects,
  );
}
