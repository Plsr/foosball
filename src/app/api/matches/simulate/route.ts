import { simulateMatch } from "../../../../simulation/match";

export async function POST() {
  return Response.json(simulateMatch());
}
