import type { AuthEffects, RequestCookie } from "@/data/auth";
import {
  createAuthRepository,
  type AuthRepository,
} from "@/data/repositories/auth.repository";
import { getSafeNextPath } from "@/lib/auth/redirect";

export type StartGitHubSignInResult = {
  destination: string;
  effects: AuthEffects;
};

type StartGitHubSignInDependencies = {
  createAuthRepository(cookies: readonly RequestCookie[]): Pick<
    AuthRepository,
    "getEffects" | "startGitHubSignIn"
  >;
};

const productionDependencies: StartGitHubSignInDependencies = {
  createAuthRepository,
};

export async function startGitHubSignIn(
  input: {
    cookies: readonly RequestCookie[];
    origin: string;
    next: string | null;
  },
  dependencies: StartGitHubSignInDependencies = productionDependencies,
): Promise<StartGitHubSignInResult> {
  const auth = dependencies.createAuthRepository(input.cookies);
  const callbackUrl = new URL("/auth/callback", input.origin);

  if (input.next) {
    callbackUrl.searchParams.set("next", getSafeNextPath(input.next));
  }

  const oauthUrl = await auth.startGitHubSignIn(callbackUrl.toString());
  return {
    destination:
      oauthUrl ?? new URL("/login?error=oauth_start", input.origin).toString(),
    effects: auth.getEffects(),
  };
}
