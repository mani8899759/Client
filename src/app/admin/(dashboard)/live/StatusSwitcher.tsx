"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/feedback/Toast";
import { setStreamStatus } from "./actions";
import { cn } from "@/lib/utils/cn";
import type { StreamStatus } from "@/types/database";

const OPTIONS: Array<{ value: StreamStatus; label: string }> = [
  { value: "upcoming", label: "Upcoming" },
  { value: "live", label: "Live" },
  { value: "ended", label: "Ended" },
];

export function StatusSwitcher({ id, status }: { id: string; status: StreamStatus }) {
  const [pending, start] = useTransition();
  const { notify } = useToast();
  const router = useRouter();
  return (
    <div role="radiogroup" aria-label="Stream status" className={cn("inline-flex rounded-[var(--radius-control)] border border-soft-border p-0.5", pending && "opacity-60")}>
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={status === o.value}
          disabled={pending}
          onClick={() => {
            if (o.value === status) return;
            const fd = new FormData();
            fd.set("id", id);
            fd.set("status", o.value);
            start(async () => {
              const r = await setStreamStatus(null, fd);
              if (r) notify(r.message, r.ok ? "success" : "error");
              router.refresh();
            });
          }}
          className={cn(
            "rounded-[4px] px-2.5 py-1 text-[12px]",
            status === o.value ? (o.value === "live" ? "bg-secondary text-soft-cream" : "bg-dark-walnut text-soft-cream") : "text-secondary-text hover:text-dark-walnut",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
