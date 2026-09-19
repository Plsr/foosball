import type { NextRequest } from "next/server";
import { simulateMatchApi } from "@/data/services/simulate-match-api.service";

export async function POST(request: NextRequest) {
  const result = await simulateMatchApi({
    cookies: request.cookies.getAll(),
    readBody: () => request.json(),
  });

  if (result.status === "unauthenticated") {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  if (result.status === "invalid-input") {
    return Response.json({ error: "Invalid match input" }, { status: 400 });
  }

  return Response.json(result.match);
}
