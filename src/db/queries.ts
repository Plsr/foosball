import { asc, eq } from "drizzle-orm";
import { getDatabase } from "./client";
import { leagues, teams } from "./schema";

export async function getTeams() {
  return getDatabase()
    .select({
      slug: teams.slug,
      name: teams.name,
      city: teams.city,
      stadium: teams.stadium,
      founded: teams.founded,
      rating: teams.rating,
      league: leagues.name,
    })
    .from(teams)
    .innerJoin(leagues, eq(teams.leagueId, leagues.id))
    .orderBy(asc(teams.name));
}
