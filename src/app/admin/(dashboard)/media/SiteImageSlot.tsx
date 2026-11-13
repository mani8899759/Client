"use client";

import Image from "next/image";
import { useState } from "react";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { AText } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/MediaField";
import { Badge } from "@/components/admin/ui";
import { setSiteImage } from "../content/actions";

export function SiteImageSlot({
  field,
  label,
  ratio,
  uploaded,
  uploadedAlt,
  effectiveUrl,
  source,
  hasFallback,
}: {
  field: string;
  label: string;
  ratio: string;
  uploaded: string | null;
  uploadedAlt: string | null;
  effectiveUrl: string | null;
  source: "photo" | "ai" | "empty";
  hasFallback: boolean;
}) {
  const [editing, setEditing] = useState(false);
  return (
    <li className="rounded-[var(--radius-control)] border border-soft-border bg-warm-ivory p-4">
      <div className="flex items-start gap-4">
        <div className="relative w-28 shrink-0 overflow-hidden rounded-[4px] bg-soft-cream" style={{ aspectRatio: ratio }}>
          {effectiveUrl ? <Image src={effectiveUrl} alt="" fill sizes="112px" className="object-cover" /> : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] text-dark-walnut">{label}</p>
          <div className="mt-2">
            {source === "photo" ? (
              <Badge tone="success">Uploaded photograph</Badge>
            ) : source === "ai" ? (
              <Badge tone="warning">AI illustration · placeholder</Badge>
            ) : (
              <Badge>Empty placeholder</Badge>
            )}
          </div>
          {!editing ? (
            <button type="button" onClick={() => setEditing(true)} className="mt-3 text-[13px] text-dark-walnut underline decoration-champagne-gold underline-offset-4">
              {source === "photo" ? "Change or clear" : "Replace with a real photograph"}
            </button>
          ) : null}
        </div>
      </div>
      {editing ? (
        <ActionForm action={setSiteImage} className="mt-4 flex flex-col gap-4 border-t border-soft-border pt-4" onSuccess={() => setEditing(false)}>
          <input type="hidden" name="field" value={field} />
          <MediaField
            name="ref"
            label="Photograph"
            purpose="hero"
            defaultValue={uploaded}
            ratio={ratio}
            hint={hasFallback ? "Remove the image and save to show the AI illustration again." : undefined}
          />
          <AText name="alt" label="Description (alt text)" defaultValue={uploadedAlt ?? ""} maxLength={200} />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(false)} className="h-9 px-3 text-[13px] text-secondary-text">
              Cancel
            </button>
            <SubmitButton size="sm">Save</SubmitButton>
          </div>
        </ActionForm>
      ) : null}
    </li>
  );
}
