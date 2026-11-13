"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { ASelect, AText } from "@/components/admin/fields";
import { Button } from "@/components/buttons/Button";
import { Checkbox } from "@/components/forms/Fields";
import { ConfirmationDialog } from "@/components/feedback/ConfirmationDialog";
import { useToast } from "@/components/feedback/Toast";
import { executeDraw, saveDrawConfig } from "./actions";
import type { EligibilityRule, LuckyDrawConfig, WeddingEvent } from "@/types/database";

export function DrawConfigForm({
  config,
  events,
  isOwner,
}: {
  config: LuckyDrawConfig;
  events: Pick<WeddingEvent, "id" | "name">[];
  isOwner: boolean;
}) {
  return (
    <ActionForm action={saveDrawConfig}>
      <div className="grid gap-5 sm:grid-cols-3">
        <AText name="winner_count" label="Number of winners (total)" type="number" min={1} max={500} defaultValue={String(config.winner_count)} required hint="Across both sides combined." />
        {isOwner ? (
          <ASelect
            name="eligibility_rule"
            label="Eligible pool"
            defaultValue={config.eligibility_rule}
            options={[
              { value: "verified_only", label: "Verified participants only (default)" },
              { value: "all_registered", label: "All registered participants" },
            ]}
            hint="Changing this is owner-only and audited."
          />
        ) : (
          <>
            <input type="hidden" name="eligibility_rule" value={config.eligibility_rule} />
            <AText
              name="rule_display"
              label="Eligible pool"
              value={config.eligibility_rule === "verified_only" ? "Verified participants only" : "All registered participants"}
              readOnly
              disabled
              hint="Only an owner can change this."
            />
          </>
        )}
        <ASelect
          name="event_id"
          label="Ceremony"
          defaultValue={config.event_id ?? ""}
          placeholder="Not linked"
          options={events.map((e) => ({ value: e.id, label: e.name }))}
          optionalLabel
        />
      </div>
      <div className="mt-5">
        <SubmitButton variant="primary">Save configuration</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function ExecuteDrawButton({
  winnerCount,
  rule,
  eligible,
  disabled,
}: {
  winnerCount: number;
  rule: EligibilityRule;
  eligible: number;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [ack, setAck] = useState(false);
  const [pending, start] = useTransition();
  const { notify } = useToast();
  const router = useRouter();

  const run = () => {
    const fd = new FormData();
    fd.set("expected_winner_count", String(winnerCount));
    fd.set("expected_rule", rule);
    start(async () => {
      const r = await executeDraw(null, fd);
      if (r) notify(r.message, r.ok ? "success" : "error");
      if (r?.ok) setOpen(false);
      setAck(false);
      router.refresh();
    });
  };

  return (
    <>
      <p className="text-[14px] text-secondary-text">
        {disabled ? "Complete the steps above to enable the draw." : "Everything is ready. You will be asked to confirm before the draw runs."}
      </p>
      <Button variant="filled" size="lg" className="mt-4" disabled={disabled} onClick={() => setOpen(true)}>
        Execute lucky draw
      </Button>
      <ConfirmationDialog
        open={open}
        title="Execute the lucky draw?"
        description={
          <>
            <span className="block">
              <strong className="font-normal text-dark-walnut">{winnerCount}</strong> unique winners will be selected from{" "}
              <strong className="font-normal text-dark-walnut">{eligible}</strong> {rule === "verified_only" ? "verified" : "registered"} participants (Bride Side and Groom Side
              combined).
            </span>
            <span className="mt-2 block">The result is saved permanently and cannot be re-run.</span>
          </>
        }
        confirmLabel="Run the draw"
        loading={pending}
        confirmDisabled={!ack}
        onConfirm={run}
        onCancel={() => {
          setOpen(false);
          setAck(false);
        }}
      >
        <Checkbox label="I confirm the configuration above is correct." checked={ack} onChange={(e) => setAck(e.target.checked)} />
      </ConfirmationDialog>
    </>
  );
}
