import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createRequestClient } from "@/lib/supabase/request";

const publicPaths = ["/login", "/auth/", "/api/health"];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((path) =>
    path.endsWith("/") ? pathname.startsWith(path) : pathname === path,
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = isPublicPath(pathname);

  if (!isSupabaseConfigured()) {
    if (pathname === "/login" || pathname === "/api/health") {
      return NextResponse.next();
    }

    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Authentication is not configured" },
        { status: 503 },
      );
    }

    return NextResponse.redirect(
      new URL("/login?error=configuration", request.url),
      303,
    );
  }

  const auth = createRequestClient(request);
  const {
    data: { user },
  } = await auth.supabase.auth.getUser();

  if (!user && !isPublic) {
    if (pathname.startsWith("/api/")) {
      return auth.applyTo(
        NextResponse.json({ error: "Authentication required" }, { status: 401 }),
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
    return auth.applyTo(NextResponse.redirect(loginUrl, 303));
  }

  if (user && pathname === "/login") {
    return auth.applyTo(NextResponse.redirect(new URL("/", request.url)));
  }

  return auth.applyTo(NextResponse.next({ request }));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
