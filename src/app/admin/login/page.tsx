import { redirect } from "next/navigation";
import { AuthShell } from "../AuthShell";
import { LoginForm } from "../AuthForms";
import { signOutAction } from "../auth-actions";
import { getAdminContext } from "@/lib/auth/admin";
import { createSessionSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { Button } from "@/components/buttons/Button";
import { FormMessage } from "@/components/forms/Fields";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin sign in" };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const { reset } = await searchParams;
  const configured = isSupabaseConfigured();
  if (await getAdminContext()) redirect("/admin");

  let signedInWithoutAccess = false;
  if (configured) {
    const { data } = await (await createSessionSupabase()).auth.getUser();
    signedInWithoutAccess = !!data.user;
  }

  return (
    <AuthShell title="Admin sign in" intro="Sign in with your administrator email and password.">
      {!configured ? (
        <FormMessage tone="info">Supabase is not configured. Set the environment variables described in docs/ENVIRONMENT_SETUP.md.</FormMessage>
      ) : signedInWithoutAccess ? (
        <div className="flex flex-col gap-4">
          <FormMessage tone="error">This account does not have administrator access.</FormMessage>
          <form action={signOutAction}>
            <Button type="submit" variant="primary" className="w-full">
              Sign out
            </Button>
          </form>
        </div>
      ) : (
        <LoginForm notice={reset ? "Your password has been updated. Sign in with your new password." : null} />
      )}
    </AuthShell>
  );
}
