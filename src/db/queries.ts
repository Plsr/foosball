import { asc } from "drizzle-orm";
import { getDatabase } from "./client";
import { teams } from "./schema";

export async function getTeams() {
  return getDatabase()
    .select({
      slug: teams.slug,
      name: teams.name,
      city: teams.city,
      stadium: teams.stadium,
      founded: teams.founded,
    })
    .from(teams)
    .orderBy(asc(teams.name));
}
