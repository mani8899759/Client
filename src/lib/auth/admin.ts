import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createSessionSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { AdminProfile } from "@/types/database";

export type AdminContext = {
  supabase: Awaited<ReturnType<typeof createSessionSupabase>>;
  userId: string;
  email: string | null;
  profile: AdminProfile;
};

/** Verifies the session with Supabase Auth (getUser, not only the cookie) and the admin profile. */
export const getAdminContext = cache(async (): Promise<AdminContext | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSessionSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("user_id, full_name, role, is_active")
    .eq("user_id", data.user.id)
    .maybeSingle<AdminProfile>();
  if (!profile || !profile.is_active) return null;
  return { supabase, userId: data.user.id, email: data.user.email ?? null, profile };
});

/** For admin pages: redirect to login when not an active administrator. */
export async function requireAdminPage(): Promise<AdminContext> {
  const ctx = await getAdminContext();
  if (!ctx) redirect("/admin/login");
  return ctx;
}

export class AdminAuthError extends Error {}

/** For Server Actions / Route Handlers: throws when not an active administrator. */
export async function requireAdmin(): Promise<AdminContext> {
  const ctx = await getAdminContext();
  if (!ctx) throw new AdminAuthError("unauthorized");
  return ctx;
}
