import { bigint, integer, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const teams = pgTable("teams", {
  id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar({ length: 64 }).notNull().unique(),
  name: text().notNull(),
  city: text().notNull(),
  stadium: text().notNull(),
  founded: integer().notNull(),
}).enableRLS();

export type Team = typeof teams.$inferSelect;
