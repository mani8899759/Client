"use client";

import { useRouter } from "next/navigation";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { AArea, ACheck, ASelect, AText } from "@/components/admin/fields";
import { Panel } from "@/components/admin/ui";
import { ButtonLink } from "@/components/buttons/Button";
import { saveStream } from "./actions";
import type { LiveStream, WeddingEvent } from "@/types/database";

export function StreamForm({
  stream,
  events,
  scheduledLocal,
  timezone,
}: {
  stream: LiveStream | null;
  events: Pick<WeddingEvent, "id" | "name">[];
  scheduledLocal: string;
  timezone: string;
}) {
  const router = useRouter();
  return (
    <Panel title={stream ? `Edit · ${stream.title}` : "New live stream"} description="Status is controlled manually — switch it to Live Now when the broadcast starts.">
      <ActionForm action={saveStream} onSuccess={() => router.push("/admin/live")}>
        {stream ? <input type="hidden" name="id" value={stream.id} /> : null}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AText name="title" label="Title" defaultValue={stream?.title ?? ""} maxLength={160} required className="sm:col-span-2" />
          <ASelect
            name="event_id"
            label="Ceremony"
            defaultValue={stream?.event_id ?? ""}
            placeholder="Not linked"
            options={events.map((e) => ({ value: e.id, label: e.name }))}
          />
          <AText name="youtube_url" label="YouTube live link" type="url" defaultValue={stream?.youtube_url ?? ""} placeholder="https://www.youtube.com/live/…" className="sm:col-span-2" />
          <AText name="scheduled_at" label={`Scheduled (${timezone})`} type="datetime-local" defaultValue={scheduledLocal} />
          <AText name="replay_url" label="Replay link" type="url" defaultValue={stream?.replay_url ?? ""} optionalLabel hint="Defaults to the live link." className="sm:col-span-2" />
          <ASelect
            name="status"
            label="Status"
            defaultValue={stream?.status ?? "upcoming"}
            options={[
              { value: "upcoming", label: "Upcoming" },
              { value: "live", label: "Live Now" },
              { value: "ended", label: "Ended (replay)" },
            ]}
          />
          <AArea name="description" label="Description" defaultValue={stream?.description ?? ""} maxLength={1000} rows={2} optionalLabel className="sm:col-span-2 lg:col-span-3" />
          <ACheck name="is_published" label="Visible on the website" defaultChecked={stream?.is_published ?? false} />
        </div>
        <p className="mt-4 text-[12px] text-secondary-text">Note: an unlisted YouTube video is not private — anyone with the link can watch it.</p>
        <div className="mt-6 flex justify-end gap-3 border-t border-soft-border pt-6">
          <ButtonLink href="/admin/live" variant="primary">
            Cancel
          </ButtonLink>
          <SubmitButton>{stream ? "Save stream" : "Add stream"}</SubmitButton>
        </div>
      </ActionForm>
    </Panel>
  );
}
