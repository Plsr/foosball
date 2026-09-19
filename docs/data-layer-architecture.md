# Data-layer architecture proposal

**Status:** Proposed

## Decision

Application data access and preparation will live under `src/data`. The dependency
flow is one-way:

```text
one framework consumer
          |
          v
one dedicated data/services/*.service.ts
         |          |         |
         v          |         v
    contexts -------+    domain logic
                    |
                    v
              repositories
                    |
                    v
        database, Supabase, and other sources
```

A service file is the public interface of a data module. It owns a consumer use
case: it coordinates repositories and domain logic, handles data-related decisions,
and returns a purpose-built result. Repository files are internal adapters for a
specific data source. Context modules expose simple functions for shared,
request-scoped concerns such as resolving the currently logged-in user.
Repositories are non-instantiable classes with throwing constructors and static
operations. Consumers call those operations directly (for example,
`TeamRepository.listTeams()`); repositories do not expose setup or factory functions.
When an operation needs request-scoped state, that state is passed into the static
operation and returned effects accompany its result.

### Rules

1. Only the service layer may import repository files. This includes service files
   and their internal context modules; contexts are not exposed to consumers.
2. Only repository files may import data-source infrastructure such as database
   clients, schemas, and Supabase client helpers. Repositories do not import one
   another; the service layer composes them. Low-level infrastructure may use its
   source SDK, but is not an application-facing interface.
3. Services never import other services. If services need the same behavior or
   request-scoped data, that concern belongs in focused context functions instead.
   For example, a request context function can resolve the currently logged-in user
   and return any resulting cookie or header effects explicitly.
4. Consumers and services have a one-to-one mapping. Every data-using page, route
   handler, server action, or proxy imports exactly one dedicated service module.
   That service module is imported by exactly one production consumer. A consumer
   with no data use, such as a static health route, imports no service.
5. A service is named and shaped for its sole consumer. It is never reused by a
   second consumer, even when the use cases initially look similar. Shared behavior
   belongs in contexts, repositories, or pure domain modules.
6. Presentational components do not fetch data. They receive service results, or
   smaller values derived from those results, through props. They may submit a form
   to a thin server action, but that action delegates its use case to one service.
7. Services return explicit, consumer-specific types. They do not expose database
   rows, ORM types, Supabase objects, or repository return types.
8. A service returns only fields its consumer needs. It renames, combines, sorts,
   and otherwise prepares values so the consumer can render them without knowledge
   of the underlying sources.
9. Framework-only work remains at the framework edge: parsing requests, producing
   responses, redirects, cookies, and rendering JSX. Domain rules remain in pure
   domain modules and may be called by services.

“One service” means one dedicated service **module** for one framework consumer.
For example, `home-page.service.ts` serves only `app/page.tsx`; the related
`runSimulation` server action uses a different service module.

This one-to-one mapping makes the impact of an interface change predictable: only
the mapped consumer can require downstream adaptation. A service should normally
expose one primary use-case operation plus its consumer-specific result types.

## Proposed layout

```text
src/
  app/
    page.tsx
    team-list.tsx
    actions.ts
  data/
    contexts/
      request.context.ts
    repositories/
      team.repository.ts
      user.repository.ts
    services/
      home-page.service.ts
      run-home-simulation.service.ts
      simulate-match-api.service.ts
  domain/
    match.ts
  db/
    client.ts
    schema.ts
```

The exact filenames may evolve with the use cases. We should not add generic base
repositories, repository interfaces, or dependency-injection machinery until a
real second adapter or test substitute makes that seam useful. Context functions
should remain small and focused; they are not a place to build a global service
locator or request-scoped object graph.

Example service interface:

```ts
export type HomePageData = {
  viewerName: string;
  teams: Array<{
    slug: string;
    name: string;
    location: string;
    foundedLabel: string;
  }>;
};

export async function getHomePageData(): Promise<HomePageData>;
```

`HomePageData` is deliberately a view model, not a database model. If the page does
not render a field, that field should not cross the service interface.

## Enforcement

We should add linting in two layers:

- Use ESLint file-pattern overrides (with `no-restricted-imports`, or an equivalent
  boundaries plugin) to enforce the dependency direction:
  - repository imports are forbidden outside `src/data/services` and
    `src/data/contexts`;
  - service-to-service imports are forbidden;
  - `src/db`, Supabase server clients, and other source adapters are forbidden
    outside `src/data/repositories`;
  - services and repositories cannot be imported by client components;
  - repositories cannot import other repositories.
- The one-to-one consumer/service mapping is currently maintained as an explicit
  convention and reviewed with each change. [Issue #9](https://github.com/Plsr/foosball/issues/9)
  will evaluate a custom ESLint rule or boundaries plugin for enforcing that mapping
  automatically.

Linting can enforce who may depend on whom. It cannot determine whether a service
returns the minimum meaningful data. We will support that rule with explicit
service return types, service-interface tests, and code review. Service-interface
test coverage is tracked in [Issue #10](https://github.com/Plsr/foosball/issues/10).
Enabling `@typescript-eslint/explicit-module-boundary-types` for service files would
make accidental type leakage easier to spot.
