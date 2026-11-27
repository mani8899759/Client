"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertCircle, ArrowLeft, Check, KeyRound, Loader2, Phone, RotateCcw, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";
import { ButtonLink } from "@/components/buttons/Button";
import { SIDE_LABEL } from "@/config/site";
import { normalizeIndianMobile } from "@/lib/validation/participant";
import type { Side } from "@/types/database";

type Step = "input" | "otp" | "success" | "already_verified" | "not_found";

type VerifyResult = {
  name?: string;
  fullName?: string;
  side?: Side;
  verifiedAt?: string;
  maskedMobile?: string;
  demoCode?: string;
  method?: string;
  staffName?: string;
};

export function VerifyForm({
  enabled,
  staffUser,
}: {
  enabled: boolean;
  staffUser?: { name: string; role: string } | null;
}) {
  const [step, setStep] = useState<Step>("input");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult>({});
  const inFlight = useRef(false);
  const reduce = useReducedMotion();

  if (!enabled) {
    return (
      <div className="rounded-[var(--radius-surface)] border border-soft-border bg-card-surface p-8 text-center shadow-xs">
        <p className="font-serif text-[24px] text-dark-walnut">Verification Currently Unavailable</p>
        <p className="mt-3 text-support text-secondary-text">
          Verification opens at the venue on the wedding day. Please try again then.
        </p>
        <div className="mt-6">
          <ButtonLink href="/register" variant="primary">
            Register for Wedding
          </ButtonLink>
        </div>
      </div>
    );
  }

  async function handleInitialVerify(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;
    setErrorMessage(null);

    const normalized = normalizeIndianMobile(mobile);
    if (!normalized) {
      setErrorMessage("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    inFlight.current = true;
    setLoading(true);

    try {
      const res = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 404 || data.status === "not_found") {
        setStep("not_found");
        return;
      }

      if (data.status === "already_verified") {
        setResult({
          name: data.name,
          fullName: data.fullName,
          side: data.side,
          verifiedAt: data.verifiedAt,
        });
        setStep("already_verified");
        return;
      }

      if (data.status === "verified") {
        // Staff-assisted instant verification
        setResult({
          name: data.name,
          fullName: data.fullName,
          side: data.side,
          verifiedAt: data.verifiedAt,
          method: data.method,
          staffName: data.staffName,
        });
        setStep("success");
        return;
      }

      if (data.status === "otp_sent") {
        setResult({
          name: data.name,
          side: data.side,
          maskedMobile: data.maskedMobile,
          demoCode: data.demoCode,
        });
        setStep("otp");
        if (data.demoCode) {
          setOtp(data.demoCode);
        }
        return;
      }

      setErrorMessage(data.message || "Unable to verify registration right now. Please check your number.");
    } catch {
      setErrorMessage("Network error. Please check your internet connection and try again.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;
    setErrorMessage(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length < 4) {
      setErrorMessage("Enter the 6-digit verification code.");
      return;
    }

    inFlight.current = true;
    setLoading(true);

    try {
      const res = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp: cleanOtp }),
      });

      const data = await res.json().catch(() => ({}));

      if (data.status === "verified" || data.status === "already_verified") {
        setResult({
          name: data.name,
          fullName: data.fullName,
          side: data.side,
          verifiedAt: data.verifiedAt,
        });
        setStep("success");
      } else {
        setErrorMessage(data.message || "Incorrect verification code. Please check and try again.");
      }
    } catch {
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }

  function handleReset() {
    setStep("input");
    setErrorMessage(null);
    setOtp("");
  }

  // Outcome A: Successfully Verified
  if (step === "success") {
    return (
      <motion.div
        role="status"
        aria-live="polite"
        initial={reduce ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-[var(--radius-surface)] border border-muted-sage/60 bg-card-surface p-8 text-center sm:p-10 shadow-xs"
      >
        <span className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-muted-sage bg-muted-sage/10 text-muted-sage">
          <Check className="size-8" strokeWidth={2.5} aria-hidden />
        </span>
        <h2 className="mt-5 text-h1 text-dark-walnut sm:text-[34px]">Successfully Verified!</h2>
        <p className="mt-3 text-body text-secondary-text">
          Your registration has been successfully verified.
        </p>

        {result.name || result.fullName ? (
          <div className="mt-6 rounded-[var(--radius-control)] border border-soft-border bg-soft-cream/60 py-4 px-5 inline-block min-w-[240px]">
            <p className="font-serif text-[24px] text-dark-walnut">{result.fullName || result.name}</p>
            {result.side ? (
              <span className="mt-1 inline-block rounded-full border border-champagne-gold/60 bg-champagne-gold/10 px-3 py-0.5 text-[12px] font-medium text-dark-walnut">
                {SIDE_LABEL[result.side]}
              </span>
            ) : null}
          </div>
        ) : null}

        {result.staffName ? (
          <p className="mt-4 text-[13px] text-secondary-text flex items-center justify-center gap-1.5">
            <UserCheck className="size-4 text-muted-sage" />
            Verified at venue by staff: {result.staffName}
          </p>
        ) : null}

        <p className="mx-auto mt-6 max-w-[42ch] border-t border-soft-border pt-6 text-support text-secondary-text">
          You are officially verified for the wedding celebrations and lucky draw.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/lucky-draw/winners" variant="filled">
            View Lucky Draw
          </ButtonLink>
          <ButtonLink href="/" variant="primary">
            Wedding Homepage
          </ButtonLink>
        </div>
      </motion.div>
    );
  }

  // Outcome B: Already Verified
  if (step === "already_verified") {
    return (
      <motion.div
        role="status"
        aria-live="polite"
        initial={reduce ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="rounded-[var(--radius-surface)] border border-champagne-gold/60 bg-card-surface p-8 text-center sm:p-10 shadow-xs"
      >
        <span className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-champagne-gold bg-champagne-gold/10 text-primary">
          <Check className="size-8" strokeWidth={2.5} aria-hidden />
        </span>
        <h2 className="mt-5 text-h1 text-dark-walnut sm:text-[34px]">Already Verified!</h2>
        <p className="mt-3 text-body text-secondary-text">
          Your registration has already been successfully verified.
        </p>

        {result.name || result.fullName ? (
          <div className="mt-6 rounded-[var(--radius-control)] border border-soft-border bg-soft-cream/60 py-4 px-5 inline-block min-w-[240px]">
            <p className="font-serif text-[24px] text-dark-walnut">{result.fullName || result.name}</p>
            {result.side ? (
              <span className="mt-1 inline-block rounded-full border border-champagne-gold/60 bg-champagne-gold/10 px-3 py-0.5 text-[12px] font-medium text-dark-walnut">
                {SIDE_LABEL[result.side]}
              </span>
            ) : null}
          </div>
        ) : null}

        <p className="mx-auto mt-6 max-w-[42ch] border-t border-soft-border pt-6 text-support text-secondary-text">
          This registration was confirmed earlier. There is nothing more you need to do.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-soft-border bg-warm-ivory/80 px-5 text-[14px] font-medium text-dark-walnut transition-colors hover:bg-soft-cream"
          >
            <RotateCcw className="size-4" /> Verify Another Number
          </button>
          <ButtonLink href="/" variant="primary">
            Wedding Homepage
          </ButtonLink>
        </div>
      </motion.div>
    );
  }

  // Outcome C: Registration Not Found
  if (step === "not_found") {
    return (
      <motion.div
        role="alert"
        initial={reduce ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-[var(--radius-surface)] border border-secondary/40 bg-card-surface p-8 text-center sm:p-10 shadow-xs"
      >
        <span className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-secondary/60 bg-secondary/10 text-secondary">
          <AlertCircle className="size-8" strokeWidth={2} aria-hidden />
        </span>
        <h2 className="mt-5 text-h1 text-dark-walnut sm:text-[32px]">Registration Not Found</h2>
        <p className="mt-3 text-body text-secondary-text max-w-[46ch] mx-auto">
          We couldn&apos;t find a registration associated with this mobile number. Please check your number and try again.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-dark-walnut bg-dark-walnut px-6 text-[15px] font-medium text-soft-cream transition-colors hover:bg-dark-walnut/90 cursor-pointer"
          >
            <RotateCcw className="size-4" /> Check Number &amp; Retry
          </button>
          <ButtonLink href="/register" variant="primary">
            New Guest Registration
          </ButtonLink>
        </div>
      </motion.div>
    );
  }

  // Step 2: OTP Verification Form (Self-Service)
  if (step === "otp") {
    return (
      <form
        onSubmit={handleOtpSubmit}
        noValidate
        className="rounded-[var(--radius-surface)] border border-soft-border bg-card-surface p-6 sm:p-8 shadow-xs"
      >
        <div className="flex items-center justify-between pb-4 border-b border-soft-border mb-6">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-[13px] text-secondary-text hover:text-dark-walnut transition-colors"
          >
            <ArrowLeft className="size-4" /> Change Number
          </button>
          <span className="text-meta text-muted-gold">Step 2 of 2</span>
        </div>

        <div>
          <label htmlFor="otp-input" className="block text-[15px] font-medium text-dark-walnut">
            Enter 6-digit Verification Code
          </label>
          <p className="mt-1 text-[13px] text-secondary-text">
            Code sent for mobile: <strong className="text-dark-walnut">{result.maskedMobile || mobile}</strong>
          </p>

          <div className="mt-4 relative">
            <KeyRound className="size-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-gold" />
            <input
              id="otp-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ""));
                setErrorMessage(null);
              }}
              placeholder="123456"
              className="h-14 w-full rounded-[var(--radius-control)] border border-soft-border bg-card-surface pl-12 pr-4 text-[24px] font-mono tracking-[0.25em] text-center text-dark-walnut focus:border-primary focus:outline-none"
              required
              autoFocus
            />
          </div>
        </div>

        {result.demoCode ? (
          <div className="mt-4 rounded-[var(--radius-control)] border border-champagne-gold/60 bg-champagne-gold/10 p-3 text-[13px] text-dark-walnut">
            <strong>Verification Code:</strong> <span className="font-mono font-bold tracking-wider">{result.demoCode}</span>
            <span className="block text-secondary-text text-[12px] mt-0.5">(Pre-filled for authorized event verification)</span>
          </div>
        ) : null}

        {errorMessage ? (
          <p className="mt-4 text-[13px] text-secondary bg-secondary/10 border border-secondary/30 rounded-[var(--radius-control)] p-3" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || otp.length < 4}
          className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-dark-walnut bg-dark-walnut px-6 text-[16px] font-medium text-soft-cream transition-colors hover:bg-dark-walnut/90 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="size-5 animate-spin" /> Verifying Code…
            </>
          ) : (
            "Confirm Verification"
          )}
        </button>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleInitialVerify}
            disabled={loading}
            className="text-[13px] text-secondary-text hover:text-dark-walnut underline underline-offset-4"
          >
            Resend Verification Code
          </button>
        </div>
      </form>
    );
  }

  // Step 1: Initial Mobile Number Entry Form
  return (
    <form
      onSubmit={handleInitialVerify}
      noValidate
      className="rounded-[var(--radius-surface)] border border-soft-border bg-card-surface p-6 sm:p-8 shadow-xs"
    >
      {staffUser ? (
        <div className="mb-6 flex items-center justify-between rounded-[var(--radius-control)] border border-muted-sage/60 bg-muted-sage/10 px-4 py-2.5 text-[13px] text-dark-walnut">
          <span className="inline-flex items-center gap-2 font-medium">
            <ShieldCheck className="size-4 text-muted-sage" /> Staff Verification Mode Active
          </span>
          <span className="text-secondary-text truncate max-w-[150px]">{staffUser.name}</span>
        </div>
      ) : null}

      <div>
        <label htmlFor="reg-mobile-input" className="block text-[15px] font-medium text-dark-walnut">
          Registered Mobile Number
        </label>
        <p className="mt-1 text-[13px] text-secondary-text">
          Enter the 10-digit mobile number you used while registering.
        </p>

        <div className="mt-3 relative">
          <Phone className="size-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-gold" />
          <input
            id="reg-mobile-input"
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={16}
            placeholder="98765 43210"
            value={mobile}
            onChange={(e) => {
              setMobile(e.target.value);
              setErrorMessage(null);
            }}
            required
            className="h-14 w-full rounded-[var(--radius-control)] border border-soft-border bg-card-surface pl-12 pr-4 text-[20px] tracking-[0.04em] text-dark-walnut focus:border-primary focus:outline-none"
            autoFocus
          />
        </div>
      </div>

      {errorMessage ? (
        <p className="mt-4 text-[13px] text-secondary bg-secondary/10 border border-secondary/30 rounded-[var(--radius-control)] p-3" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading || mobile.trim().length < 8}
        className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-dark-walnut bg-dark-walnut px-6 text-[16px] font-medium text-soft-cream transition-colors hover:bg-dark-walnut/90 disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="size-5 animate-spin" /> Verifying Registration…
          </>
        ) : staffUser ? (
          "Verify Registration (Staff)"
        ) : (
          "Verify"
        )}
      </button>

      <p className="mt-4 text-center text-[13px] text-secondary-text">
        {staffUser
          ? "Authorized staff verification records the verification timestamp and staff ID directly."
          : "Scan the wedding QR code and enter your registered phone number."}
      </p>

      {!staffUser ? (
        <div className="mt-6 border-t border-soft-border pt-4 text-center">
          <Link
            href="/admin/login?next=/verify"
            className="text-[12px] text-secondary-text hover:text-dark-walnut underline underline-offset-4"
          >
            Wedding Staff Sign In
          </Link>
        </div>
      ) : null}
    </form>
  );
}
