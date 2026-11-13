import { redirect } from "next/navigation";
import { AuthShell } from "../AuthShell";
import { ResetPasswordForm } from "../AuthForms";
import { createSessionSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata = { title: "Choose a new password" };

/** Reached from the Supabase reset email (via /admin/auth/callback, which establishes the session). */
export default async function ResetPasswordPage() {
  if (!isSupabaseConfigured()) redirect("/admin/login");
  const { data } = await (await createSessionSupabase()).auth.getUser();
  if (!data.user) redirect("/admin/forgot-password?expired=1");
  return (
    <AuthShell title="Choose a new password" intro={`For ${data.user.email ?? "your account"}.`}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
