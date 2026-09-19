CREATE TABLE "leagues" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "leagues_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"slug" varchar(64) NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "leagues_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "leagues" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
GRANT SELECT ON TABLE public.leagues TO foosball_reader;
--> statement-breakpoint
CREATE POLICY "foosball_reader_can_read_leagues"
  ON public.leagues
  FOR SELECT
  TO foosball_reader
  USING (true);
--> statement-breakpoint
INSERT INTO "leagues" ("slug", "name") VALUES
	('bundesliga', 'Bundesliga');
--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "league_id" bigint;--> statement-breakpoint
UPDATE "teams" SET "league_id" = (SELECT "id" FROM "leagues" WHERE "slug" = 'bundesliga');--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "league_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "rating" integer DEFAULT 50 NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "manager_id" uuid;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_league_id_leagues_id_fk" FOREIGN KEY ("league_id") REFERENCES "public"."leagues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_manager_id_unique" UNIQUE("manager_id");
--> statement-breakpoint
UPDATE "teams" SET "rating" = 88 WHERE "slug" = 'bayern-munich';
--> statement-breakpoint
UPDATE "teams" SET "rating" = 78 WHERE "slug" = 'borussia-dortmund';
--> statement-breakpoint
UPDATE "teams" SET "rating" = 80 WHERE "slug" = 'bayer-leverkusen';
--> statement-breakpoint
UPDATE "teams" SET "rating" = 76 WHERE "slug" = 'rb-leipzig';
