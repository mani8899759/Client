"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSessionSupabase } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/service";
import { consumeRateLimit, logSecurityEvent } from "@/lib/security/rate-limit";
import { clientIp, hashIdentifier } from "@/lib/security/request";
import { isSupabaseConfigured, publicEnv } from "@/lib/env";

export type AuthState = { ok: boolean; message: string; fieldErrors?: Record<string, string>; email?: string } | null;

const emailSchema = z.string().trim().toLowerCase().min(1, "Enter your email address.").max(254).email("Enter a valid email address.");

async function throttle(scope: string, limit: number): Promise<boolean> {
  const service = getServiceSupabase();
  if (!service) return true;
  const ipHash = hashIdentifier(clientIp(await headers()));
  const allowed = await consumeRateLimit(service, `admin:${scope}:${ipHash}`, limit, 900);
  if (!allowed) await logSecurityEvent(service, "rate_limited", ipHash, { endpoint: `admin_${scope}` });
  return allowed;
}

/**
 * Administrator sign-in (Supabase Auth, email + password).
 * The session cookie is set server-side; the account must also have an
 * active admin_profiles row, otherwise it is signed straight back out.
 */
export async function signInAction(_: AuthState, fd: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Authentication is not configured yet." };
  const email = emailSchema.safeParse(fd.get("email"));
  const password = String(fd.get("password") ?? "");
  const fieldErrors: Record<string, string> = {};
  if (!email.success) fieldErrors.email = email.error.issues[0]?.message ?? "Enter a valid email address.";
  if (!password) fieldErrors.password = "Enter your password.";
  const typed = String(fd.get("email") ?? "").slice(0, 254);
  if (Object.keys(fieldErrors).length) return { ok: false, message: "Please complete both fields.", fieldErrors, email: typed };

  if (!(await throttle("login", 10))) return { ok: false, message: "Too many sign-in attempts. Please wait 15 minutes and try again." };

  const supabase = await createSessionSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.data!, password });
  if (error || !data.user) {
    // Generic message: never reveal whether the account exists.
    return { ok: false, message: "The email address or password is incorrect.", email: typed };
  }

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("is_active")
    .eq("user_id", data.user.id)
    .maybeSingle<{ is_active: boolean }>();
  if (!profile?.is_active) {
    await supabase.auth.signOut();
    return { ok: false, message: "This account does not have administrator access." };
  }

  await supabase.rpc("admin_log_auth_event", { p_action: "auth.sign_in" });
  redirect("/admin");
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createSessionSupabase();
    await supabase.rpc("admin_log_auth_event", { p_action: "auth.sign_out" });
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

/** Sends a Supabase password-reset email. Always answers the same way (no account enumeration). */
export async function requestPasswordReset(_: AuthState, fd: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Authentication is not configured yet." };
  const email = emailSchema.safeParse(fd.get("email"));
  if (!email.success) return { ok: false, message: "Enter a valid email address.", fieldErrors: { email: "Enter a valid email address." } };
  if (!(await throttle("reset", 5))) return { ok: false, message: "Too many requests. Please wait 15 minutes and try again." };

  const supabase = await createSessionSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${publicEnv.siteUrl}/admin/auth/callback?next=/admin/reset-password`,
  });
  if (error) console.error("[auth] reset email failed", error.status);
  return {
    ok: true,
    message: "If an administrator account exists for this address, a password-reset link is on its way. Check your inbox and spam folder.",
  };
}

const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(72, "Use 72 characters or fewer.")
  .refine((p) => /[A-Za-z]/.test(p) && /\d/.test(p), "Include at least one letter and one number.");

/** Sets a new password for the signed-in user (reached through the reset-email link). */
export async function updatePasswordAction(_: AuthState, fd: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "Authentication is not configured yet." };
  const password = passwordSchema.safeParse(String(fd.get("password") ?? ""));
  if (!password.success) {
    return { ok: false, message: "Choose a stronger password.", fieldErrors: { password: password.error.issues[0]?.message ?? "Invalid password." } };
  }
  if (password.data !== String(fd.get("confirm") ?? "")) {
    return { ok: false, message: "The passwords do not match.", fieldErrors: { confirm: "The passwords do not match." } };
  }
  const supabase = await createSessionSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { ok: false, message: "This reset link has expired. Request a new one." };

  const { error } = await supabase.auth.updateUser({ password: password.data });
  if (error) return { ok: false, message: "The password could not be updated. Request a new reset link and try again." };

  await supabase.rpc("admin_log_auth_event", { p_action: "auth.password_changed" });
  await supabase.auth.signOut();
  redirect("/admin/login?reset=1");
}
