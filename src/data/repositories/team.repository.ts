import { asc, eq } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { leagues, teams } from "@/db/schema";

export type TeamRecord = {
  slug: string;
  name: string;
  city: string;
  stadium: string;
  founded: number;
  rating: number;
  league: string;
};

export class TeamRepository {
  private constructor() {
    throw new Error("TeamRepository cannot be instantiated");
  }

  static async listTeams(): Promise<TeamRecord[]> {
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
}
