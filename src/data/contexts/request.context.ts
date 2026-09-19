import type { AuthEffects, RequestCookie, Viewer } from "@/data/auth";
import { AuthRepository } from "@/data/repositories/auth.repository";

export type CurrentViewerResult = {
  viewer: Viewer | null;
  effects: AuthEffects;
};

export function isAuthConfigured(): boolean {
  return AuthRepository.isConfigured();
}

export async function getCurrentViewer(
  input: { cookies: readonly RequestCookie[] },
): Promise<CurrentViewerResult> {
  const result = await AuthRepository.getCurrentViewer(input);
  return { viewer: result.value, effects: result.effects };
}
