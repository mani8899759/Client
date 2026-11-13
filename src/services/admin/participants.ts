import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ADMIN_PAGE_SIZE } from "@/config/site";
import type { Participant } from "@/types/database";

export type ParticipantFilters = {
  q: string;
  side: "" | "bride" | "groom";
  registration: "" | "registered" | "cancelled";
  verification: "" | "pending" | "verified";
  sort: "registered_at" | "full_name" | "verified_at";
  dir: "asc" | "desc";
  page: number;
};

export function parseParticipantFilters(sp: Record<string, string | string[] | undefined>): ParticipantFilters {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]) ?? "";
  const pick = <T extends string>(v: string, allowed: readonly T[], fallback: T): T => (allowed.includes(v as T) ? (v as T) : fallback);
  return {
    q: one("q").slice(0, 80),
    side: pick(one("side"), ["", "bride", "groom"] as const, ""),
    registration: pick(one("registration"), ["", "registered", "cancelled"] as const, ""),
    verification: pick(one("verification"), ["", "pending", "verified"] as const, ""),
    sort: pick(one("sort"), ["registered_at", "full_name", "verified_at"] as const, "registered_at"),
    dir: pick(one("dir"), ["asc", "desc"] as const, "desc"),
    page: Math.max(1, Math.min(10_000, Number.parseInt(one("page"), 10) || 1)),
  };
}

export function filtersToQuery(f: Partial<ParticipantFilters>, overrides: Partial<ParticipantFilters> = {}): string {
  const merged = { ...f, ...overrides };
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v === "" || v === undefined || v === null) continue;
    if (k === "page" && v === 1) continue;
    if (k === "sort" && v === "registered_at") continue;
    if (k === "dir" && v === "desc") continue;
    p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Strip characters that are meaningful in PostgREST filter syntax. */
function sanitize(q: string): string {
  return q.replace(/[%,()*\\:"']/g, " ").replace(/\s+/g, " ").trim();
}

export const PARTICIPANT_COLUMNS =
  "id, full_name, mobile_number, normalized_mobile, email, normalized_email, gender, address, side, consent, consent_timestamp, consent_policy_version, registration_status, verification_status, registered_at, verified_at";

/** Admin participant query. RLS restricts this to active administrators. */
export async function listParticipants(
  supabase: SupabaseClient,
  f: ParticipantFilters,
  opts: { all?: boolean } = {},
): Promise<{ rows: Participant[]; count: number; error: boolean }> {
  let q = supabase.from("participants").select(PARTICIPANT_COLUMNS, { count: "exact" });
  const term = sanitize(f.q);
  if (term) {
    const digits = term.replace(/\D/g, "");
    if (digits.length >= 4 && digits.length === term.replace(/[\s+-]/g, "").length) {
      q = q.ilike("normalized_mobile", `%${digits.slice(-10)}%`);
    } else {
      q = q.or(`full_name.ilike.%${term}%,normalized_email.ilike.%${term.toLowerCase()}%`);
    }
  }
  if (f.side) q = q.eq("side", f.side);
  if (f.registration) q = q.eq("registration_status", f.registration);
  if (f.verification) q = q.eq("verification_status", f.verification);
  q = q.order(f.sort, { ascending: f.dir === "asc", nullsFirst: false }).order("id");
  if (!opts.all) {
    const from = (f.page - 1) * ADMIN_PAGE_SIZE;
    q = q.range(from, from + ADMIN_PAGE_SIZE - 1);
  } else {
    q = q.limit(20_000);
  }
  const { data, count, error } = await q;
  if (error) console.error("[participants]", error.message);
  return { rows: (data as Participant[] | null) ?? [], count: count ?? 0, error: !!error };
}
