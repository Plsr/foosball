import { NextResponse, type NextRequest } from "next/server";
import {
  applyAuthCookiesToRequest,
  applyAuthEffects,
} from "@/app/auth-response";
import { authorizeRequest } from "@/data/services/request-auth.service";

export async function proxy(request: NextRequest) {
  const result = await authorizeRequest({
    cookies: request.cookies.getAll(),
    origin: request.nextUrl.origin,
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
  });

  if (result.status === "reject") {
    return applyAuthEffects(
      NextResponse.json({ error: result.error }, { status: result.responseStatus }),
      result.effects,
    );
  }

  if (result.status === "redirect") {
    const response = result.responseStatus
      ? NextResponse.redirect(result.destination, result.responseStatus)
      : NextResponse.redirect(result.destination);
    return applyAuthEffects(response, result.effects);
  }

  applyAuthCookiesToRequest(request, result.effects);
  return applyAuthEffects(NextResponse.next({ request }), result.effects);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
