import { NextResponse } from "next/server";
import { createSessionSupabase } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

/**
 * Supabase Auth redirect target (OAuth, password-reset links). Exchanges the one-time
 * code for a session, provisions admin profile if needed, then continues to an allow-listed admin page.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/admin";
  const next = ["/admin", "/admin/reset-password"].includes(nextParam) ? nextParam : "/admin";

  if (code) {
    const supabase = await createSessionSupabase();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      const service = getServiceSupabase();
      if (service) {
        const { data: profile } = await service
          .from("admin_profiles")
          .select("is_active")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (!profile) {
          const name =
            (data.user.user_metadata?.full_name as string | undefined) ||
            (data.user.user_metadata?.user_name as string | undefined) ||
            data.user.email?.split("@")[0] ||
            "Admin";
          await service.from("admin_profiles").insert({
            user_id: data.user.id,
            full_name: name,
            role: "owner",
            is_active: true,
          });
        }
      }
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }
  return NextResponse.redirect(new URL("/admin/forgot-password?expired=1", url.origin));
}
