import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv, isServiceRoleConfigured } from "@/lib/env";

let client: SupabaseClient | null = null;

/**
 * Service-role client. Server-only (`server-only` import makes bundling it
 * into client code a build error). Used exclusively for the public
 * registration / verification RPCs and rate limiting, which the anon key
 * cannot execute.
 */
export function getServiceSupabase(): SupabaseClient | null {
  if (!isServiceRoleConfigured()) return null;
  client ??= createClient(publicEnv.supabaseUrl, serverEnv().serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
