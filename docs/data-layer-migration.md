# Data-layer migration path

**Status:** Implemented

## Approach

Migrate one complete request path at a time. Every step should preserve observable
behavior, pass tests and type checking, and be safe to deploy independently. Add
temporary, explicit lint allowlists for existing violations and remove each entry
as its request path moves behind a service interface.

Each production consumer receives its own service module. No migration step shares
a service between a page, route, action, or proxy, even temporarily.

The enforcement ratchet was implemented by applying strict rules to new data-layer
directories first, then enabling repository-wide restrictions in the final step.
No legacy exceptions remain.

The migration does not combine the two existing match simulators, change UI or HTTP
contracts, or introduce base repositories or a dependency-injection framework.

## Current dependency crossings

| Consumer | Current direct dependency | Target service module |
| --- | --- | --- |
| Home page (`TeamList` receives props) | Auth helper and database query | `home-page.service.ts` |
| `runSimulation` server action | Auth helper and simulation module | `run-home-simulation.service.ts` |
| Match API route | Auth helper and domain simulation | `simulate-match-api.service.ts` |
| Login page | Supabase configuration and redirect shaping | `login-page.service.ts` |
| Sign-in route | Supabase request client | `start-github-sign-in.service.ts` |
| Auth callback route | Supabase request client | `complete-github-sign-in.service.ts` |
| Sign-out route | Supabase request client | `sign-out.service.ts` |
| Request proxy | Supabase configuration and request client | `request-auth.service.ts` |

The health route has no data dependency and can remain service-free.

## Step 1: Add the enforcement harness

Introduce ESLint with architecture-only rules; do not add an unrelated style
preset. Add a small architecture check for constraints that import rules cannot
express.

- Add `lint` and `lint:architecture` scripts.
- Forbid service-to-service and repository-to-repository imports immediately.
- Restrict new repository imports to `data/services` and `data/contexts`.
- Check both sides of the mapping: each data-using production consumer imports one
  service, and each service has one production consumer. Service tests do not count.
- Record existing direct database, Supabase, and auth-helper imports in a temporary
  path-specific allowlist. Do not permit new entries.

This establishes a ratchet: the current application remains green, while new code
must follow the target dependency direction.

## Step 2: Establish repositories and the request context

Create the internal service-layer collaborators before moving consumers:

```text
src/data/
  contexts/request.context.ts
  repositories/team.repository.ts
  repositories/auth.repository.ts
```

- Move the Drizzle team query into `team.repository.ts` without changing its SQL.
- Put current-user and Supabase auth operations in `auth.repository.ts`.
- Define a small internal `Viewer` value instead of exposing Supabase's `User`.
- Give the request context a lazy `getCurrentViewer()` operation. Cache its promise
  so multiple internal collaborators in one use case trigger one auth lookup.
- Keep context construction inside the service layer. Pages and routes never import
  or assemble contexts.

The auth repository should accept framework-neutral cookie input and collect cookie
mutations as plain values. Next.js code remains responsible for reading request
cookies and applying returned mutations to a response.

## Step 3: Migrate the home-page slice

Add two dedicated service modules:

- `getHomePageData()` resolves the viewer, loads teams, and returns the exact home
  page view model from `home-page.service.ts`.
- `runHomeSimulation()` resolves the viewer and invokes the existing Poisson
  simulation from `run-home-simulation.service.ts`.

Then update the consumers:

- `app/page.tsx` calls `getHomePageData()` once and handles only framework concerns
  such as redirecting an unauthenticated request.
- `TeamList` becomes synchronous and receives already-shaped team props. Location
  and founding labels are prepared by the service.
- `app/actions.ts` delegates to `runHomeSimulation()` from its dedicated service and
  maps the result to the existing action state.
- Remove `src/db/queries.ts` once it has no callers.

Add service-interface tests for authentication outcomes, team shaping, ordering,
and simulation delegation. Remove the corresponding allowlist entries.

## Step 4: Migrate the protected match endpoint

Add `simulate-match-api.service.ts` for the match route alone. It validates input,
checks the viewer, calls the deterministic simulation, and returns a discriminated
result such as success, invalid input, or unauthenticated.

Keep the route handler limited to parsing JSON and translating the service result
into the existing `200`, `400`, and `401` responses. Once the route has migrated,
remove `src/lib/auth/user.ts` if it has no remaining callers.

Add service-interface tests for all result variants and retain the existing domain
tests. Remove the endpoint's allowlist entries.

## Step 5: Migrate login and authentication flows

Add four consumer-specific service modules without importing between them:

- `login-page.service.ts` returns `configured`, the safe sign-in target, and the
  user-facing error message required by the login page.
- `start-github-sign-in.service.ts` serves only the sign-in route.
- `complete-github-sign-in.service.ts` serves only the callback route.
- `sign-out.service.ts` serves only the sign-out route.

Shared session access belongs in the request context. The safe-redirect function can
remain a pure domain helper because it has no data dependency or request state.

Each auth result should contain only the destination, outcome, and framework-neutral
cookie mutations needed by its sole route. Route handlers create `NextResponse`
objects and apply those mutations; services do not import Next.js response types.

Add tests for safe redirect targets, OAuth failure outcomes, and cookie propagation.
Remove the login and auth-route allowlist entries.

## Step 6: Migrate request authorization

Add `request-auth.service.ts` for proxy authorization. It uses the shared request
context but imports no other service. Return a small decision value:

- allow the request;
- redirect to login or home; or
- reject an API request with the existing status and error message.

Include any cookie mutations in that result. The proxy remains responsible for
path extraction, constructing `NextResponse`, applying cookies, and its static
matcher configuration.

Test public paths, missing configuration, anonymous page/API requests, authenticated
login redirects, and pass-through behavior. Remove the final proxy allowlist entry.

## Step 7: Close the old paths and make enforcement strict

- Delete superseded auth and Supabase helpers; retain low-level source helpers only
  when a repository still imports them.
- Remove the temporary architecture allowlist.
- Enforce that database and Supabase infrastructure is imported only by
  repositories.
- Enforce that repositories are imported only by services and contexts.
- Enforce that client components import neither services nor repositories.
- Enforce the one-to-one mapping between production consumers and services in CI.

Finish by running `pnpm lint`, `pnpm test`, `pnpm typecheck`, and `pnpm build`, then
smoke-test sign-in, callback, sign-out, the home page, match simulation, the match
API, and anonymous redirects.

## Suggested commit sequence

1. `Add data-layer architecture checks`
2. `Add repositories and request context`
3. `Move home page behind its service`
4. `Move match API behind its service`
5. `Move login and auth routes behind services`
6. `Move proxy authorization behind its service`
7. `Enforce data-layer imports and remove legacy helpers`

Keep moves and consumer changes together when separating them would leave a direct
repository import or duplicate production behavior in an intermediate commit.
