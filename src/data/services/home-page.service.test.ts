import assert from "node:assert/strict";
import { test } from "node:test";
import { getHomePageData } from "./home-page.service.js";

test("returns a consumer-shaped home page model", async () => {
  const result = await getHomePageData(
    { cookies: [] },
    {
      createRequestContext: () => ({
        getCurrentViewer: async () => ({
          id: "viewer-1",
          email: "manager@example.com",
          userName: "Coach",
        }),
      }),
      listTeams: async () => [
        {
          slug: "fc-example",
          name: "FC Example",
          city: "Copenhagen",
          stadium: "Example Park",
          founded: 1901,
        },
      ],
    },
  );

  assert.deepEqual(result, {
    status: "ready",
    data: {
      viewerName: "Coach",
      teams: [
        {
          slug: "fc-example",
          name: "FC Example",
          location: "Copenhagen · Example Park",
          foundedLabel: "Est. 1901",
        },
      ],
    },
  });
});

test("does not query teams for an unauthenticated request", async () => {
  let queriedTeams = false;
  const result = await getHomePageData(
    { cookies: [] },
    {
      createRequestContext: () => ({ getCurrentViewer: async () => null }),
      listTeams: async () => {
        queriedTeams = true;
        return [];
      },
    },
  );

  assert.deepEqual(result, { status: "unauthenticated" });
  assert.equal(queriedTeams, false);
});
