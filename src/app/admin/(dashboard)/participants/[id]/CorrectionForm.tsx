"use client";

import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { AArea, ASelect, AText } from "@/components/admin/fields";
import { Panel } from "@/components/admin/ui";
import { correctParticipant } from "../actions";
import type { Participant } from "@/types/database";

export function CorrectionForm({ participant: p, isOwner }: { participant: Participant; isOwner: boolean }) {
  return (
    <Panel
      title="Correct details"
      description="Corrections keep mobile and email unique and are recorded in the audit log with your reason."
    >
      <ActionForm action={correctParticipant}>
        <input type="hidden" name="participantId" value={p.id} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AText name="fullName" label="Full name" defaultValue={p.full_name} maxLength={120} required />
          <AText name="mobile" label="Mobile number" type="tel" defaultValue={p.mobile_number} maxLength={20} required />
          <AText name="email" label="Email" type="email" defaultValue={p.email} maxLength={254} required />
          <ASelect
            name="gender"
            label="Gender"
            defaultValue={p.gender}
            options={[
              { value: "female", label: "Female" },
              { value: "male", label: "Male" },
            ]}
          />
          {isOwner ? (
            <ASelect
              name="side"
              label="Side"
              defaultValue={p.side}
              options={[
                { value: "bride", label: "Bride Side" },
                { value: "groom", label: "Groom Side" },
              ]}
              hint="Side corrections are owner-only and audited."
            />
          ) : (
            <>
              <input type="hidden" name="side" value={p.side} />
              <AText name="side_display" label="Side" value={p.side === "bride" ? "Bride Side" : "Groom Side"} disabled hint="Only an owner can correct a side." readOnly />
            </>
          )}
          <AArea name="address" label="Address" defaultValue={p.address} maxLength={500} rows={2} className="sm:col-span-2 lg:col-span-3" required />
          <AText name="reason" label="Reason for correction" maxLength={500} required className="sm:col-span-2 lg:col-span-3" hint="e.g. Guest asked to fix a spelling mistake." />
        </div>
        <div className="mt-6 flex justify-end">
          <SubmitButton>Save correction</SubmitButton>
        </div>
      </ActionForm>
    </Panel>
  );
}
