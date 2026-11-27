import "server-only";
import { createHash } from "node:crypto";
import { serverEnv, publicEnv } from "@/lib/env";

export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export function hashIdentifier(value: string): string {
  return createHash("sha256").update(`${serverEnv().rateLimitSalt}:${value}`).digest("hex").slice(0, 32);
}

/**
 * CSRF defence for JSON POST endpoints: verifies that the request originates
 * from this site via origin, referer, sec-fetch-site, or host headers.
 * Handles mobile QR scanners and in-app webviews gracefully.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  if (origin && origin !== "null") {
    try {
      const o = new URL(origin);
      if (host && (o.host === host || o.host === host.split(":")[0])) return true;
      if (o.origin === new URL(publicEnv.siteUrl).origin) return true;
    } catch {
      // invalid URL
    }
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const r = new URL(referer);
      if (host && (r.host === host || r.host === host.split(":")[0])) return true;
      if (r.origin === new URL(publicEnv.siteUrl).origin) return true;
    } catch {
      // invalid URL
    }
  }

  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "same-origin" || secFetchSite === "same-site") return true;

  // Fallback for mobile QR scanners / WebViews that strip origin/referer on internal fetch
  if (!origin && !referer && host) {
    try {
      const siteHost = new URL(publicEnv.siteUrl).host;
      if (host === siteHost || host.split(":")[0] === siteHost.split(":")[0]) return true;
    } catch {
      // ignore
    }
  }

  return false;
}
