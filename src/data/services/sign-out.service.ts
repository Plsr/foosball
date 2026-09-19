import type { AuthEffects, RequestCookie } from "@/data/auth";
import {
  createAuthRepository,
  type AuthRepository,
} from "@/data/repositories/auth.repository";

export type SignOutResult = {
  destination: string;
  effects: AuthEffects;
};

type SignOutDependencies = {
  createAuthRepository(cookies: readonly RequestCookie[]): Pick<
    AuthRepository,
    "getEffects" | "signOut"
  >;
};

const productionDependencies: SignOutDependencies = {
  createAuthRepository,
};

export async function signOut(
  input: { cookies: readonly RequestCookie[]; origin: string },
  dependencies: SignOutDependencies = productionDependencies,
): Promise<SignOutResult> {
  const auth = dependencies.createAuthRepository(input.cookies);
  await auth.signOut();

  return {
    destination: new URL("/login", input.origin).toString(),
    effects: auth.getEffects(),
  };
}
