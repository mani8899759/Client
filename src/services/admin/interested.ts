import type { SupabaseClient } from "@supabase/supabase-js";

export type InterestedSummaryEvent = {
  event_id: string;
  name: string;
  slug: string;
  event_date: string | null;
  start_time: string | null;
  sort_order?: number;
  venue_name: string;
  interested_count: number;
};

export type InterestedSummary = {
  total_unique_interested: number;
  events: InterestedSummaryEvent[];
};

export type InterestedRow = {
  id: string;
  event_id: string;
  visitor_id: string;
  created_at: string;
  event_name: string;
  event_slug: string;
  event_date: string | null;
  venue_name: string;
  participant_id: string | null;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  is_registered: boolean;
};

export type InterestedFilters = {
  q?: string;
  event?: string;
  registered?: "all" | "registered" | "unregistered";
  sort?: "date_desc" | "date_asc";
  page: number;
  pageSize: number;
};

export function parseInterestedFilters(params: Record<string, string | string[] | undefined>): InterestedFilters {
  const get = (k: string) => {
    const val = params[k];
    return Array.isArray(val) ? val[0] : val;
  };

  const q = get("q")?.trim() || undefined;
  const event = get("event")?.trim() || undefined;
  const registeredRaw = get("registered");
  const registered = registeredRaw === "registered" || registeredRaw === "unregistered" ? registeredRaw : "all";
  const sortRaw = get("sort");
  const sort = sortRaw === "date_asc" ? "date_asc" : "date_desc";
  const pageParsed = parseInt(get("page") ?? "1", 10);
  const page = Number.isFinite(pageParsed) && pageParsed > 0 ? pageParsed : 1;

  return { q, event, registered, sort, page, pageSize: 20 };
}

export async function getInterestedSummary(supabase: SupabaseClient): Promise<InterestedSummary> {
  const { data, error } = await supabase.rpc("admin_event_interests_summary");
  if (error || !data) {
    return { total_unique_interested: 0, events: [] };
  }
  return data as InterestedSummary;
}

export async function listEventInterests(
  supabase: SupabaseClient,
  filters: InterestedFilters,
): Promise<{ rows: InterestedRow[]; count: number; error: Error | null }> {
  try {
    let query = supabase
      .from("admin_event_interests_view")
      .select("*", { count: "exact" });

    if (filters.event && filters.event !== "all") {
      query = query.or(`event_slug.eq.${filters.event},event_id.eq.${filters.event}`);
    }

    if (filters.registered === "registered") {
      query = query.eq("is_registered", true);
    } else if (filters.registered === "unregistered") {
      query = query.eq("is_registered", false);
    }

    if (filters.q) {
      const escaped = filters.q.replace(/[%_]/g, "");
      query = query.or(
        `guest_name.ilike.%${escaped}%,guest_email.ilike.%${escaped}%,guest_phone.ilike.%${escaped}%,event_name.ilike.%${escaped}%`,
      );
    }

    query = query.order("created_at", { ascending: filters.sort === "date_asc" });

    const from = (filters.page - 1) * filters.pageSize;
    const to = from + filters.pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      return { rows: [], count: 0, error: new Error(error.message) };
    }

    return {
      rows: (data as InterestedRow[]) ?? [],
      count: count ?? 0,
      error: null,
    };
  } catch (err) {
    return { rows: [], count: 0, error: err as Error };
  }
}
