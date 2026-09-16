import { NextResponse, type NextRequest } from "next/server";
import { createRequestClient } from "@/lib/supabase/request";

export async function POST(request: NextRequest) {
  const auth = createRequestClient(request);
  await auth.supabase.auth.signOut({ scope: "local" });

  return auth.applyTo(
    NextResponse.redirect(new URL("/login", request.nextUrl.origin), 303),
  );
}
