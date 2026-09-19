type TeamListProps = {
  teams: Array<{
    slug: string;
    name: string;
    location: string;
    foundedLabel: string;
  }>;
};

export function TeamList({ teams }: TeamListProps) {
  return (
    <section
      className="mx-auto mb-14 w-full max-w-[880px] border-t border-line pt-8"
      aria-labelledby="database-teams-title"
    >
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-lime uppercase">
            Live from Supabase
          </p>
          <h2 id="database-teams-title" className="mt-2 text-2xl font-bold tracking-[-0.03em]">
            Teams in the database
          </h2>
        </div>
        <span className="rounded-full border border-line px-3 py-1.5 font-mono text-[10px] tracking-[0.1em] text-muted uppercase">
          {teams.length} seeded rows
        </span>
      </div>

      <ul className="grid gap-3 min-[601px]:grid-cols-2">
        {teams.map((team) => (
          <li key={team.slug} className="rounded-sm border border-line bg-white/[0.025] p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold">{team.name}</h3>
                <p className="mt-1 text-sm text-muted">{team.location}</p>
              </div>
              <span className="font-mono text-[10px] tracking-[0.08em] text-note uppercase">
                {team.foundedLabel}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
