import "server-only";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { AdminAuthError, requireAdmin, type AdminContext } from "@/lib/auth/admin";
import type { FieldErrors } from "@/lib/validation/participant";

export type ActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: FieldErrors;
  /** Changes on every result so clients can react to repeated identical messages. */
  ts: number;
  data?: Record<string, unknown>;
} | null;

export const ok = (message: string, data?: Record<string, unknown>): ActionState => ({ ok: true, message, ts: Date.now(), data });
export const fail = (message: string, fieldErrors?: FieldErrors): ActionState => ({ ok: false, message, fieldErrors, ts: Date.now() });

/** Runs a Server Action body only for an active administrator (verified server-side). */
export async function withAdmin(fn: (ctx: AdminContext) => Promise<ActionState>): Promise<ActionState> {
  try {
    const ctx = await requireAdmin();
    return await fn(ctx);
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof AdminAuthError) return fail("Your session has expired. Please sign in again.");
    console.error("[admin action]", error);
    return fail("Something went wrong. Please try again.");
  }
}

/** Revalidate every public page after a content change. */
export function revalidatePublic() {
  revalidatePath("/", "layout");
}

// ── FormData helpers ────────────────────────────────────────────────────────
export function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

export function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1";
}

export function int(fd: FormData, key: string, fallback = 0): number {
  const v = Number.parseInt(String(fd.get(key) ?? ""), 10);
  return Number.isFinite(v) ? v : fallback;
}

export function num(fd: FormData, key: string): number | null {
  const raw = str(fd, key);
  if (raw === null) return null;
  const v = Number(raw);
  return Number.isFinite(v) ? v : null;
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function uuid(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v && UUID.test(v) ? v : null;
}
