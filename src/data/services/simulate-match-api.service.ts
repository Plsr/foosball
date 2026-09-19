import type { RequestCookie } from "@/data/auth";
import {
  createRequestContext,
  type RequestContext,
} from "@/data/contexts/request.context";
import {
  simulateMatch,
  type MatchResult,
  type Team,
} from "@/domain/match";

export type SimulateMatchApiResult =
  | { status: "success"; match: MatchResult }
  | { status: "invalid-input" }
  | { status: "unauthenticated" };

type SimulateMatchApiDependencies = {
  createRequestContext(input: {
    cookies: readonly RequestCookie[];
  }): Pick<RequestContext, "getCurrentViewer">;
};

const productionDependencies: SimulateMatchApiDependencies = {
  createRequestContext,
};

export async function simulateMatchApi(
  input: {
    cookies: readonly RequestCookie[];
    readBody(): Promise<unknown>;
  },
  dependencies: SimulateMatchApiDependencies = productionDependencies,
): Promise<SimulateMatchApiResult> {
  const context = dependencies.createRequestContext(input);
  const viewer = await context.getCurrentViewer();
  if (!viewer) return { status: "unauthenticated" };

  let body: unknown;
  try {
    body = await input.readBody();
  } catch {
    return { status: "invalid-input" };
  }

  if (!isMatchRequest(body)) return { status: "invalid-input" };

  return {
    status: "success",
    match: simulateMatch(body.homeTeam, body.awayTeam, body.seed),
  };
}

function isMatchRequest(
  value: unknown,
): value is { homeTeam: Team; awayTeam: Team; seed: number } {
  if (!value || typeof value !== "object") return false;

  const request = value as Record<string, unknown>;
  return isTeam(request.homeTeam) && isTeam(request.awayTeam) && Number.isFinite(request.seed);
}

function isTeam(value: unknown): value is Team {
  if (!value || typeof value !== "object") return false;

  const team = value as Record<string, unknown>;
  return (
    typeof team.id === "string" &&
    typeof team.name === "string" &&
    typeof team.strength === "number"
  );
}
