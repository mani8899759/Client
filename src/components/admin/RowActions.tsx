"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/feedback/Toast";
import type { ActionState } from "@/lib/admin/actions";
import { cn } from "@/lib/utils/cn";

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

function useRun() {
  const [pending, start] = useTransition();
  const { notify } = useToast();
  const router = useRouter();
  const run = (action: Action, fields: Record<string, string>, quiet = false) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);
    start(async () => {
      const r = await action(null, fd);
      if (r && (!r.ok || !quiet)) notify(r.message, r.ok ? "success" : "error");
      router.refresh();
    });
  };
  return { pending, run };
}

const iconBtn =
  "flex size-8 items-center justify-center rounded-[var(--radius-control)] text-secondary-text transition-colors hover:bg-soft-cream hover:text-dark-walnut disabled:opacity-30";

export function MoveButtons({ action, id, isFirst, isLast }: { action: Action; id: string; isFirst: boolean; isLast: boolean }) {
  const { pending, run } = useRun();
  return (
    <span className="inline-flex">
      <button type="button" className={iconBtn} disabled={isFirst || pending} onClick={() => run(action, { id, direction: "up" }, true)}>
        <ArrowUp className="size-4" strokeWidth={1.5} aria-hidden />
        <span className="sr-only">Move up</span>
      </button>
      <button type="button" className={iconBtn} disabled={isLast || pending} onClick={() => run(action, { id, direction: "down" }, true)}>
        <ArrowDown className="size-4" strokeWidth={1.5} aria-hidden />
        <span className="sr-only">Move down</span>
      </button>
    </span>
  );
}

export function PublishToggle({ action, id, published }: { action: Action; id: string; published: boolean }) {
  const { pending, run } = useRun();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => run(action, { id, published: String(!published) })}
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px] transition-colors disabled:opacity-50",
        published ? "border-muted-sage/50 bg-muted-sage/10 text-[#5b634d]" : "border-soft-border bg-soft-cream text-secondary-text",
      )}
      aria-pressed={published}
      title={published ? "Published — click to unpublish" : "Draft — click to publish"}
    >
      {published ? <Eye className="size-3.5" strokeWidth={1.5} aria-hidden /> : <EyeOff className="size-3.5" strokeWidth={1.5} aria-hidden />}
      {published ? "Published" : "Draft"}
    </button>
  );
}
