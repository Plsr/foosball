import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  AuthEffects,
  CookieMutation,
  RequestCookie,
  Viewer,
} from "@/data/auth";

export type AuthRepositoryRequest = {
  cookies: readonly RequestCookie[];
};

export type AuthRepositoryResult<T> = {
  value: T;
  effects: AuthEffects;
};

export class AuthRepository {
  private constructor() {
    throw new Error("AuthRepository cannot be instantiated");
  }

  static isConfigured(): boolean {
    return isSupabaseConfigured();
  }

  static async completeGitHubSignIn(
    input: AuthRepositoryRequest & { code: string },
  ): Promise<AuthRepositoryResult<boolean>> {
    const effects = createEffects();
    if (!isSupabaseConfigured()) return { value: false, effects };

    const { error } = await AuthRepository.createClient(input.cookies, effects).auth.exchangeCodeForSession(
      input.code,
    );
    return { value: !error, effects };
  }

  static async getCurrentViewer(
    input: AuthRepositoryRequest,
  ): Promise<AuthRepositoryResult<Viewer | null>> {
    const effects = createEffects();
    if (!isSupabaseConfigured()) return { value: null, effects };

    const { data, error } = await AuthRepository.createClient(input.cookies, effects).auth.getUser();
    if (error || !data.user) return { value: null, effects };

    const { user } = data;
    return {
      value: {
        id: user.id,
        email: user.email ?? null,
        userName:
          typeof user.user_metadata.user_name === "string"
            ? user.user_metadata.user_name
            : null,
      },
      effects,
    };
  }

  static async signOut(
    input: AuthRepositoryRequest,
  ): Promise<AuthRepositoryResult<void>> {
    const effects = createEffects();
    if (isSupabaseConfigured()) {
      await AuthRepository.createClient(input.cookies, effects).auth.signOut({ scope: "local" });
    }
    return { value: undefined, effects };
  }

  static async startGitHubSignIn(
    input: AuthRepositoryRequest & { redirectTo: string },
  ): Promise<AuthRepositoryResult<string | null>> {
    const effects = createEffects();
    if (!isSupabaseConfigured()) return { value: null, effects };

    const { data, error } = await AuthRepository.createClient(input.cookies, effects).auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: input.redirectTo },
    });
    return { value: error ? null : data.url, effects };
  }

  private static createClient(
    requestCookies: readonly RequestCookie[],
    effects: AuthEffects,
  ): ReturnType<typeof createServerClient> {
    const cookies = new Map(requestCookies.map(({ name, value }) => [name, value]));
    const { url, publishableKey } = getSupabaseConfig();

    return createServerClient(url, publishableKey, {
      cookies: {
        getAll() {
          return [...cookies].map(([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet, headersToSet) {
          for (const cookie of cookiesToSet) {
            cookies.set(cookie.name, cookie.value);
            effects.cookies.push(toCookieMutation(cookie));
          }

          for (const [name, value] of Object.entries(headersToSet)) {
            setHeaderEffect(effects, name, value);
          }
        },
      },
    });
  }
}

function createEffects(): AuthEffects {
  return { cookies: [], headers: [] };
}

function setHeaderEffect(effects: AuthEffects, name: string, value: string): void {
  const existing = effects.headers.find((header) => header.name === name);
  if (existing) {
    existing.value = value;
  } else {
    effects.headers.push({ name, value });
  }
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
