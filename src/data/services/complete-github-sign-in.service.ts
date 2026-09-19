import type { AuthEffects, RequestCookie } from "@/data/auth";
import {
  createRequestContext,
  type RequestContext,
} from "@/data/contexts/request.context";
import { getSafeNextPath } from "@/lib/auth/redirect";

export type CompleteGitHubSignInResult = {
  destination: string;
  effects: AuthEffects;
};

type CompleteGitHubSignInDependencies = {
  createRequestContext(input: {
    cookies: readonly RequestCookie[];
  }): Pick<RequestContext, "completeGitHubSignIn" | "getAuthEffects">;
};

const productionDependencies: CompleteGitHubSignInDependencies = {
  createRequestContext,
};

export async function completeGitHubSignIn(
  input: {
    code: string | null;
    cookies: readonly RequestCookie[];
    next: string | null;
    origin: string;
  },
  dependencies: CompleteGitHubSignInDependencies = productionDependencies,
): Promise<CompleteGitHubSignInResult> {
  const context = dependencies.createRequestContext(input);
  const completed = input.code
    ? await context.completeGitHubSignIn(input.code)
    : false;
  const destination = completed
    ? new URL(getSafeNextPath(input.next), input.origin)
    : new URL("/login?error=oauth_callback", input.origin);

  return {
    destination: destination.toString(),
    effects: context.getAuthEffects(),
  };
}
