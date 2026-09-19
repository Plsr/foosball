import type { AuthEffects, RequestCookie } from "@/data/auth";
import {
  createAuthRepository,
  type AuthRepository,
} from "@/data/repositories/auth.repository";
import { getSafeNextPath } from "@/lib/auth/redirect";

export type CompleteGitHubSignInResult = {
  destination: string;
  effects: AuthEffects;
};

type CompleteGitHubSignInDependencies = {
  createAuthRepository(cookies: readonly RequestCookie[]): Pick<
    AuthRepository,
    "completeGitHubSignIn" | "getEffects"
  >;
};

const productionDependencies: CompleteGitHubSignInDependencies = {
  createAuthRepository,
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
  const auth = dependencies.createAuthRepository(input.cookies);
  const completed = input.code
    ? await auth.completeGitHubSignIn(input.code)
    : false;
  const destination = completed
    ? new URL(getSafeNextPath(input.next), input.origin)
    : new URL("/login?error=oauth_callback", input.origin);

  return {
    destination: destination.toString(),
    effects: auth.getEffects(),
  };
}
