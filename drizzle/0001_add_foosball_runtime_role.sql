CREATE ROLE foosball_reader
  NOLOGIN
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  NOBYPASSRLS;
--> statement-breakpoint
CREATE ROLE foosball_app
  LOGIN
  INHERIT
  NOSUPERUSER
  NOCREATEDB
  NOCREATEROLE
  NOREPLICATION
  NOBYPASSRLS;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO foosball_reader;
--> statement-breakpoint
GRANT SELECT ON TABLE public.teams TO foosball_reader;
--> statement-breakpoint
CREATE POLICY "foosball_reader_can_read_teams"
  ON public.teams
  FOR SELECT
  TO foosball_reader
  USING (true);
--> statement-breakpoint
GRANT foosball_reader TO foosball_app;
