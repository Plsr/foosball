import type { RequestCookie } from "@/data/auth";
import {
  createRequestContext,
  type RequestContext,
} from "@/data/contexts/request.context";
import {
  TeamRepository,
  type TeamRecord,
} from "@/data/repositories/team.repository";

export type HomePageData = {
  viewerName: string;
  teams: Array<{
    slug: string;
    name: string;
    location: string;
    foundedLabel: string;
  }>;
};

export type HomePageResult =
  | { status: "ready"; data: HomePageData }
  | { status: "unauthenticated" };

type HomePageDependencies = {
  createRequestContext(input: {
    cookies: readonly RequestCookie[];
  }): Pick<RequestContext, "getCurrentViewer">;
  listTeams(): Promise<TeamRecord[]>;
};

const productionDependencies: HomePageDependencies = {
  createRequestContext,
  listTeams: TeamRepository.listTeams,
};

export async function getHomePageData(
  input: { cookies: readonly RequestCookie[] },
  dependencies: HomePageDependencies = productionDependencies,
): Promise<HomePageResult> {
  const context = dependencies.createRequestContext(input);
  const viewer = await context.getCurrentViewer();

  if (!viewer) return { status: "unauthenticated" };

  const teams = await dependencies.listTeams();
  return {
    status: "ready",
    data: {
      viewerName: viewer.userName ?? viewer.email ?? "Manager",
      teams: teams
        .toSorted((left, right) => left.name.localeCompare(right.name))
        .map((team) => ({
          slug: team.slug,
          name: team.name,
          location: `${team.city} · ${team.stadium}`,
          foundedLabel: `Est. ${team.founded}`,
        })),
    },
  };
}
