"use client";

import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { AArea, AText } from "@/components/admin/fields";
import { Panel } from "@/components/admin/ui";
import { saveConsent } from "./actions";

export function ConsentForm({ text, version }: { text: string; version: string }) {
  return (
    <Panel title="Registration consent" description="Shown beside the consent checkbox. Each registration stores the policy version that was accepted — bump the version when the text changes.">
      <ActionForm action={saveConsent}>
        <div className="grid gap-5 sm:grid-cols-[1fr_200px]">
          <AArea name="consent_text" label="Consent statement" defaultValue={text} rows={3} maxLength={1000} required />
          <AText name="consent_policy_version" label="Policy version" defaultValue={version} maxLength={40} required />
        </div>
        <div className="mt-5 flex justify-end">
          <SubmitButton variant="primary">Save consent</SubmitButton>
        </div>
      </ActionForm>
    </Panel>
  );
}
