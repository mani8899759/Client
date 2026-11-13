"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/feedback/Toast";
import { ConfirmationDialog } from "@/components/feedback/ConfirmationDialog";
import { setAppToggle } from "@/app/admin/(dashboard)/settings/actions";
import { cn } from "@/lib/utils/cn";

/** Accessible switch bound to an app_settings flag, with a confirmation step. */
export function ToggleSetting({
  settingKey,
  value,
  label,
  description,
  onLabel = "On",
  offLabel = "Off",
  confirmOn,
  confirmOff,
}: {
  settingKey: "registration_open" | "verification_enabled" | "winners_public" | "live_section_visible";
  value: boolean;
  label: string;
  description?: string;
  onLabel?: string;
  offLabel?: string;
  confirmOn?: string;
  confirmOff?: string;
}) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const { notify } = useToast();
  const router = useRouter();
  const next = !value;
  const message = next ? confirmOn : confirmOff;

  const apply = () => {
    const fd = new FormData();
    fd.set("key", settingKey);
    fd.set("value", String(next));
    start(async () => {
      const r = await setAppToggle(null, fd);
      if (r) notify(r.message, r.ok ? "success" : "error");
      setConfirming(false);
      router.refresh();
    });
  };

  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <div className="min-w-0">
        <p className="text-[15px] text-dark-walnut" id={`${settingKey}-label`}>
          {label}
        </p>
        {description ? <p className="mt-1 text-[13px] text-secondary-text">{description}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className={cn("text-[13px]", value ? "text-[#5b634d]" : "text-secondary-text")}>{value ? onLabel : offLabel}</span>
        <button
          type="button"
          role="switch"
          aria-checked={value}
          aria-labelledby={`${settingKey}-label`}
          disabled={pending}
          onClick={() => (message ? setConfirming(true) : apply())}
          className={cn(
            "relative h-7 w-12 rounded-full border transition-colors duration-300 disabled:opacity-50",
            value ? "border-dark-walnut bg-dark-walnut" : "border-soft-border bg-soft-border/60",
          )}
        >
          <span
            className={cn(
              "absolute top-[3px] left-[3px] size-5 rounded-full bg-card-surface shadow-sm transition-transform duration-300",
              value && "translate-x-5",
            )}
          />
        </button>
      </div>
      <ConfirmationDialog
        open={confirming}
        title={`${label}: ${next ? onLabel : offLabel}?`}
        description={message}
        confirmLabel={next ? onLabel : offLabel}
        loading={pending}
        onConfirm={apply}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
