"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { Button, ButtonLink } from "@/components/buttons/Button";
import { Checkbox, FormMessage, TextArea, TextInput } from "@/components/forms/Fields";
import { SIDE_LABEL } from "@/config/site";
import { fieldErrorsOf, registrationSchema, type FieldErrors } from "@/lib/validation/participant";
import { cn } from "@/lib/utils/cn";
import type { Side } from "@/types/database";

type Values = {
  fullName: string;
  mobile: string;
  email: string;
  gender: "" | "male" | "female";
  address: string;
  side: "" | Side;
  consent: boolean;
  website: string;
};

const EMPTY: Values = { fullName: "", mobile: "", email: "", gender: "", address: "", side: "", consent: false, website: "" };

function newRequestId() {
  return crypto.randomUUID();
}

function SideOption({
  value,
  selected,
  onSelect,
  description,
}: {
  value: Side;
  selected: boolean;
  onSelect: (v: Side) => void;
  description: string;
}) {
  return (
    <label
      className={cn(
        "relative flex cursor-pointer flex-col rounded-[var(--radius-surface)] border p-5 transition-[border-color,background-color,box-shadow] duration-300 sm:p-6",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
        selected ? "border-dark-walnut bg-soft-cream shadow-[var(--shadow-soft)]" : "border-soft-border bg-card-surface hover:border-champagne-gold",
      )}
    >
      <input type="radio" name="side" value={value} checked={selected} onChange={() => onSelect(value)} className="sr-only" />
      <span className="flex items-start justify-between gap-3">
        <span className="font-serif text-[26px] leading-tight text-dark-walnut">{SIDE_LABEL[value]}</span>
        <span
          aria-hidden
          className={cn(
            "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
            selected ? "border-dark-walnut bg-dark-walnut text-soft-cream" : "border-muted-gold",
          )}
        >
          {selected ? <Check className="size-3" strokeWidth={2} /> : null}
        </span>
      </span>
      <span className="mt-2 text-[13px] text-secondary-text">{description}</span>
    </label>
  );
}

export function RegistrationForm({ consentText, coupleLabel }: { consentText: string; coupleLabel: string }) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ name: string; side: Side } | null>(null);
  const [requestId, setRequestId] = useState(newRequestId);
  const inFlight = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const reduce = useReducedMotion();

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const err = (k: keyof Values) => errors[k]?.[0] ?? null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current) return; // guards against double-clicks
    setFormError(null);

    const payload = { ...values, requestId, gender: values.gender || undefined, side: values.side || undefined };
    const parsed = registrationSchema.safeParse(payload);
    if (!parsed.success) {
      const fe = fieldErrorsOf(parsed.error);
      setErrors(fe);
      const first = Object.keys(fe).find((k) => fe[k]?.length);
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    inFlight.current = true;
    setSubmitting(true);
    try {
      let res: Response | null = null;
      // One automatic retry on network failure; the same requestId keeps it idempotent.
      for (let attempt = 0; attempt < 2 && !res; attempt += 1) {
        try {
          res = await fetch("/api/registration", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } catch {
          if (attempt === 1) throw new Error("network");
        }
      }
      const data = (await res!.json().catch(() => ({}))) as { name?: string; side?: Side; error?: string; fieldErrors?: FieldErrors };
      if (res!.ok && data.name && data.side) {
        setDone({ name: data.name, side: data.side });
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        return;
      }
      if (data.fieldErrors) setErrors(data.fieldErrors);
      setFormError(data.error ?? "We could not complete your registration. Please try again.");
    } catch {
      setFormError("You appear to be offline. Check your connection and try again — your details are still here.");
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
        className="rounded-[var(--radius-surface)] border border-soft-border bg-card-surface p-8 sm:p-12"
        role="status"
      >
        <span className="flex size-12 items-center justify-center rounded-full border border-muted-sage text-muted-sage">
          <Check className="size-5" strokeWidth={1.5} aria-hidden />
        </span>
        <h2 className="mt-8 text-h1 text-dark-walnut sm:text-[36px]">Welcome to the Celebration!</h2>
        <p className="mt-3 text-body text-secondary-text">
          Your registration for {coupleLabel}&apos;s wedding celebration has been successfully completed.
        </p>

        <dl className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-control)] border border-soft-border bg-soft-border sm:grid-cols-2">
          <div className="bg-soft-cream px-5 py-4">
            <dt className="text-meta text-secondary-text">Guest</dt>
            <dd className="mt-1 font-serif text-[24px] text-dark-walnut">{done.name}</dd>
          </div>
          <div className="bg-soft-cream px-5 py-4">
            <dt className="text-meta text-secondary-text">Side</dt>
            <dd className="mt-1 font-serif text-[24px] text-dark-walnut">{SIDE_LABEL[done.side]}</dd>
          </div>
        </dl>

        <div className="mt-8 border-l border-champagne-gold pl-5">
          <p className="text-meta text-muted-gold">Next step · at the wedding</p>
          <p className="mt-2 text-body text-dark-walnut">
            Scan the common event QR code displayed at the venue and enter the mobile number you registered with. Verification
            confirms your entry into the lucky draw.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/" variant="filled">
            Back to the wedding
          </ButtonLink>
          <Button
            variant="primary"
            onClick={() => {
              setValues(EMPTY);
              setErrors({});
              setRequestId(newRequestId());
              setDone(null);
            }}
          >
            Register another guest
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      noValidate
      className="rounded-[var(--radius-surface)] border border-soft-border bg-card-surface p-6 sm:p-10"
      aria-describedby={formError ? "registration-error" : undefined}
    >
      <fieldset>
        <legend className="text-meta text-muted-gold">I am a guest of the</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-invalid={err("side") ? true : undefined}>
          <SideOption value="bride" selected={values.side === "bride"} onSelect={(v) => set("side", v)} description="Family and friends of the bride" />
          <SideOption value="groom" selected={values.side === "groom"} onSelect={(v) => set("side", v)} description="Family and friends of the groom" />
        </div>
        {err("side") ? (
          <p role="alert" className="mt-2 text-[13px] text-secondary">
            {err("side")}
          </p>
        ) : (
          <p className="mt-2 text-[13px] text-secondary-text">Your side cannot be changed after registration.</p>
        )}
      </fieldset>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <TextInput
          label="Full name"
          name="fullName"
          autoComplete="name"
          required
          maxLength={120}
          value={values.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          error={err("fullName")}
          className="sm:col-span-2"
        />
        <TextInput
          label="Mobile number"
          name="mobile"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required
          maxLength={20}
          placeholder="98765 43210"
          value={values.mobile}
          onChange={(e) => set("mobile", e.target.value)}
          error={err("mobile")}
          hint="Use this number to verify at the venue."
        />
        <TextInput
          label="Email address"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={254}
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          error={err("email")}
        />

        <fieldset className="sm:col-span-2">
          <legend className="text-support text-dark-walnut">
            Gender<span className="text-secondary" aria-hidden> *</span>
          </legend>
          <div className="mt-2 flex gap-3" role="radiogroup">
            {(["female", "male"] as const).map((g) => (
              <label
                key={g}
                className={cn(
                  "flex h-12 flex-1 cursor-pointer items-center justify-center rounded-[var(--radius-control)] border text-[15px] transition-colors sm:flex-none sm:px-10",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
                  values.gender === g ? "border-dark-walnut bg-dark-walnut text-soft-cream" : "border-soft-border bg-card-surface text-dark-walnut hover:border-champagne-gold",
                )}
              >
                <input type="radio" name="gender" value={g} checked={values.gender === g} onChange={() => set("gender", g)} className="sr-only" />
                {g === "female" ? "Female" : "Male"}
              </label>
            ))}
          </div>
          {err("gender") ? (
            <p role="alert" className="mt-2 text-[13px] text-secondary">
              {err("gender")}
            </p>
          ) : null}
        </fieldset>

        <TextArea
          label="Address"
          name="address"
          autoComplete="street-address"
          required
          maxLength={500}
          rows={3}
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
          error={err("address")}
          className="sm:col-span-2"
        />

        {/* Honeypot — hidden from people and assistive technology. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" name="website" value={values.website} onChange={(e) => set("website", e.target.value)} />
          </label>
        </div>

        <Checkbox
          name="consent"
          checked={values.consent}
          onChange={(e) => set("consent", e.target.checked)}
          error={err("consent")}
          label={consentText}
          className="sm:col-span-2"
        />
      </div>

      {formError ? (
        <div id="registration-error" className="mt-8">
          <FormMessage tone="error">{formError}</FormMessage>
        </div>
      ) : null}

      <div className="mt-10 flex flex-col gap-4 border-t border-soft-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-secondary-text">Your details are private and never shown publicly.</p>
        <Button type="submit" variant="filled" size="lg" loading={submitting} className="w-full sm:w-auto">
          {submitting ? "Registering…" : "Complete registration"}
        </Button>
      </div>
    </form>
  );
}
