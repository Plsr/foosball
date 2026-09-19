import { isAuthConfigured } from "@/data/contexts/request.context";
import { getSafeNextPath } from "@/lib/auth/redirect";

export type LoginPageData = {
  configured: boolean;
  errorMessage: string | undefined;
  signInAction: string;
};

type LoginPageDependencies = {
  isAuthConfigured(): boolean;
};

const productionDependencies: LoginPageDependencies = {
  isAuthConfigured,
};

const errorMessages: Record<string, string> = {
  configuration: "Supabase Auth has not been configured for this deployment yet.",
  oauth_callback: "GitHub could not complete the sign-in. Please try again.",
  oauth_start: "GitHub sign-in could not be started. Please try again.",
};

export function getLoginPageData(
  input: { error?: string; next?: string },
  dependencies: LoginPageDependencies = productionDependencies,
): LoginPageData {
  const next = getSafeNextPath(input.next ?? null);

  return {
    configured: dependencies.isAuthConfigured(),
    errorMessage: input.error ? errorMessages[input.error] : undefined,
    signInAction:
      next === "/" ? "/auth/sign-in" : `/auth/sign-in?next=${encodeURIComponent(next)}`,
  };
}
