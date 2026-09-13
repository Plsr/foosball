"use server";

import { simulateMatch, type MatchResult } from "@/simulation/match";

export type SimulationState = MatchResult | null;

export async function runSimulation(
  _previousState: SimulationState,
  _formData: FormData,
): Promise<SimulationState> {
  return simulateMatch();
}
