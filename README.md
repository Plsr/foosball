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
- PostgreSQL for persistence once the core simulation is proven.
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

Run the simulation checks with `pnpm test`.
