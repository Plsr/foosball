import { simulateMatch, type Team } from "../../../../domain/match";

type MatchRequest = { homeTeam: Team; awayTeam: Team; seed: number };

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid match input" }, { status: 400 });
  }

  if (!isMatchRequest(body)) {
    return Response.json({ error: "Invalid match input" }, { status: 400 });
  }

  return Response.json(simulateMatch(body.homeTeam, body.awayTeam, body.seed));
}

function isMatchRequest(value: unknown): value is MatchRequest {
  if (!value || typeof value !== "object") return false;

  const request = value as Record<string, unknown>;
  return isTeam(request.homeTeam) && isTeam(request.awayTeam) && Number.isFinite(request.seed);
}

function isTeam(value: unknown): value is Team {
  if (!value || typeof value !== "object") return false;

  const team = value as Record<string, unknown>;
  return typeof team.id === "string" && typeof team.name === "string" && typeof team.strength === "number";
}
