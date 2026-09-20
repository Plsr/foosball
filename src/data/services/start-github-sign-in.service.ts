import type { AuthEffects, RequestCookie } from "@/data/auth";
import {
  AuthRepository,
  type AuthRepositoryRequest,
  type AuthRepositoryResult,
} from "@/data/repositories/auth.repository";
import { getSafeNextPath } from "@/lib/auth/redirect";

export type StartGitHubSignInResult = {
  destination: string;
  effects: AuthEffects;
};

type StartGitHubSignInDependencies = {
  startGitHubSignIn(
    input: AuthRepositoryRequest & { redirectTo: string },
  ): Promise<AuthRepositoryResult<string | null>>;
};

const productionDependencies: StartGitHubSignInDependencies = {
  startGitHubSignIn: AuthRepository.startGitHubSignIn,
};

export async function startGitHubSignIn(
  input: {
    cookies: readonly RequestCookie[];
    origin: string;
    next: string | null;
  },
  dependencies: StartGitHubSignInDependencies = productionDependencies,
): Promise<StartGitHubSignInResult> {
  const callbackUrl = new URL("/auth/callback", input.origin);

  if (input.next) {
    callbackUrl.searchParams.set("next", getSafeNextPath(input.next));
  }

  const result = await dependencies.startGitHubSignIn({
    cookies: input.cookies,
    redirectTo: callbackUrl.toString(),
  });
  return {
    destination:
      result.value ?? new URL("/login?error=oauth_start", input.origin).toString(),
    effects: result.effects,
  };
}
