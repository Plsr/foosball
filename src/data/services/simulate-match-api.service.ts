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
    body: unknown;
    cookies: readonly RequestCookie[];
  },
  dependencies: SimulateMatchApiDependencies = productionDependencies,
): Promise<SimulateMatchApiResult> {
  const context = dependencies.createRequestContext(input);
  const viewer = await context.getCurrentViewer();
  if (!viewer) return { status: "unauthenticated" };

  if (!isMatchRequest(input.body)) return { status: "invalid-input" };

  return {
    status: "success",
    match: simulateMatch(input.body.homeTeam, input.body.awayTeam, input.body.seed),
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
