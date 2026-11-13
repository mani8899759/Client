import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type OrderedTable = "story_entries" | "events" | "gallery_categories" | "gallery_media" | "live_streams";

/** Move a row one position up/down by rewriting sort_order for its table (small, admin-only tables). */
export async function moveRow(
  supabase: SupabaseClient,
  table: OrderedTable,
  id: string,
  direction: "up" | "down",
  scope?: { column: string; value: string | null },
): Promise<{ error: string | null }> {
  let q = supabase.from(table).select("id, sort_order").order("sort_order", { ascending: true }).order("created_at", { ascending: true });
  if (scope) q = scope.value === null ? q.is(scope.column, null) : q.eq(scope.column, scope.value);
  const { data, error } = await q;
  if (error || !data) return { error: "Could not load items." };
  const rows = data as Array<{ id: string; sort_order: number }>;
  const i = rows.findIndex((r) => r.id === id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= rows.length) return { error: null };
  [rows[i], rows[j]] = [rows[j]!, rows[i]!];
  const updates = rows
    .map((r, idx) => ({ id: r.id, sort_order: (idx + 1) * 10, changed: r.sort_order !== (idx + 1) * 10 }))
    .filter((r) => r.changed);
  for (const u of updates) {
    const { error: e } = await supabase.from(table).update({ sort_order: u.sort_order }).eq("id", u.id);
    if (e) return { error: "Could not reorder items." };
  }
  return { error: null };
}

export async function setPublished(
  supabase: SupabaseClient,
  table: OrderedTable,
  id: string,
  published: boolean,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from(table).update({ is_published: published }).eq("id", id);
  return { error: error ? "Could not update visibility." : null };
}

export async function nextSortOrder(supabase: SupabaseClient, table: OrderedTable): Promise<number> {
  const { data } = await supabase.from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const max = (data as Array<{ sort_order: number }> | null)?.[0]?.sort_order ?? 0;
  return max + 10;
}
