import { asc } from "drizzle-orm";
import { getDatabase } from "@/db/client";
import { teams } from "@/db/schema";

export type TeamRecord = {
  slug: string;
  name: string;
  city: string;
  stadium: string;
  founded: number;
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
      })
      .from(teams)
      .orderBy(asc(teams.name));
  }
}
