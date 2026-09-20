# Soccer Simulator

A browser-first soccer simulation game focused on making decisions, simulating matches, and seeing the consequences over time.

## Direction

- Build a deterministic simulation engine before adding the web interface.
- Start with teams, players, tactics, match events, results, and league standings.
- Keep the first version high level; detailed rules and features will evolve through prototyping.

## Tech Stack

- pnpm for package management.
- TypeScript for the simulation engine and shared game logic.
- React for the web interface.
- Phaser for 2D match visualization when needed.
- Next.js for the UI and API route handlers.
- Supabase Postgres for persistence, accessed through Drizzle ORM.
- Web-first delivery, with an installable PWA and a possible native iOS client later.

## Current First Step

Create a small local simulation prototype with a deterministic interface such as:

```ts
simulateMatch(homeTeam, awayTeam, seed)
```

The prototype should help us discover whether the rules and gameplay loop are fun before we build the API or database around them.

## Run the prototype

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` and use **Simulate match** to generate a score. The
page invokes the framework-independent simulation module through a server action;
the same module can be imported by a future API route without moving game logic.

## Database

Copy `.env.example` to `.env.local`. Use a least-privileged `foosball_app`
connection through Supabase's transaction pooler for `DATABASE_URL`; reserve the
owner connection in `DATABASE_MIGRATION_URL` for migrations. Only
`DATABASE_URL` belongs in the Vercel runtime environment. The server-rendered
home page reads the seeded `teams` table through Drizzle, so database
credentials never reach the browser.

For a new Supabase project, fill in the owner connection first and apply the
committed migrations:

```bash
pnpm db:migrate
```

The migrations create a `foosball_app` login without a password and grant it
the least-privileged `foosball_reader` role. Connect with `psql` using the owner
connection from `DATABASE_MIGRATION_URL`, then set the runtime password once
with the interactive command:

```text
\password foosball_app
```

The command prompts for the password without putting it in SQL or shell history.
Use that password in `DATABASE_URL`, percent-encoding special characters only
in the connection URL. Never commit the real password or add
`DATABASE_MIGRATION_URL` to Vercel.

After changing `src/db/schema.ts`, generate a migration with:

```bash
pnpm db:generate
```

Apply new committed migrations once before deploying a version that depends on
them:

```bash
pnpm db:migrate
```

## GitHub sign-in

Authentication uses Supabase Auth with GitHub OAuth and cookie-based SSR
sessions. Add these public values to `.env.local` and to the Vercel project for
the Preview, Development, and Production environments:

```text
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
```

In GitHub, create an OAuth App and use the Supabase provider callback—not this
Next.js application's callback—as its **Authorization callback URL**:

```text
https://PROJECT_REF.supabase.co/auth/v1/callback
```

Copy the GitHub client ID and client secret into **Supabase Dashboard →
Authentication → Providers → GitHub**, then enable the provider. In **Supabase
Dashboard → Authentication → URL Configuration**, add every application
callback that Supabase may redirect back to:

```text
http://localhost:3000/auth/callback
https://YOUR_PRODUCTION_DOMAIN/auth/callback
https://YOUR_VERCEL_PREVIEW_DOMAIN/auth/callback
```

Add the generated PR preview callback after Vercel publishes the deployment,
or configure a suitably narrow Vercel preview wildcard in Supabase. Never put
the GitHub client secret or a Supabase secret/service-role key in a
`NEXT_PUBLIC_` variable.
