"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/buttons/Button";
import { FormMessage, TextInput, controlClasses } from "@/components/forms/Fields";
import { requestPasswordReset, signInAction, updatePasswordAction, type AuthState } from "./auth-actions";

function PasswordField({
  name,
  label,
  autoComplete,
  error,
  hint,
}: {
  name: string;
  label: string;
  autoComplete: string;
  error?: string;
  hint?: string;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-support text-dark-walnut">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={controlClasses("h-12 pr-12")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          className="absolute top-1/2 right-1 flex size-11 -translate-y-1/2 items-center justify-center rounded-[var(--radius-control)] text-secondary-text hover:text-dark-walnut"
        >
          {visible ? <EyeOff className="size-4" strokeWidth={1.5} aria-hidden /> : <Eye className="size-4" strokeWidth={1.5} aria-hidden />}
          <span className="sr-only">{visible ? "Hide password" : "Show password"}</span>
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[13px] text-secondary">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-secondary-text">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function LoginForm({ notice }: { notice?: string | null }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signInAction, null);

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      {notice && !state ? <FormMessage tone="success">{notice}</FormMessage> : null}
      <TextInput
        label="Email address"
        name="email"
        type="email"
        autoComplete="username"
        inputMode="email"
        required
        defaultValue={state?.email ?? ""}
        error={state?.fieldErrors?.email}
      />
      <PasswordField name="password" label="Password" autoComplete="current-password" error={state?.fieldErrors?.password} />
      <div className="-mt-2 flex justify-end">
        <Link href="/admin/forgot-password" className="text-[13px] text-secondary-text underline decoration-champagne-gold underline-offset-4 hover:text-dark-walnut">
          Forgot password?
        </Link>
      </div>
      {state && !state.ok && !state.fieldErrors ? <FormMessage tone="error">{state.message}</FormMessage> : null}
      <Button type="submit" variant="gold" size="lg" loading={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

export function ForgotPasswordForm({ expired }: { expired?: boolean }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, null);
  if (state?.ok) {
    return (
      <div className="flex flex-col gap-6">
        <FormMessage tone="success">{state.message}</FormMessage>
        <Link href="/admin/login" className="text-center text-[14px] text-dark-walnut underline decoration-champagne-gold underline-offset-4">
          Return to sign in
        </Link>
      </div>
    );
  }
  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      {expired ? <FormMessage tone="error">That reset link has expired or was already used. Request a new one below.</FormMessage> : null}
      <TextInput label="Administrator email" name="email" type="email" autoComplete="username" required error={state?.fieldErrors?.email} />
      {state && !state.ok && !state.fieldErrors ? <FormMessage tone="error">{state.message}</FormMessage> : null}
      <Button type="submit" variant="gold" size="lg" loading={pending} className="w-full">
        Send reset link
      </Button>
      <Link href="/admin/login" className="text-center text-[13px] text-secondary-text underline decoration-champagne-gold underline-offset-4 hover:text-dark-walnut">
        Back to sign in
      </Link>
    </form>
  );
}

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePasswordAction, null);
  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <PasswordField
        name="password"
        label="New password"
        autoComplete="new-password"
        error={state?.fieldErrors?.password}
        hint="At least 10 characters, with a letter and a number."
      />
      <PasswordField name="confirm" label="Confirm new password" autoComplete="new-password" error={state?.fieldErrors?.confirm} />
      {state && !state.ok && !state.fieldErrors ? <FormMessage tone="error">{state.message}</FormMessage> : null}
      <Button type="submit" variant="gold" size="lg" loading={pending} className="w-full">
        Update password
      </Button>
    </form>
  );
}
