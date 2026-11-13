import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isStorageRef, isValidMediaRef, splitMediaRef } from "@/lib/storage/media";

/** Validate a submitted media reference: empty → null, malformed → error. */
export function mediaRefField(value: string | null): { ok: true; value: string | null } | { ok: false } {
  if (!value) return { ok: true, value: null };
  return isValidMediaRef(value) ? { ok: true, value } : { ok: false };
}

/** Delete storage objects that are no longer referenced after an update/delete (best effort). */
export async function removeMedia(supabase: SupabaseClient, refs: Array<string | null | undefined>) {
  const byBucket = new Map<string, string[]>();
  for (const ref of refs) {
    // Bundled AI assets live in the repository, not Storage — never delete them.
    if (!isStorageRef(ref)) continue;
    const { bucket, path } = splitMediaRef(ref);
    byBucket.set(bucket, [...(byBucket.get(bucket) ?? []), path]);
  }
  for (const [bucket, paths] of byBucket) {
    const { error } = await supabase.storage.from(bucket).remove(paths);
    if (error) console.error("[storage] cleanup failed", bucket, error.message);
  }
}

/** Media references present before an update that the update replaced or cleared. */
export function replacedRefs<T extends object>(before: T | null, after: Partial<T>, keys: Array<keyof T>): string[] {
  if (!before) return [];
  return keys.flatMap((k) => {
    const old = before[k];
    return typeof old === "string" && k in after && old !== after[k] ? [old] : [];
  });
}
