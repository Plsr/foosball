DO $$
BEGIN
  CREATE ROLE foosball_reader NOLOGIN;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;
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
