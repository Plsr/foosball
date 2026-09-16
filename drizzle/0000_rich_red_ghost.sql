CREATE TABLE "teams" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "teams_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"slug" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"stadium" text NOT NULL,
	"founded" integer NOT NULL,
	CONSTRAINT "teams_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "teams" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
INSERT INTO "teams" ("slug", "name", "city", "stadium", "founded") VALUES
	('bayern-munich', 'FC Bayern Munich', 'Munich', 'Allianz Arena', 1900),
	('borussia-dortmund', 'Borussia Dortmund', 'Dortmund', 'Signal Iduna Park', 1909),
	('bayer-leverkusen', 'Bayer 04 Leverkusen', 'Leverkusen', 'BayArena', 1904),
	('rb-leipzig', 'RB Leipzig', 'Leipzig', 'Red Bull Arena', 2009);
