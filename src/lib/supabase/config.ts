export type SupabaseConfig = {
  url: string;
  publishableKey: string;
};

function readSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    return null;
  }

  return { url, publishableKey };
}

export function isSupabaseConfigured(): boolean {
  return readSupabaseConfig() !== null;
}

export function getSupabaseConfig(): SupabaseConfig {
  const config = readSupabaseConfig();

  if (!config) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be configured",
    );
  }

  return config;
}
