import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  AuthEffects,
  CookieMutation,
  HeaderMutation,
  RequestCookie,
  Viewer,
} from "@/data/auth";

export type AuthRepository = {
  completeGitHubSignIn(code: string): Promise<boolean>;
  getCurrentViewer(): Promise<Viewer | null>;
  getEffects(): AuthEffects;
  isConfigured(): boolean;
  signOut(): Promise<void>;
  startGitHubSignIn(redirectTo: string): Promise<string | null>;
};

export function createAuthRepository(
  requestCookies: readonly RequestCookie[],
): AuthRepository {
  const cookies = new Map(requestCookies.map(({ name, value }) => [name, value]));
  const cookieMutations: CookieMutation[] = [];
  const headers = new Map<string, string>();
  let client: ReturnType<typeof createServerClient> | undefined;

  function getClient(): ReturnType<typeof createServerClient> {
    if (client) return client;

    const { url, publishableKey } = getSupabaseConfig();
    client = createServerClient(url, publishableKey, {
      cookies: {
        getAll() {
          return [...cookies].map(([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet, headersToSet) {
          for (const cookie of cookiesToSet) {
            cookies.set(cookie.name, cookie.value);
            cookieMutations.push(toCookieMutation(cookie));
          }

          for (const [name, value] of Object.entries(headersToSet)) {
            headers.set(name, value);
          }
        },
      },
    });

    return client;
  }

  return {
    async completeGitHubSignIn(code) {
      if (!isSupabaseConfigured()) return false;
      const { error } = await getClient().auth.exchangeCodeForSession(code);
      return !error;
    },

    async getCurrentViewer() {
      if (!isSupabaseConfigured()) return null;

      const { data, error } = await getClient().auth.getClaims();
      if (error || !data) return null;

      const { claims } = data;
      const userMetadata = claims.user_metadata;
      return {
        id: claims.sub,
        email: typeof claims.email === "string" ? claims.email : null,
        userName:
          userMetadata && typeof userMetadata.user_name === "string"
            ? userMetadata.user_name
            : null,
      };
    },

    getEffects() {
      const headerMutations: HeaderMutation[] = [...headers].map(([name, value]) => ({
        name,
        value,
      }));
      return { cookies: [...cookieMutations], headers: headerMutations };
    },

    isConfigured: isSupabaseConfigured,

    async signOut() {
      if (!isSupabaseConfigured()) return;
      await getClient().auth.signOut({ scope: "local" });
    },

    async startGitHubSignIn(redirectTo) {
      if (!isSupabaseConfigured()) return null;

      const { data, error } = await getClient().auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo },
      });
      return error ? null : data.url;
    },
  };
}

function toCookieMutation(cookie: {
  name: string;
  value: string;
  options: CookieOptions;
}): CookieMutation {
  return {
    name: cookie.name,
    value: cookie.value,
    options: {
      domain: cookie.options.domain,
      expires: cookie.options.expires,
      httpOnly: cookie.options.httpOnly,
      maxAge: cookie.options.maxAge,
      partitioned: cookie.options.partitioned,
      path: cookie.options.path,
      priority: cookie.options.priority,
      sameSite: cookie.options.sameSite,
      secure: cookie.options.secure,
    },
  };
}
