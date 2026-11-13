"use client";

import { createContext, useActionState, useContext, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/buttons/Button";
import { ConfirmationDialog } from "@/components/feedback/ConfirmationDialog";
import { TextArea } from "@/components/forms/Fields";
import { useToast } from "@/components/feedback/Toast";
import type { ActionState } from "@/lib/admin/actions";

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

const ErrorsContext = createContext<Record<string, string[] | undefined>>({});
const PendingContext = createContext(false);

/** First validation error for a field inside an <ActionForm>. */
export function useFieldError(name: string): string | null {
  return useContext(ErrorsContext)[name]?.[0] ?? null;
}

/**
 * Form bound to a Server Action. Shows a toast with the result, exposes
 * field errors to nested inputs, and optionally resets after success.
 */
export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
  onSuccess,
}: {
  action: Action;
  children: React.ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
  onSuccess?: (state: NonNullable<ActionState>) => void;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  const [, startTransition] = useTransition();
  const { notify } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const lastTs = useRef<number | null>(null);

  useEffect(() => {
    if (!state || state.ts === lastTs.current) return;
    lastTs.current = state.ts;
    notify(state.message, state.ok ? "success" : "error");
    if (state.ok) {
      if (resetOnSuccess) formRef.current?.reset();
      onSuccess?.(state);
    }
  }, [state, notify, resetOnSuccess, onSuccess]);

  return (
    <ErrorsContext.Provider value={state?.ok === false ? (state.fieldErrors ?? {}) : {}}>
      <PendingContext.Provider value={pending}>
        {/* Submitted manually (not via the `action` prop) so React does not
            reset the inputs when validation fails. */}
        <form
          ref={formRef}
          className={className}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (pending) return;
            const fd = new FormData(e.currentTarget);
            startTransition(() => formAction(fd));
          }}
        >
          {children}
        </form>
      </PendingContext.Provider>
    </ErrorsContext.Provider>
  );
}

export function SubmitButton({
  children,
  variant = "filled",
  size = "md",
  className,
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const pending = useContext(PendingContext);
  return (
    <Button type="submit" variant={variant} size={size} loading={pending} className={className}>
      {children}
    </Button>
  );
}

/**
 * A button that asks for confirmation (and optionally a reason) before
 * invoking a Server Action with the given hidden fields.
 */
export function ConfirmActionButton({
  action,
  fields,
  label,
  title,
  description,
  confirmLabel,
  tone = "default",
  variant = "primary",
  size = "sm",
  requireReason = false,
  reasonLabel = "Reason",
  disabled = false,
  className,
  children,
}: {
  action: Action;
  fields: Record<string, string>;
  label: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  tone?: "default" | "danger";
  variant?: ButtonVariant;
  size?: ButtonSize;
  requireReason?: boolean;
  reasonLabel?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();
  const { notify } = useToast();
  const router = useRouter();

  const confirm = () => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);
    if (requireReason) fd.set("reason", reason);
    startTransition(async () => {
      const result = await action(null, fd);
      if (result) notify(result.message, result.ok ? "success" : "error");
      if (result?.ok) {
        setOpen(false);
        setReason("");
        router.refresh();
      }
    });
  };

  return (
    <>
      <Button type="button" variant={variant} size={size} onClick={() => setOpen(true)} disabled={disabled} className={className}>
        {label}
      </Button>
      <ConfirmationDialog
        open={open}
        title={title}
        description={description}
        confirmLabel={confirmLabel ?? (typeof label === "string" ? label : "Confirm")}
        tone={tone}
        loading={pending}
        confirmDisabled={requireReason && reason.trim().length < 5}
        onConfirm={confirm}
        onCancel={() => setOpen(false)}
      >
        {children}
        {requireReason ? (
          <TextArea
            label={reasonLabel}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            required
            hint="At least 5 characters. Stored in the audit log."
          />
        ) : null}
      </ConfirmationDialog>
    </>
  );
}
