import type { AuthEffects, RequestCookie } from "@/data/auth";
import {
  AuthRepository,
  type AuthRepositoryRequest,
  type AuthRepositoryResult,
} from "@/data/repositories/auth.repository";

export type SignOutResult = {
  destination: string;
  effects: AuthEffects;
};

type SignOutDependencies = {
  signOut(
    input: AuthRepositoryRequest,
  ): Promise<AuthRepositoryResult<void>>;
};

const productionDependencies: SignOutDependencies = {
  signOut: AuthRepository.signOut,
};

export async function signOut(
  input: { cookies: readonly RequestCookie[]; origin: string },
  dependencies: SignOutDependencies = productionDependencies,
): Promise<SignOutResult> {
  const result = await dependencies.signOut({ cookies: input.cookies });

  return {
    destination: new URL("/login", input.origin).toString(),
    effects: result.effects,
  };
}
