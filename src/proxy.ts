import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Runs for /admin routes only: refreshes the Supabase session cookie and
 * redirects anonymous visitors to the login page. This is a first line of
 * defence — every admin page, Server Action and Route Handler re-verifies the
 * user and their admin profile on the server, and RLS enforces it again in
 * the database.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Reachable without a session: sign-in, password-reset request and the Supabase auth callback.
  // (/admin/reset-password needs the session the callback creates; the page checks it itself.)
  const isLogin = ["/admin/login", "/admin/forgot-password", "/admin/auth/callback", "/admin/reset-password"].includes(
    request.nextUrl.pathname,
  );

  if (!url || !key) {
    return isLogin ? NextResponse.next() : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
      },
    },
  });

  const { data } = await supabase.auth.getUser();

  if (!data.user && !isLogin) {
    const login = new URL("/admin/login", request.url);
    return NextResponse.redirect(login);
  }

  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
