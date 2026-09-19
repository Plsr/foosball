import type { AuthEffects, RequestCookie } from "@/data/auth";
import {
  createRequestContext,
  type RequestContext,
} from "@/data/contexts/request.context";

export type SignOutResult = {
  destination: string;
  effects: AuthEffects;
};

type SignOutDependencies = {
  createRequestContext(input: {
    cookies: readonly RequestCookie[];
  }): Pick<RequestContext, "getAuthEffects" | "signOut">;
};

const productionDependencies: SignOutDependencies = {
  createRequestContext,
};

export async function signOut(
  input: { cookies: readonly RequestCookie[]; origin: string },
  dependencies: SignOutDependencies = productionDependencies,
): Promise<SignOutResult> {
  const context = dependencies.createRequestContext(input);
  await context.signOut();

  return {
    destination: new URL("/login", input.origin).toString(),
    effects: context.getAuthEffects(),
  };
}
