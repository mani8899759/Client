/**
 * Environment access with validation. Public values may be read anywhere;
 * server-only values are exposed through `serverEnv()` which must never be
 * imported into a client component (see lib/supabase/service.ts).
 */
export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, ""),
};

export function isSupabaseConfigured(): boolean {
  return /^https?:\/\//.test(publicEnv.supabaseUrl) && publicEnv.supabaseAnonKey.length > 20;
}

export function serverEnv() {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() must not be called in the browser");
  }
  return {
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    rateLimitSalt: process.env.RATE_LIMIT_SALT ?? "",
  };
}

export function isServiceRoleConfigured(): boolean {
  return isSupabaseConfigured() && serverEnv().serviceRoleKey.length > 20;
}
