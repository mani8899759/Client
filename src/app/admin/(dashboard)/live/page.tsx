import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Panel, TableWrap, td, th } from "@/components/admin/ui";
import { ConfirmActionButton } from "@/components/admin/forms";
import { MoveButtons, PublishToggle } from "@/components/admin/RowActions";
import { ToggleSetting } from "@/components/admin/ToggleSetting";
import { ButtonLink } from "@/components/buttons/Button";
import { EmptyState } from "@/components/feedback/States";
import { StreamForm } from "./StreamForm";
import { StatusSwitcher } from "./StatusSwitcher";
import { deleteStream, moveStream, publishStream } from "./actions";
import { formatDateTimeInZone, utcIsoToZonedLocal } from "@/lib/utils/datetime";
import type { AppSettings, LiveStream, WeddingEvent } from "@/types/database";

export const metadata = { title: "Live Streams" };

type Props = { searchParams: Promise<{ edit?: string; new?: string }> };

export default async function LiveAdminPage({ searchParams }: Props) {
  const { supabase } = await requireAdminPage();
  const sp = await searchParams;
  const [streamsRes, eventsRes, tzRes, appRes] = await Promise.all([
    supabase.from("live_streams").select("*, event:events(id, name, slug)").order("sort_order").order("created_at"),
    supabase.from("events").select("id, name").order("sort_order"),
    supabase.from("wedding_settings").select("timezone").single(),
    supabase.from("app_settings").select("*").single<AppSettings>(),
  ]);
  const streams = (streamsRes.data as LiveStream[] | null) ?? [];
  const events = (eventsRes.data as Pick<WeddingEvent, "id" | "name">[] | null) ?? [];
  const tz = (tzRes.data as { timezone: string } | null)?.timezone ?? "Asia/Kolkata";
  const editing = sp.edit ? (streams.find((s) => s.id === sp.edit) ?? null) : null;
  const showForm = !!editing || sp.new === "1";

  return (
    <>
      <AdminPageHeader
        eyebrow="Website"
        title="Live Streams"
        description="YouTube streams for each ceremony. The public Live page features the stream that is live, otherwise the next upcoming one, otherwise the latest replay."
        actions={!showForm ? <ButtonLink href="/admin/live?new=1" variant="filled" size="sm">Add stream</ButtonLink> : null}
      />

      {showForm ? (
        <div className="mb-8">
          <StreamForm key={editing?.id ?? "new"} stream={editing} events={events} scheduledLocal={utcIsoToZonedLocal(editing?.scheduled_at, tz)} timezone={tz} />
        </div>
      ) : null}

      <Panel className="mb-6">
        <ToggleSetting
          settingKey="live_section_visible"
          value={appRes.data?.live_section_visible ?? true}
          label="Show live streams on the website"
          onLabel="Visible"
          offLabel="Hidden"
          description="Hides the homepage teaser and the Live page content without unpublishing streams."
        />
      </Panel>

      <Panel title="Streams">
        {streams.length ? (
          <TableWrap>
            <thead>
              <tr>
                <th className={th}>Order</th>
                <th className={th}>Stream</th>
                <th className={th}>Scheduled</th>
                <th className={th}>Status</th>
                <th className={th}>Visibility</th>
                <th className={th}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {streams.map((s, i) => (
                <tr key={s.id}>
                  <td className={td}>
                    <MoveButtons action={moveStream} id={s.id} isFirst={i === 0} isLast={i === streams.length - 1} />
                  </td>
                  <td className={td}>
                    <span className="block">{s.title}</span>
                    <span className="text-[12px] text-secondary-text">{s.event?.name ?? "No ceremony linked"}</span>
                  </td>
                  <td className={`${td} whitespace-nowrap text-secondary-text`}>{formatDateTimeInZone(s.scheduled_at, tz) ?? "—"}</td>
                  <td className={td}>
                    <StatusSwitcher id={s.id} status={s.status} />
                  </td>
                  <td className={td}>
                    <PublishToggle action={publishStream} id={s.id} published={s.is_published} />
                  </td>
                  <td className={`${td} text-right whitespace-nowrap`}>
                    <Link href={`/admin/live?edit=${s.id}`} className="mr-2 text-[13px] underline underline-offset-4">
                      Edit
                    </Link>
                    <ConfirmActionButton
                      action={deleteStream}
                      fields={{ id: s.id }}
                      label="Delete"
                      title="Delete this stream?"
                      description={`"${s.title}" will be removed from the website.`}
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
          <EmptyState title="No streams yet" description="Add a YouTube live link for each ceremony you will broadcast." />
        )}
      </Panel>
    </>
  );
}
