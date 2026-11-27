import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeIndianMobile } from "@/lib/validation/participant";

export type LookupResult =
  | {
      status: "verified" | "already_verified" | "pending";
      participantId: string;
      fullName: string;
      displayName: string;
      side?: "bride" | "groom";
      mobileNumber: string;
      normalizedMobile: string;
      registeredAt: string;
      verifiedAt: string | null;
      verificationMethod: string | null;
    }
  | {
      status: "not_found" | "inactive" | "disabled" | "closed" | "invalid";
      message: string;
    };

export async function lookupRegistration(
  supabase: SupabaseClient,
  rawMobile: string,
): Promise<LookupResult> {
  const normalized = normalizeIndianMobile(rawMobile);
  const lookupInput = normalized || rawMobile.trim();

  const { data, error } = await supabase.rpc("lookup_registration_for_verification", {
    p_mobile: lookupInput,
  });

  if (error || !data) {
    return {
      status: "not_found",
      message: "We couldn't find a registration associated with this mobile number. Please check your number and try again.",
    };
  }

  const d = data as Record<string, unknown>;
  const status = d.status as string;

  if (status === "verified" || status === "already_verified") {
    return {
      status: "already_verified",
      participantId: d.participant_id as string,
      fullName: (d.full_name as string) || (d.display_name as string),
      displayName: (d.display_name as string) || (d.full_name as string),
      side: d.side as "bride" | "groom" | undefined,
      mobileNumber: d.mobile_number as string,
      normalizedMobile: d.normalized_mobile as string,
      registeredAt: d.registered_at as string,
      verifiedAt: (d.verified_at as string) || null,
      verificationMethod: (d.verification_method as string) || null,
    };
  }

  if (status === "pending") {
    return {
      status: "pending",
      participantId: d.participant_id as string,
      fullName: (d.full_name as string) || (d.display_name as string),
      displayName: (d.display_name as string) || (d.full_name as string),
      side: d.side as "bride" | "groom" | undefined,
      mobileNumber: d.mobile_number as string,
      normalizedMobile: d.normalized_mobile as string,
      registeredAt: d.registered_at as string,
      verifiedAt: null,
      verificationMethod: null,
    };
  }

  return {
    status: (["not_found", "inactive", "disabled", "closed", "invalid"].includes(status)
      ? status
      : "not_found") as "not_found" | "inactive" | "disabled" | "closed" | "invalid",
    message: (d.message as string) || "We couldn't find a registration associated with this mobile number. Please check your number and try again.",
  };
}

export async function issueVerificationOtp(
  supabase: SupabaseClient,
  normalizedMobile: string,
  rawMobile: string,
): Promise<{ success: boolean; code: string; demoCode?: string; error?: string }> {
  // Generate random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  // Delete older expired OTPs for this number
  await supabase.from("verification_otps").delete().eq("normalized_mobile", normalizedMobile);

  const { error } = await supabase.from("verification_otps").insert({
    mobile: rawMobile,
    normalized_mobile: normalizedMobile,
    otp_code: code,
    expires_at: expiresAt,
    attempts: 0,
  });

  if (error) {
    console.error("[OTP Issue Error]", error.message);
    return { success: false, code: "", error: "Unable to generate verification code. Please try again." };
  }

  // Check if an SMS provider is configured
  const hasTwilio = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
  const hasMsg91 = !!process.env.MSG91_AUTH_KEY;

  if (hasTwilio) {
    try {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
      await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: normalizedMobile,
            From: process.env.TWILIO_PHONE_NUMBER!,
            Body: `Your Manikanta & Sravika wedding verification code is: ${code}. Valid for 5 minutes.`,
          }).toString(),
        },
      );
    } catch (e) {
      console.error("[Twilio Dispatch Failed]", e);
    }
  } else if (hasMsg91) {
    try {
      await fetch("https://control.msg91.com/api/v5/otp", {
        method: "POST",
        headers: {
          authkey: process.env.MSG91_AUTH_KEY!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_id: process.env.MSG91_TEMPLATE_ID,
          mobile: normalizedMobile.replace(/^\+/, ""),
          otp: code,
        }),
      });
    } catch (e) {
      console.error("[MSG91 Dispatch Failed]", e);
    }
  }

  // Provide demoCode when external SMS gateway is not configured so verification is testable
  const demoCode = !hasTwilio && !hasMsg91 ? code : undefined;

  return { success: true, code, demoCode };
}

export async function verifyOtp(
  supabase: SupabaseClient,
  normalizedMobile: string,
  userOtp: string,
): Promise<{ valid: boolean; error?: string }> {
  const { data: rows, error } = await supabase
    .from("verification_otps")
    .select("*")
    .eq("normalized_mobile", normalizedMobile)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !rows || rows.length === 0) {
    return { valid: false, error: "Verification code has expired or is invalid. Please request a new code." };
  }

  const record = rows[0];
  if (record.attempts >= 5) {
    return { valid: false, error: "Too many incorrect attempts. Please request a new verification code." };
  }

  if (record.otp_code !== userOtp.trim()) {
    await supabase
      .from("verification_otps")
      .update({ attempts: record.attempts + 1 })
      .eq("id", record.id);

    const remaining = 4 - record.attempts;
    return {
      valid: false,
      error: `Incorrect verification code. ${remaining > 0 ? `${remaining} attempts remaining.` : "Please request a new code."}`,
    };
  }

  // OTP is valid! Clean up
  await supabase.from("verification_otps").delete().eq("id", record.id);
  return { valid: true };
}
