import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Database-backed fixed-window rate limit (see consume_rate_limit()).
 * Works across serverless instances without extra infrastructure.
 * Fails open on infrastructure errors so a transient database issue does not
 * lock every guest out at the venue; the failure is logged.
 */
export async function consumeRateLimit(
  supabase: SupabaseClient,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) {
    console.error("rate limit check failed", error.code);
    return true;
  }
  return data === true;
}

export async function logSecurityEvent(
  supabase: SupabaseClient,
  eventType: string,
  ipHash: string,
  detail: Record<string, unknown> = {},
): Promise<void> {
  const { error } = await supabase.rpc("log_security_event", {
    p_event_type: eventType,
    p_ip_hash: ipHash,
    p_detail: detail,
  });
  if (error) console.error("security event log failed", error.code);
}
