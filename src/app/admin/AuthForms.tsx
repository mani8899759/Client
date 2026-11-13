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

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function LoginForm({ notice }: { notice?: string | null }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signInAction, null);
  const [githubPending, setGithubPending] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  async function handleGithubSignIn() {
    setGithubError(null);
    setGithubPending(true);
    try {
      const { getBrowserSupabase } = await import("@/lib/supabase/browser");
      const supabase = getBrowserSupabase();
      const redirectUrl = `${window.location.origin}/admin/auth/callback?next=/admin`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) {
        setGithubError(error.message);
        setGithubPending(false);
      } else if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setGithubError(err instanceof Error ? err.message : "Failed to sign in with GitHub.");
      setGithubPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
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

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-soft-border" />
        </div>
        <div className="relative bg-card-surface px-3 text-[12px] uppercase tracking-wider text-secondary-text">
          or
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          disabled={githubPending}
          onClick={handleGithubSignIn}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-[var(--radius-control)] border border-soft-border bg-soft-cream/60 px-4 text-[14px] font-medium text-dark-walnut transition hover:bg-soft-cream hover:border-champagne-gold/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne-gold disabled:opacity-50"
        >
          <GithubIcon className="size-5 text-dark-walnut" />
          <span>{githubPending ? "Connecting to GitHub…" : "Continue with GitHub"}</span>
        </button>
        {githubError ? <FormMessage tone="error">{githubError}</FormMessage> : null}
      </div>
    </div>
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
