"use client";

import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { ASelect, AText } from "@/components/admin/fields";
import { Badge } from "@/components/admin/ui";
import { GIFT_STATUS_LABEL, SIDE_LABEL } from "@/config/site";
import { updateWinner } from "./actions";
import type { LuckyDrawWinner } from "@/types/database";

export function WinnerRow({ winner: w, mobile }: { winner: LuckyDrawWinner; mobile: string }) {
  const tone = w.gift_status === "delivered" ? "success" : w.gift_status === "contacted" ? "warning" : "neutral";
  return (
    <li className="rounded-[var(--radius-control)] border border-soft-border bg-warm-ivory p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <span className="text-numeral text-[34px] leading-none text-champagne-gold">{String(w.winner_position).padStart(2, "0")}</span>
          <div>
            <p className="text-[16px] text-dark-walnut">{w.participant?.full_name}</p>
            <p className="text-[13px] text-secondary-text">
              {w.participant ? SIDE_LABEL[w.participant.side] : ""} ·{" "}
              <a href={`tel:${mobile}`} className="tabular-nums underline-offset-2 hover:underline">
                {mobile}
              </a>
            </p>
          </div>
        </div>
        <Badge tone={tone}>{GIFT_STATUS_LABEL[w.gift_status]}</Badge>
      </div>
      <ActionForm action={updateWinner} className="mt-4 grid gap-3 sm:grid-cols-[160px_1fr_1fr_auto] sm:items-end">
        <input type="hidden" name="id" value={w.id} />
        <ASelect
          name="gift_status"
          label="Gift status"
          defaultValue={w.gift_status}
          options={Object.entries(GIFT_STATUS_LABEL).map(([value, label]) => ({ value, label }))}
        />
        <AText name="public_display_name" label="Public display name" defaultValue={w.public_display_name} maxLength={80} />
        <AText name="gift_notes" label="Notes" defaultValue={w.gift_notes ?? ""} maxLength={500} optionalLabel />
        <SubmitButton variant="primary" className="h-12">
          Save
        </SubmitButton>
      </ActionForm>
    </li>
  );
}
