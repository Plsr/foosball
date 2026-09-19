import type { AuthEffects, RequestCookie, Viewer } from "@/data/auth";
import {
  createAuthRepository,
  type AuthRepository,
} from "@/data/repositories/auth.repository";

export type RequestContext = {
  completeGitHubSignIn(code: string): Promise<boolean>;
  getAuthEffects(): AuthEffects;
  getCurrentViewer(): Promise<Viewer | null>;
  isAuthConfigured(): boolean;
  signOut(): Promise<void>;
  startGitHubSignIn(redirectTo: string): Promise<string | null>;
};

type RequestContextDependencies = {
  createAuthRepository(cookies: readonly RequestCookie[]): AuthRepository;
};

const productionDependencies: RequestContextDependencies = {
  createAuthRepository,
};

export function createRequestContext(
  input: { cookies: readonly RequestCookie[] },
  dependencies: RequestContextDependencies = productionDependencies,
): RequestContext {
  const auth = dependencies.createAuthRepository(input.cookies);
  let viewer: Promise<Viewer | null> | undefined;

  return {
    completeGitHubSignIn: (code) => auth.completeGitHubSignIn(code),
    getAuthEffects: () => auth.getEffects(),
    getCurrentViewer() {
      viewer ??= auth.getCurrentViewer();
      return viewer;
    },
    isAuthConfigured: () => auth.isConfigured(),
    signOut: () => auth.signOut(),
    startGitHubSignIn: (redirectTo) => auth.startGitHubSignIn(redirectTo),
  };
}
