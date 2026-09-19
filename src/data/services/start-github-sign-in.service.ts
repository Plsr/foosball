import type { AuthEffects, RequestCookie } from "@/data/auth";
import {
  createRequestContext,
  type RequestContext,
} from "@/data/contexts/request.context";
import { getSafeNextPath } from "@/lib/auth/redirect";

export type StartGitHubSignInResult = {
  destination: string;
  effects: AuthEffects;
};

type StartGitHubSignInDependencies = {
  createRequestContext(input: {
    cookies: readonly RequestCookie[];
  }): Pick<RequestContext, "getAuthEffects" | "startGitHubSignIn">;
};

const productionDependencies: StartGitHubSignInDependencies = {
  createRequestContext,
};

export async function startGitHubSignIn(
  input: {
    cookies: readonly RequestCookie[];
    origin: string;
    next: string | null;
  },
  dependencies: StartGitHubSignInDependencies = productionDependencies,
): Promise<StartGitHubSignInResult> {
  const context = dependencies.createRequestContext(input);
  const callbackUrl = new URL("/auth/callback", input.origin);

  if (input.next) {
    callbackUrl.searchParams.set("next", getSafeNextPath(input.next));
  }

  const oauthUrl = await context.startGitHubSignIn(callbackUrl.toString());
  return {
    destination:
      oauthUrl ?? new URL("/login?error=oauth_start", input.origin).toString(),
    effects: context.getAuthEffects(),
  };
}
