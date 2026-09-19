import type { AuthEffects, RequestCookie } from "@/data/auth";
import {
  getCurrentViewer,
  isAuthConfigured,
  type CurrentViewerResult,
} from "@/data/contexts/request.context";

export type RequestAuthResult =
  | { status: "allow"; effects: AuthEffects }
  | {
      status: "redirect";
      destination: string;
      responseStatus?: 303;
      effects: AuthEffects;
    }
  | {
      status: "reject";
      responseStatus: 401 | 503;
      error: string;
      effects: AuthEffects;
    };

type RequestAuthDependencies = {
  getCurrentViewer(input: {
    cookies: readonly RequestCookie[];
  }): Promise<CurrentViewerResult>;
  isAuthConfigured(): boolean;
};

const productionDependencies: RequestAuthDependencies = {
  getCurrentViewer,
  isAuthConfigured,
};

const publicPaths = ["/login", "/auth/", "/api/health"];

export async function authorizeRequest(
  input: {
    cookies: readonly RequestCookie[];
    origin: string;
    pathname: string;
    search: string;
  },
  dependencies: RequestAuthDependencies = productionDependencies,
): Promise<RequestAuthResult> {
  if (!dependencies.isAuthConfigured()) {
    const effects: AuthEffects = { cookies: [], headers: [] };
    if (input.pathname === "/login" || input.pathname === "/api/health") {
      return { status: "allow", effects };
    }

    if (input.pathname.startsWith("/api/")) {
      return {
        status: "reject",
        responseStatus: 503,
        error: "Authentication is not configured",
        effects,
      };
    }

    return {
      status: "redirect",
      destination: new URL("/login?error=configuration", input.origin).toString(),
      responseStatus: 303,
      effects,
    };
  }

  const { viewer, effects } = await dependencies.getCurrentViewer(input);
  const isPublic = isPublicPath(input.pathname);

  if (!viewer && !isPublic) {
    if (input.pathname.startsWith("/api/")) {
      return {
        status: "reject",
        responseStatus: 401,
        error: "Authentication required",
        effects,
      };
    }

    const loginUrl = new URL("/login", input.origin);
    loginUrl.searchParams.set("next", `${input.pathname}${input.search}`);
    return {
      status: "redirect",
      destination: loginUrl.toString(),
      responseStatus: 303,
      effects,
    };
  }

  if (viewer && input.pathname === "/login") {
    return {
      status: "redirect",
      destination: new URL("/", input.origin).toString(),
      effects,
    };
  }

  return { status: "allow", effects };
}

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((path) =>
    path.endsWith("/") ? pathname.startsWith(path) : pathname === path,
  );
}
