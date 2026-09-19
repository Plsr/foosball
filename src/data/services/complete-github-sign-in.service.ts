import type { AuthEffects, RequestCookie } from "@/data/auth";
import {
  AuthRepository,
  type AuthRepositoryRequest,
  type AuthRepositoryResult,
} from "@/data/repositories/auth.repository";
import { getSafeNextPath } from "@/lib/auth/redirect";

export type CompleteGitHubSignInResult = {
  destination: string;
  effects: AuthEffects;
};

type CompleteGitHubSignInDependencies = {
  completeGitHubSignIn(
    input: AuthRepositoryRequest & { code: string },
  ): Promise<AuthRepositoryResult<boolean>>;
};

const productionDependencies: CompleteGitHubSignInDependencies = {
  completeGitHubSignIn: AuthRepository.completeGitHubSignIn,
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
  const result = input.code
    ? await dependencies.completeGitHubSignIn({
        code: input.code,
        cookies: input.cookies,
      })
    : { value: false, effects: { cookies: [], headers: [] } };
  const completed = result.value;
  const destination = completed
    ? new URL(getSafeNextPath(input.next), input.origin)
    : new URL("/login?error=oauth_callback", input.origin);

  return {
    destination: destination.toString(),
    effects: result.effects,
  };
}
