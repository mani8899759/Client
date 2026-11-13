"use client";

import { useRouter } from "next/navigation";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { AArea, ACheck, ASelect, AText } from "@/components/admin/fields";
import { MediaField } from "@/components/admin/MediaField";
import { Panel } from "@/components/admin/ui";
import { ButtonLink } from "@/components/buttons/Button";
import { EVENT_TYPE_LABEL } from "@/config/site";
import { saveEvent, saveVenue } from "./actions";
import type { Venue, WeddingEvent } from "@/types/database";

const v = (x: string | number | null | undefined) => (x === null || x === undefined ? "" : String(x));

export function EventForm({ event, venues }: { event: WeddingEvent | null; venues: Venue[] }) {
  const router = useRouter();
  return (
    <Panel title={event ? `Edit · ${event.name}` : "New event"}>
      <ActionForm action={saveEvent} onSuccess={() => router.push("/admin/events")}>
        {event ? <input type="hidden" name="id" value={event.id} /> : null}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <AText name="name" label="Event name" defaultValue={v(event?.name)} required maxLength={120} className="sm:col-span-2" />
          <ASelect
            name="event_type"
            label="Type"
            defaultValue={event?.event_type ?? "wedding"}
            options={Object.entries(EVENT_TYPE_LABEL).map(([value, label]) => ({ value, label }))}
          />
          <AText name="slug" label="Web address" defaultValue={v(event?.slug)} maxLength={80} optionalLabel hint="Generated from the name if empty." />
          <AText name="event_date" label="Date" type="date" defaultValue={v(event?.event_date)} />
          <AText name="start_time" label="Start time" type="time" defaultValue={v(event?.start_time).slice(0, 5)} />
          <AText name="end_time" label="End time" type="time" defaultValue={v(event?.end_time).slice(0, 5)} optionalLabel />
          <ASelect
            name="venue_id"
            label="Venue"
            defaultValue={event?.venue_id ?? ""}
            placeholder="No venue"
            options={venues.map((x) => ({ value: x.id, label: x.name }))}
            hint={venues.length ? undefined : "Add a venue first under Venues & Locations."}
          />
          <AArea name="short_description" label="Short description" defaultValue={v(event?.short_description)} maxLength={300} rows={2} className="sm:col-span-2 lg:col-span-4" />
          <AArea name="description" label="Full description" defaultValue={v(event?.description)} maxLength={5000} rows={6} className="sm:col-span-2 lg:col-span-4" hint="Separate paragraphs with a blank line." />
          <AText name="dress_code" label="Dress code" defaultValue={v(event?.dress_code)} maxLength={200} optionalLabel className="sm:col-span-2" />
          <AText name="contact_info" label="Event contact" defaultValue={v(event?.contact_info)} maxLength={300} optionalLabel className="sm:col-span-2" />
          <AText name="image_alt" label="Event photo description" defaultValue={v(event?.image_alt)} maxLength={200} className="sm:col-span-2" />
          <div className="flex items-end pb-3 sm:col-span-2">
            <ACheck name="is_published" label="Published (visible to guests)" defaultChecked={event?.is_published ?? false} />
          </div>
        </div>
        <div className="mt-8 grid gap-6 border-t border-soft-border pt-6 lg:grid-cols-3">
          <MediaField name="image_path" label="Event photograph" purpose="events" defaultValue={event?.image_path} ratio="5/4" />
          <MediaField name="invitation_image_path" label="Invitation image" purpose="invitations" defaultValue={event?.invitation_image_path} ratio="4/5" />
          <MediaField name="invitation_video_path" label="Invitation video" purpose="invitations" kind="video" defaultValue={event?.invitation_video_path} ratio="16/9" />
        </div>
        <div className="mt-8 flex justify-end gap-3 border-t border-soft-border pt-6">
          <ButtonLink href="/admin/events" variant="primary">
            Cancel
          </ButtonLink>
          <SubmitButton>{event ? "Save event" : "Create event"}</SubmitButton>
        </div>
      </ActionForm>
    </Panel>
  );
}

export function VenueForm({ venue }: { venue: Venue | null }) {
  const router = useRouter();
  return (
    <Panel title={venue ? `Edit venue · ${venue.name}` : "New venue"} description="Use the real address. Coordinates enable an embedded map.">
      <ActionForm action={saveVenue} onSuccess={() => router.push("/admin/venues")}>
        {venue ? <input type="hidden" name="id" value={venue.id} /> : null}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <AText name="name" label="Venue name" defaultValue={v(venue?.name)} required maxLength={160} className="sm:col-span-2" />
          <AText name="google_maps_url" label="Google Maps link" type="url" defaultValue={v(venue?.google_maps_url)} maxLength={500} optionalLabel className="sm:col-span-2" placeholder="https://maps.app.goo.gl/…" />
          <AText name="address" label="Address" defaultValue={v(venue?.address)} maxLength={400} className="sm:col-span-2 lg:col-span-4" />
          <AText name="city" label="City" defaultValue={v(venue?.city)} maxLength={80} />
          <AText name="state" label="State" defaultValue={v(venue?.state)} maxLength={80} />
          <AText name="country" label="Country" defaultValue={v(venue?.country)} maxLength={80} />
          <div />
          <AText name="latitude" label="Latitude" inputMode="decimal" defaultValue={v(venue?.latitude)} optionalLabel placeholder="e.g. 12.971599" />
          <AText name="longitude" label="Longitude" inputMode="decimal" defaultValue={v(venue?.longitude)} optionalLabel placeholder="e.g. 77.594566" />
          <AArea name="notes" label="Notes for guests" defaultValue={v(venue?.notes)} maxLength={1000} rows={2} optionalLabel className="sm:col-span-2" hint="Parking, entrance, etc." />
        </div>
        <div className="mt-8 flex justify-end gap-3 border-t border-soft-border pt-6">
          <ButtonLink href="/admin/venues" variant="primary">
            Cancel
          </ButtonLink>
          <SubmitButton>{venue ? "Save venue" : "Add venue"}</SubmitButton>
        </div>
      </ActionForm>
    </Panel>
  );
}
