import { bigint, integer, pgSchema, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

// Supabase manages this table; declared here only so `teams.managerId` can
// reference it. Never migrate or write to it from this schema.
const authUsers = pgSchema("auth").table("users", {
  id: uuid().primaryKey(),
});

export const leagues = pgTable("leagues", {
  id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar({ length: 64 }).notNull().unique(),
  name: text().notNull(),
}).enableRLS();

export const teams = pgTable("teams", {
  id: bigint({ mode: "bigint" }).primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar({ length: 64 }).notNull().unique(),
  name: text().notNull(),
  city: text().notNull(),
  stadium: text().notNull(),
  founded: integer().notNull(),
  leagueId: bigint("league_id", { mode: "bigint" })
    .notNull()
    .references(() => leagues.id),
  // Skews a team's chances in match simulation; the simulation itself does
  // not read this yet.
  rating: integer().notNull().default(50),
  // A manager is a Supabase-authenticated user who runs at most one team.
  managerId: uuid("manager_id").unique().references(() => authUsers.id),
}).enableRLS();

export type League = typeof leagues.$inferSelect;
export type Team = typeof teams.$inferSelect;
