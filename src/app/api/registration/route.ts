import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/service";
import { consumeRateLimit, logSecurityEvent } from "@/lib/security/rate-limit";
import { clientIp, hashIdentifier, isSameOrigin } from "@/lib/security/request";
import { fieldErrorsOf, normalizeEmail, normalizeIndianMobile, registrationSchema } from "@/lib/validation/participant";
import { getAppSettings } from "@/services/content";

export const dynamic = "force-dynamic";

type RpcResult = { status: "created" | "duplicate" | "closed" | "invalid"; full_name?: string; side?: "bride" | "groom" };

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

/**
 * POST /api/registration
 * Validate → normalise → rate limit → register_participant() (service role).
 * Duplicates are rejected by unique constraints inside the database, so
 * concurrent submissions cannot create two records.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json(403, { error: "Invalid request origin." });

  const supabase = getServiceSupabase();
  if (!supabase) return json(503, { error: "Registration is not available yet. Please try again later." });

  const ipHash = hashIdentifier(clientIp(request.headers));
  if (!(await consumeRateLimit(supabase, `register:ip:${ipHash}`, 8, 600))) {
    await logSecurityEvent(supabase, "rate_limited", ipHash, { endpoint: "registration" });
    return json(429, { error: "Too many attempts. Please wait a few minutes and try again." });
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > 8_000) return json(413, { error: "Request too large." });
    body = JSON.parse(text);
  } catch {
    return json(400, { error: "Invalid request." });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return json(422, { error: "Please correct the highlighted fields.", fieldErrors: fieldErrorsOf(parsed.error) });
  }
  const input = parsed.data;

  // Honeypot filled → silently accept without storing anything.
  if (input.website) return json(201, { name: input.fullName, side: input.side });

  const normalizedMobile = normalizeIndianMobile(input.mobile)!;
  const app = await getAppSettings();

  const { data, error } = await supabase.rpc("register_participant", {
    p_full_name: input.fullName,
    p_mobile_number: input.mobile,
    p_normalized_mobile: normalizedMobile,
    p_email: input.email,
    p_normalized_email: normalizeEmail(input.email),
    p_gender: input.gender,
    p_address: input.address,
    p_side: input.side,
    p_consent: input.consent,
    p_consent_policy_version: app.consent_policy_version,
    p_request_id: input.requestId,
  });

  if (error) {
    console.error("registration failed", error.code);
    return json(500, { error: "We could not complete your registration right now. Please try again." });
  }

  const result = data as RpcResult;
  switch (result.status) {
    case "created":
      return json(201, { name: result.full_name, side: result.side });
    case "duplicate":
      return json(409, {
        error: "This mobile number or email address is already registered. Each guest can register only once.",
      });
    case "closed":
      return json(403, { error: "Registration is closed." });
    default:
      return json(422, { error: "Please check your details and try again." });
  }
}
