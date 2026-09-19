"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  runHomeSimulation,
  type HomeSimulationResult,
} from "@/data/services/run-home-simulation.service";

export type SimulationState = Extract<
  HomeSimulationResult,
  { status: "ready" }
>["simulation"] | null;

export async function runSimulation(
  _previousState: SimulationState,
  _formData: FormData,
): Promise<SimulationState> {
  const cookieStore = await cookies();
  const result = await runHomeSimulation({ cookies: cookieStore.getAll() });

  if (result.status === "unauthenticated") {
    redirect("/login");
  }

  return result.simulation;
}
