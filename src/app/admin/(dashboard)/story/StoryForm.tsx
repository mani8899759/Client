"use client";

import { useRouter } from "next/navigation";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { AArea, ACheck, AText } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/MediaField";
import { Panel } from "@/components/admin/ui";
import { ButtonLink } from "@/components/buttons/Button";
import { saveStoryEntry } from "./actions";
import type { StoryEntry } from "@/types/database";

export function StoryForm({ entry }: { entry: StoryEntry | null }) {
  const router = useRouter();
  const v = (x: string | null | undefined) => x ?? "";
  return (
    <Panel title={entry ? "Edit chapter" : "New chapter"}>
      <ActionForm action={saveStoryEntry} onSuccess={() => router.push("/admin/story")}>
        {entry ? <input type="hidden" name="id" value={entry.id} /> : null}
        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-5 sm:grid-cols-2">
            <AText name="title" label="Title" defaultValue={v(entry?.title)} required maxLength={160} className="sm:col-span-2" />
            <AText name="chapter" label="Chapter label" defaultValue={v(entry?.chapter)} maxLength={60} optionalLabel hint="e.g. How we met, The proposal" />
            <AText name="date_label" label="Date or year (display)" defaultValue={v(entry?.date_label)} maxLength={60} optionalLabel hint='e.g. "Spring 2019"' />
            <AText name="entry_date" label="Date (for ordering)" type="date" defaultValue={v(entry?.entry_date)} optionalLabel />
            <div className="flex items-end pb-3">
              <ACheck name="is_published" label="Published" defaultChecked={entry?.is_published ?? false} />
            </div>
            <AArea name="description" label="Description" defaultValue={v(entry?.description)} maxLength={4000} rows={6} className="sm:col-span-2" hint="Separate paragraphs with a blank line." />
            <AText name="image_alt" label="Main photo description" defaultValue={v(entry?.image_alt)} maxLength={200} />
            <AText name="secondary_image_alt" label="Second photo description" defaultValue={v(entry?.secondary_image_alt)} maxLength={200} />
          </div>
          <div className="flex flex-col gap-6">
            <MediaField name="image_path" label="Main photograph" purpose="story" defaultValue={entry?.image_path} ratio="4/5" />
            <MediaField name="secondary_image_path" label="Second photograph (optional)" purpose="story" defaultValue={entry?.secondary_image_path} ratio="3/4" />
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-3 border-t border-soft-border pt-6">
          <ButtonLink href="/admin/story" variant="primary">
            Cancel
          </ButtonLink>
          <SubmitButton>{entry ? "Save chapter" : "Add chapter"}</SubmitButton>
        </div>
      </ActionForm>
    </Panel>
  );
}
