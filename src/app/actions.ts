"use server";

import { simulateMatch, type MatchResult } from "@/simulation/match";
import { requireUser } from "@/lib/auth/user";

export type SimulationState = MatchResult | null;

export async function runSimulation(
  _previousState: SimulationState,
  _formData: FormData,
): Promise<SimulationState> {
  await requireUser();
  return simulateMatch();
}
