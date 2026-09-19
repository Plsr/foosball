import type { RequestCookie } from "@/data/auth";
import {
  getCurrentViewer,
  type CurrentViewerResult,
} from "@/data/contexts/request.context";
import {
  simulateMatch,
  type MatchResult,
} from "@/simulation/match";

export type HomeSimulationResult =
  | { status: "ready"; simulation: MatchResult }
  | { status: "unauthenticated" };

type HomeSimulationDependencies = {
  getCurrentViewer(input: {
    cookies: readonly RequestCookie[];
  }): Promise<CurrentViewerResult>;
  simulateMatch(): MatchResult;
};

const productionDependencies: HomeSimulationDependencies = {
  getCurrentViewer,
  simulateMatch,
};

export async function runHomeSimulation(
  input: { cookies: readonly RequestCookie[] },
  dependencies: HomeSimulationDependencies = productionDependencies,
): Promise<HomeSimulationResult> {
  const { viewer } = await dependencies.getCurrentViewer(input);
  if (!viewer) return { status: "unauthenticated" };

  return { status: "ready", simulation: dependencies.simulateMatch() };
}
