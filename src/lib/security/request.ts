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
 * CSRF defence for JSON POST endpoints: browsers always send an Origin header
 * on cross-site POSTs, so require it to match this site.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const o = new URL(origin);
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (host && o.host === host) return true;
    return o.origin === new URL(publicEnv.siteUrl).origin;
  } catch {
    return false;
  }
}
