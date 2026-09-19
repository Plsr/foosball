import type { AuthEffects, RequestCookie, Viewer } from "@/data/auth";
import {
  AuthRepository,
  type AuthRepositoryResult,
} from "@/data/repositories/auth.repository";

export type RequestContext = {
  getAuthEffects(): AuthEffects;
  getCurrentViewer(): Promise<Viewer | null>;
  isAuthConfigured(): boolean;
};

type RequestContextDependencies = {
  getCurrentViewer(input: {
    cookies: readonly RequestCookie[];
  }): Promise<AuthRepositoryResult<Viewer | null>>;
  isAuthConfigured(): boolean;
};

const productionDependencies: RequestContextDependencies = {
  getCurrentViewer: AuthRepository.getCurrentViewer,
  isAuthConfigured: AuthRepository.isConfigured,
};

export function createRequestContext(
  input: { cookies: readonly RequestCookie[] },
  dependencies: RequestContextDependencies = productionDependencies,
): RequestContext {
  let viewer: Promise<Viewer | null> | undefined;
  const effects: AuthEffects = { cookies: [], headers: [] };

  return {
    getAuthEffects: () => ({
      cookies: [...effects.cookies],
      headers: [...effects.headers],
    }),
    getCurrentViewer() {
      viewer ??= dependencies.getCurrentViewer(input).then((result) => {
        effects.cookies.push(...result.effects.cookies);
        effects.headers.push(...result.effects.headers);
        return result.value;
      });
      return viewer;
    },
    isAuthConfigured: dependencies.isAuthConfigured,
  };
}
