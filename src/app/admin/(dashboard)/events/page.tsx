import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Panel, TableWrap, td, th } from "@/components/admin/ui";
import { ConfirmActionButton } from "@/components/admin/forms";
import { MoveButtons, PublishToggle } from "@/components/admin/RowActions";
import { ButtonLink } from "@/components/buttons/Button";
import { EmptyState } from "@/components/feedback/States";
import { EventForm } from "./EventForms";
import { deleteEvent, moveEvent, publishEvent } from "./actions";
import { EVENT_TYPE_LABEL } from "@/config/site";
import { formatDateOnly, formatTimeRange } from "@/lib/utils/datetime";
import type { Venue, WeddingEvent } from "@/types/database";

export const metadata = { title: "Wedding Events" };

type Props = { searchParams: Promise<{ edit?: string; new?: string }> };

export default async function EventsAdminPage({ searchParams }: Props) {
  const { supabase } = await requireAdminPage();
  const sp = await searchParams;
  const [eventsRes, venuesRes] = await Promise.all([
    supabase.from("events").select("*, venue:venues(id, name)").order("sort_order").order("created_at"),
    supabase.from("venues").select("*").order("name"),
  ]);
  const events = (eventsRes.data as WeddingEvent[] | null) ?? [];
  const venues = (venuesRes.data as Venue[] | null) ?? [];
  const editing = sp.edit ? (events.find((e) => e.id === sp.edit) ?? null) : null;
  const showEventForm = !!editing || sp.new === "1";

  return (
    <>
      <AdminPageHeader
        eyebrow="Website"
        title="Wedding Events"
        description="Ceremonies appear on the Events page in this order. Only published events are visible to guests."
        actions={
          <>
            <ButtonLink href="/admin/venues" variant="primary" size="sm">
              Manage venues
            </ButtonLink>
            <ButtonLink href="/admin/events?new=1" variant="filled" size="sm">
              Add event
            </ButtonLink>
          </>
        }
      />

      {showEventForm ? (
        <div className="mb-8">
          <EventForm key={editing?.id ?? "new"} event={editing} venues={venues} />
        </div>
      ) : null}

      <Panel title="Events">
        {events.length ? (
          <TableWrap>
            <thead>
              <tr>
                <th className={th}>Order</th>
                <th className={th}>Event</th>
                <th className={th}>Date & time</th>
                <th className={th}>Venue</th>
                <th className={th}>Visibility</th>
                <th className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <tr key={e.id}>
                  <td className={td}>
                    <MoveButtons action={moveEvent} id={e.id} isFirst={i === 0} isLast={i === events.length - 1} />
                  </td>
                  <td className={td}>
                    <span className="block text-[15px]">{e.name}</span>
                    <span className="text-[12px] text-secondary-text">
                      {EVENT_TYPE_LABEL[e.event_type]} · /events/{e.slug}
                    </span>
                  </td>
                  <td className={`${td} text-secondary-text`}>
                    {formatDateOnly(e.event_date, "short") ?? "—"}
                    <span className="block text-[12px]">{formatTimeRange(e.start_time, e.end_time)}</span>
                  </td>
                  <td className={`${td} text-secondary-text`}>{e.venue?.name ?? "—"}</td>
                  <td className={td}>
                    <PublishToggle action={publishEvent} id={e.id} published={e.is_published} />
                  </td>
                  <td className={`${td} text-right whitespace-nowrap`}>
                    <Link href={`/admin/events?edit=${e.id}`} className="mr-2 text-[13px] underline underline-offset-4">
                      Edit
                    </Link>
                    <ConfirmActionButton
                      action={deleteEvent}
                      fields={{ id: e.id }}
                      label="Delete"
                      title="Delete this event?"
                      description={`"${e.name}", its invitation and images will be permanently removed. Linked live streams will remain without an event.`}
                      tone="danger"
                      variant="ghost"
                      className="text-secondary!"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        ) : (
          <EmptyState title="No events yet" description="Add Engagement, Haldi, Mehendi, Wedding or Reception — only the ones you are holding." />
        )}
      </Panel>

    </>
  );
}
