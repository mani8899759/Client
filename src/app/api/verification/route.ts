import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/service";
import { consumeRateLimit, logSecurityEvent } from "@/lib/security/rate-limit";
import { clientIp, hashIdentifier, isSameOrigin } from "@/lib/security/request";
import { normalizeIndianMobile, verificationSchema } from "@/lib/validation/participant";

export const dynamic = "force-dynamic";

type RpcResult = {
  status: "verified" | "already_verified" | "not_found" | "inactive" | "closed" | "disabled";
  display_name?: string;
  side?: "bride" | "groom";
};

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * POST /api/verification — common event QR → registered mobile number match.
 * No OTP by design (approved workflow). Abuse controls: per-IP and
 * per-number rate limits, generic failure messages, logging of failed and
 * throttled attempts. The update itself is atomic inside verify_participant().
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json(403, { status: "error", message: "Invalid request origin." });

  const supabase = getServiceSupabase();
  if (!supabase) return json(503, { status: "disabled", message: "Verification is currently unavailable." });

  const ipHash = hashIdentifier(clientIp(request.headers));
  if (!(await consumeRateLimit(supabase, `verify:ip:${ipHash}`, 15, 600))) {
    await logSecurityEvent(supabase, "rate_limited", ipHash, { endpoint: "verification" });
    return json(429, { status: "rate_limited", message: "Too many attempts. Please wait a few minutes and try again." });
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 1_000) return json(413, { status: "invalid", message: "Request too large." });
    body = JSON.parse(text);
  } catch {
    return json(400, { status: "invalid", message: "Enter a valid mobile number." });
  }

  const parsed = verificationSchema.safeParse(body);
  if (!parsed.success) return json(422, { status: "invalid", message: "Enter a valid mobile number." });

  const mobile = normalizeIndianMobile(parsed.data.mobile)!;
  const mobileHash = hashIdentifier(mobile);
  if (!(await consumeRateLimit(supabase, `verify:mobile:${mobileHash}`, 6, 600))) {
    await logSecurityEvent(supabase, "rate_limited", ipHash, { endpoint: "verification", scope: "mobile" });
    return json(429, { status: "rate_limited", message: "Too many attempts for this number. Please wait a few minutes." });
  }

  const { data, error } = await supabase.rpc("verify_participant", { p_normalized_mobile: mobile });
  if (error) {
    console.error("verification failed", error.code);
    return json(500, { status: "error", message: "Unable to verify right now. Please try again in a moment." });
  }

  const result = data as RpcResult;
  switch (result.status) {
    case "verified":
      return json(200, { status: "verified", name: result.display_name, side: result.side });
    case "already_verified":
      return json(200, { status: "already_verified", name: result.display_name, side: result.side });
    case "not_found":
      await logSecurityEvent(supabase, "verification_not_found", ipHash, {});
      return json(404, {
        status: "not_found",
        message: "Registration not found. Check the number you registered with, or register first.",
      });
    case "inactive":
      return json(403, { status: "inactive", message: "This registration is not active. Please contact the organisers." });
    case "closed":
      return json(403, { status: "closed", message: "Registration is closed. Verification has ended for the lucky draw." });
    case "disabled":
    default:
      return json(503, { status: "disabled", message: "Verification is currently unavailable." });
  }
}
