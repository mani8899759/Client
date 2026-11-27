import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/service";
import { getAdminContext } from "@/lib/auth/admin";
import { consumeRateLimit, logSecurityEvent } from "@/lib/security/rate-limit";
import { clientIp, hashIdentifier, isSameOrigin } from "@/lib/security/request";
import { normalizeIndianMobile } from "@/lib/validation/participant";
import {
  issueVerificationOtp,
  lookupRegistration,
  verifyOtp,
} from "@/services/verification";

export const dynamic = "force-dynamic";

function json(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return json(403, { status: "error", message: "Invalid request origin." });
  }

  const supabase = getServiceSupabase();
  if (!supabase) {
    return json(503, { status: "disabled", message: "Verification is currently unavailable." });
  }

  const ipHash = hashIdentifier(clientIp(request.headers));
  if (!(await consumeRateLimit(supabase, `verify:ip:${ipHash}`, 20, 600))) {
    await logSecurityEvent(supabase, "rate_limited", ipHash, { endpoint: "verification" });
    return json(429, { status: "rate_limited", message: "Too many attempts. Please wait a few minutes and try again." });
  }

  let body: { mobile?: string; otp?: string; action?: string };
  try {
    const text = await request.text();
    if (text.length > 1_000) return json(413, { status: "invalid", message: "Request too large." });
    body = JSON.parse(text);
  } catch {
    return json(400, { status: "invalid", message: "Enter a valid mobile number." });
  }

  const rawMobile = body.mobile?.trim() || "";
  const normalized = normalizeIndianMobile(rawMobile);
  if (!normalized) {
    return json(422, { status: "invalid", message: "Enter a valid 10-digit Indian mobile number." });
  }

  const mobileHash = hashIdentifier(normalized);
  if (!(await consumeRateLimit(supabase, `verify:mobile:${mobileHash}`, 10, 600))) {
    await logSecurityEvent(supabase, "rate_limited", ipHash, { endpoint: "verification", scope: "mobile" });
    return json(429, { status: "rate_limited", message: "Too many attempts for this number. Please wait a few minutes." });
  }

  // Look up registration in database
  const lookup = await lookupRegistration(supabase, normalized);

  if (lookup.status === "not_found") {
    await logSecurityEvent(supabase, "verification_not_found", ipHash, { mobile: normalized });
    return json(404, {
      status: "not_found",
      message: "We couldn't find a registration associated with this mobile number. Please check your number and try again.",
    });
  }

  if (lookup.status === "inactive") {
    return json(403, { status: "inactive", message: lookup.message });
  }

  if (lookup.status === "disabled" || lookup.status === "closed") {
    return json(503, { status: lookup.status, message: lookup.message });
  }

  // Case B: Already Verified
  if (lookup.status === "already_verified") {
    return json(200, {
      status: "already_verified",
      name: lookup.displayName,
      fullName: lookup.fullName,
      side: lookup.side,
      verifiedAt: lookup.verifiedAt,
      message: "Your registration has already been successfully verified.",
    });
  }

  if (lookup.status !== "pending") {
    return json(404, { status: "not_found", message: "Registration not found." });
  }

  // Case A / Pending:
  // Check if this request is performed by an authenticated wedding staff member
  const adminCtx = await getAdminContext().catch(() => null);

  if (adminCtx) {
    // Staff-assisted verification: direct one-action verification
    const { data: vData, error: vErr } = await supabase.rpc("verify_participant_with_method", {
      p_normalized_mobile: normalized,
      p_method: "staff_assisted",
      p_verified_by: adminCtx.userId,
      p_reason: `Verified at venue by staff: ${adminCtx.profile.full_name}`,
    });

    if (vErr || !vData) {
      return json(500, { status: "error", message: "Unable to complete verification right now." });
    }

    return json(200, {
      status: "verified",
      name: lookup.displayName,
      fullName: lookup.fullName,
      side: lookup.side,
      verifiedAt: new Date().toISOString(),
      method: "staff_assisted",
      staffName: adminCtx.profile.full_name,
      message: "Your registration has been successfully verified.",
    });
  }

  // Self-Service Visitor Flow with secure verification code:
  if (body.otp) {
    // Validate the submitted OTP
    const validation = await verifyOtp(supabase, normalized, body.otp);
    if (!validation.valid) {
      return json(400, { status: "error", message: validation.error || "Invalid verification code." });
    }

    // OTP is valid! Mark as verified with 'sms_otp' method
    const { data: vData, error: vErr } = await supabase.rpc("verify_participant_with_method", {
      p_normalized_mobile: normalized,
      p_method: "sms_otp",
      p_verified_by: null,
      p_reason: "Self-service mobile verification",
    });

    if (vErr || !vData) {
      return json(500, { status: "error", message: "Unable to complete verification right now." });
    }

    return json(200, {
      status: "verified",
      name: lookup.displayName,
      fullName: lookup.fullName,
      side: lookup.side,
      verifiedAt: new Date().toISOString(),
      method: "sms_otp",
      message: "Your registration has been successfully verified.",
    });
  }

  // No OTP supplied yet -> Issue OTP code
  const issueResult = await issueVerificationOtp(supabase, normalized, rawMobile);
  if (!issueResult.success) {
    return json(500, { status: "error", message: issueResult.error || "Unable to send verification code." });
  }

  const masked = normalized.slice(0, 3) + " " + normalized.slice(3, 8) + " " + normalized.slice(8);

  return json(200, {
    status: "otp_sent",
    name: lookup.displayName,
    side: lookup.side,
    maskedMobile: masked,
    demoCode: issueResult.demoCode,
    message: `A verification code has been generated for ${masked}. Enter the code below to complete verification.`,
  });
}
