import Image from "next/image";
import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Panel, TableWrap, td, th } from "@/components/admin/ui";
import { ConfirmActionButton } from "@/components/admin/forms";
import { MoveButtons, PublishToggle } from "@/components/admin/RowActions";
import { ToggleSetting } from "@/components/admin/ToggleSetting";
import { ButtonLink } from "@/components/buttons/Button";
import { EmptyState } from "@/components/feedback/States";
import { OFFICIAL_LOGO } from "@/config/logo";
import { mediaUrl } from "@/lib/storage/media";
import { StreamForm } from "./StreamForm";
import { StatusSwitcher } from "./StatusSwitcher";
import { deleteStream, moveStream, publishStream } from "./actions";
import { formatDateTimeInZone, utcIsoToZonedLocal } from "@/lib/utils/datetime";
import type { AppSettings, LiveStream, WeddingEvent, WeddingSettings } from "@/types/database";

export const metadata = { title: "Live Streams" };

type Props = { searchParams: Promise<{ edit?: string; new?: string }> };

export default async function LiveAdminPage({ searchParams }: Props) {
  const { supabase } = await requireAdminPage();
  const sp = await searchParams;
  const [streamsRes, eventsRes, weddingRes, appRes] = await Promise.all([
    supabase.from("live_streams").select("*, event:events(id, name, slug)").order("sort_order").order("created_at"),
    supabase.from("events").select("id, name").order("sort_order"),
    supabase.from("wedding_settings").select("timezone, logo_path, logo_youtube_enabled").single<Pick<WeddingSettings, "timezone" | "logo_path" | "logo_youtube_enabled">>(),
    supabase.from("app_settings").select("*").single<AppSettings>(),
  ]);
  const streams = (streamsRes.data as LiveStream[] | null) ?? [];
  const events = (eventsRes.data as Pick<WeddingEvent, "id" | "name">[] | null) ?? [];
  const tz = weddingRes.data?.timezone ?? "Asia/Kolkata";
  const logoUrl = mediaUrl(weddingRes.data?.logo_path) ?? OFFICIAL_LOGO.src;
  const logoPlaceholderEnabled = weddingRes.data?.logo_youtube_enabled !== false;
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

      <Panel
        title="Current Live Section Placeholder"
        className="mb-6"
        description="Shown automatically whenever no published stream has a valid YouTube URL. Publishing a valid YouTube link replaces this placeholder with the video player."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-dark-walnut">
              Default placeholder {logoPlaceholderEnabled ? "(Active)" : "(Disabled)"}
            </span>
            <div className="flex h-36 items-center justify-center rounded-[var(--radius-control)] border border-soft-border bg-soft-cream p-5">
              <Image
                src={logoUrl}
                alt={OFFICIAL_LOGO.alt}
                width={OFFICIAL_LOGO.width}
                height={OFFICIAL_LOGO.height}
                className="max-h-20 w-auto object-contain"
              />
            </div>
            <Link href="/admin/media" className="text-[12px] text-dark-walnut underline decoration-champagne-gold underline-offset-4">
              Manage official logo in Media
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-medium text-dark-walnut">
              Fallback image (real couple photograph)
            </span>
            <div className="relative h-36 overflow-hidden rounded-[var(--radius-control)] border border-soft-border bg-warm-ivory">
              <Image
                src="/images/wedding-shoot/optimised/photo-13.webp"
                alt="Manikanta & Sravika — Real Wedding Shoot Photograph"
                fill
                sizes="320px"
                className="object-cover object-[center_25%]"
              />
            </div>
            <span className="text-[12px] text-secondary-text">
              Used automatically if the logo is disabled or fails to load.
            </span>
          </div>
        </div>
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
