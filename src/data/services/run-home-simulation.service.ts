import type { RequestCookie } from "@/data/auth";
import {
  createRequestContext,
  type RequestContext,
} from "@/data/contexts/request.context";
import {
  simulateMatch,
  type MatchResult,
} from "@/simulation/match";

export type HomeSimulationResult =
  | { status: "ready"; simulation: MatchResult }
  | { status: "unauthenticated" };

type HomeSimulationDependencies = {
  createRequestContext(input: {
    cookies: readonly RequestCookie[];
  }): Pick<RequestContext, "getCurrentViewer">;
  simulateMatch(): MatchResult;
};

const productionDependencies: HomeSimulationDependencies = {
  createRequestContext,
  simulateMatch,
};

export async function runHomeSimulation(
  input: { cookies: readonly RequestCookie[] },
  dependencies: HomeSimulationDependencies = productionDependencies,
): Promise<HomeSimulationResult> {
  const context = dependencies.createRequestContext(input);
  const viewer = await context.getCurrentViewer();
  if (!viewer) return { status: "unauthenticated" };

  return { status: "ready", simulation: dependencies.simulateMatch() };
}
