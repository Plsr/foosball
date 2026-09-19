import type { NextRequest } from "next/server";
import { simulateMatchApi } from "@/data/services/simulate-match-api.service";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid match input" }, { status: 400 });
  }

  const result = await simulateMatchApi({
    body,
    cookies: request.cookies.getAll(),
  });

  if (result.status === "unauthenticated") {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  if (result.status === "invalid-input") {
    return Response.json({ error: "Invalid match input" }, { status: 400 });
  }

  return Response.json(result.match);
}
