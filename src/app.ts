import Fastify, { type FastifyInstance } from "fastify";
import { simulateMatch, type Team } from "./domain/match.js";

export function buildApp(): FastifyInstance {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({ status: "ok" }));

  app.post<{ Body: { homeTeam: Team; awayTeam: Team; seed: number } }>(
    "/matches/simulate",
    async (request, reply) => {
      if (!isMatchRequest(request.body)) {
        return reply.code(400).send({ error: "Invalid match input" });
      }

      const { homeTeam, awayTeam, seed } = request.body;

      return simulateMatch(homeTeam, awayTeam, seed);
    },
  );

  return app;
}

function isMatchRequest(
  value: unknown,
): value is { homeTeam: Team; awayTeam: Team; seed: number } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const request = value as Record<string, unknown>;
  return isTeam(request.homeTeam) && isTeam(request.awayTeam) && Number.isFinite(request.seed);
}

function isTeam(value: unknown): value is Team {
  if (!value || typeof value !== "object") {
    return false;
  }

  const team = value as Record<string, unknown>;
  return (
    typeof team.id === "string" &&
    typeof team.name === "string" &&
    typeof team.strength === "number"
  );
}
