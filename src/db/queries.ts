import { asc } from "drizzle-orm";
import { getDatabase } from "./client";
import { teams } from "./schema";

export async function getTeams() {
  return getDatabase().select().from(teams).orderBy(asc(teams.name));
}
