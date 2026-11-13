"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { Button, ButtonLink } from "@/components/buttons/Button";
import { FormMessage, TextInput } from "@/components/forms/Fields";
import { SIDE_LABEL } from "@/config/site";
import { normalizeIndianMobile } from "@/lib/validation/participant";
import type { Side } from "@/types/database";

type Result =
  | { status: "verified" | "already_verified"; name?: string; side?: Side }
  | { status: "error"; message: string; kind?: string };

export function VerifyForm({ enabled }: { enabled: boolean }) {
  const [mobile, setMobile] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const inFlight = useRef(false);
  const reduce = useReducedMotion();

  if (!enabled) {
    return (
      <div className="rounded-[var(--radius-surface)] border border-soft-border bg-card-surface p-8 text-center">
        <p className="font-serif text-[26px] text-dark-walnut">Verification currently unavailable</p>
        <p className="mt-3 text-support text-secondary-text">Verification opens at the venue on the wedding day. Please try again then.</p>
        <div className="mt-6">
          <ButtonLink href="/register" variant="primary">
            Not registered yet?
          </ButtonLink>
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;
    setResult(null);
    if (!normalizeIndianMobile(mobile)) {
      setFieldError("Enter a valid mobile number.");
      return;
    }
    setFieldError(null);
    inFlight.current = true;
    setSubmitting(true);
    try {
      const res = await fetch("/api/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = (await res.json().catch(() => ({}))) as { status?: string; name?: string; side?: Side; message?: string };
      if (data.status === "verified" || data.status === "already_verified") {
        setResult({ status: data.status, name: data.name, side: data.side });
      } else {
        setResult({ status: "error", kind: data.status, message: data.message ?? "Unable to verify right now." });
      }
    } catch {
      setResult({ status: "error", message: "Unable to verify right now. Check your connection and try again." });
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  if (result && result.status !== "error") {
    const first = result.status === "verified";
    return (
      <motion.div
        role="status"
        initial={reduce ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        className="rounded-[var(--radius-surface)] border border-soft-border bg-card-surface p-8 text-center sm:p-10"
      >
        <span className="mx-auto flex size-14 items-center justify-center rounded-full border border-muted-sage text-muted-sage">
          <Check className="size-6" strokeWidth={1.5} aria-hidden />
        </span>
        <h2 className="mt-6 text-h1 text-dark-walnut">{first ? "Successfully Verified!" : "Already verified"}</h2>
        <p className="mt-3 text-body text-secondary-text">
          {first
            ? "Your wedding activity registration has been confirmed."
            : "This registration was verified earlier — there is nothing more you need to do."}
        </p>
        {result.name ? (
          <p className="mt-6 font-serif text-[26px] text-dark-walnut">
            {result.name}
            {result.side ? <span className="mt-1 block text-meta text-secondary-text">{SIDE_LABEL[result.side]}</span> : null}
          </p>
        ) : null}
        <p className="mx-auto mt-6 max-w-[40ch] border-t border-soft-border pt-6 text-support text-secondary-text">
          You are eligible to participate in the wedding lucky draw, subject to the final draw rules.
        </p>
        <div className="mt-8">
          <ButtonLink href="/lucky-draw/winners" variant="primary">
            Lucky draw winners
          </ButtonLink>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="rounded-[var(--radius-surface)] border border-soft-border bg-card-surface p-6 sm:p-8">
      <TextInput
        label="Registered mobile number"
        name="mobile"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        required
        maxLength={20}
        placeholder="98765 43210"
        value={mobile}
        onChange={(e) => {
          setMobile(e.target.value);
          setFieldError(null);
        }}
        error={fieldError}
        className="[&_input]:h-14 [&_input]:text-[20px] [&_input]:tracking-[0.04em]"
      />
      {result?.status === "error" ? (
        <div className="mt-5">
          <FormMessage tone="error">
            {result.message}
            {result.kind === "not_found" ? (
              <>
                {" "}
                <a href="/register" className="underline underline-offset-2">
                  Register here
                </a>
                .
              </>
            ) : null}
          </FormMessage>
        </div>
      ) : null}
      <Button type="submit" variant="filled" size="lg" loading={submitting} className="mt-6 w-full">
        {submitting ? "Verifying…" : "Verify My Registration"}
      </Button>
      <p className="mt-4 text-center text-[13px] text-secondary-text">No password or code needed — just the number you registered with.</p>
    </form>
  );
}
