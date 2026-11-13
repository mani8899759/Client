"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/buttons/Button";

/**
 * Accessible confirmation dialog built on the native <dialog> element
 * (focus trapping, Escape to close and inert background come for free).
 */
export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  loading = false,
  onConfirm,
  onCancel,
  children,
  confirmDisabled = false,
}: {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
  confirmDisabled?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        if (!loading) onCancel();
      }}
      aria-labelledby="confirm-title"
      className="m-auto w-[calc(100%-32px)] max-w-[480px] rounded-[var(--radius-surface)] border border-soft-border bg-card-surface p-0 text-dark-walnut shadow-[var(--shadow-lift)] backdrop:bg-dark-walnut/40 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-6 sm:p-8">
        <h2 id="confirm-title" className="text-h2">
          {title}
        </h2>
        {description ? <div className="mt-3 text-support text-secondary-text">{description}</div> : null}
        {children ? <div className="mt-5">{children}</div> : null}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="primary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone === "danger" ? "danger" : "filled"}
            onClick={onConfirm}
            loading={loading}
            disabled={confirmDisabled}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
