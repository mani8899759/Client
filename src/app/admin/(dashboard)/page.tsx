import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Badge, Panel, StatCard } from "@/components/admin/ui";
import { StreamStatusBadge } from "@/components/media/StreamStatusBadge";
import { formatDateOnly, formatDateTimeInZone, formatTimeOnly } from "@/lib/utils/datetime";
import { auditActionLabel } from "@/services/admin/audit";
import type { AppSettings, AuditLog, DashboardStats, LiveStream, WeddingEvent } from "@/types/database";

export const metadata = { title: "Dashboard" };

function Bar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-[13px]">
        <span className="text-dark-walnut">{label}</span>
        <span className="text-secondary-text tabular-nums">
          {value} · {pct}%
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-soft-border/60" role="presentation">
        <div className="h-full rounded-full bg-champagne-gold" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function AdminOverview() {
  const { supabase, profile } = await requireAdminPage();
  const today = new Date().toISOString().slice(0, 10);

  const [statsRes, eventsRes, streamsRes, settingsRes, auditRes, weddingRes, cfgRes, interestRes] = await Promise.all([
    supabase.rpc("admin_dashboard_stats"),
    supabase
      .from("events")
      .select("id, name, slug, event_date, start_time, is_published")
      .or(`event_date.gte.${today},event_date.is.null`)
      .order("event_date", { ascending: true, nullsFirst: false })
      .limit(5),
    supabase.from("live_streams").select("id, title, status, scheduled_at, is_published").order("scheduled_at", { ascending: true }).limit(20),
    supabase.from("app_settings").select("*").single(),
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("wedding_settings").select("timezone").single(),
    supabase.from("lucky_draw_config").select("winner_count, eligibility_rule").single(),
    supabase.rpc("admin_event_interests_summary"),
  ]);

  const s = (statsRes.data as DashboardStats | null) ?? null;
  const events = (eventsRes.data as WeddingEvent[] | null) ?? [];
  const streams = (streamsRes.data as LiveStream[] | null) ?? [];
  const app = settingsRes.data as AppSettings | null;
  const audit = (auditRes.data as AuditLog[] | null) ?? [];
  const tz = (weddingRes.data as { timezone: string } | null)?.timezone ?? "Asia/Kolkata";
  const cfg = cfgRes.data as { winner_count: number; eligibility_rule: "verified_only" | "all_registered" } | null;
  const eligible = s ? (cfg?.eligibility_rule === "all_registered" ? s.total_registered : s.total_verified) : null;
  const liveNow = streams.find((x) => x.status === "live" && x.is_published);
  const nextStream = liveNow ?? streams.find((x) => x.status === "upcoming" && x.is_published) ?? null;
  const totalInterested = (interestRes.data as { total_unique_interested?: number } | null)?.total_unique_interested ?? 0;

  return (
    <>
      <AdminPageHeader eyebrow={`Welcome, ${profile.full_name}`} title="Dashboard" description="Live figures from the wedding database." />

      {statsRes.error ? (
        <p className="mb-8 rounded-[var(--radius-control)] border border-secondary/30 bg-card-surface p-4 text-support text-secondary">
          Statistics could not be loaded. Check the database connection.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6 lg:gap-4">
        <StatCard label="Total registrations" value={s?.total_registered ?? "—"} href="/admin/registrations" />
        <StatCard label="People Interested" value={totalInterested} tone="accent" hint="Deduplicated visitors" href="/admin/interested" />
        <StatCard label="Verified" value={s?.total_verified ?? "—"} tone="accent" href="/admin/verification?verification=verified" />
        <StatCard label="Pending" value={s?.total_pending ?? "—"} href="/admin/verification" />
        <StatCard label="Bride Side" value={s?.bride_registered ?? "—"} href="/admin/participants?side=bride" />
        <StatCard label="Groom Side" value={s?.groom_registered ?? "—"} href="/admin/participants?side=groom" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="By side" className="lg:col-span-2">
          {s ? (
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="flex flex-col gap-5">
                <p className="text-meta text-muted-gold">Registered</p>
                <Bar label="Bride Side" value={s.bride_registered} total={s.total_registered} />
                <Bar label="Groom Side" value={s.groom_registered} total={s.total_registered} />
              </div>
              <div className="flex flex-col gap-5">
                <p className="text-meta text-muted-gold">Verified</p>
                <Bar label="Bride Side" value={s.bride_verified} total={s.total_verified} />
                <Bar label="Groom Side" value={s.groom_verified} total={s.total_verified} />
              </div>
            </div>
          ) : (
            <p className="text-support text-secondary-text">No data.</p>
          )}
        </Panel>

        <Panel title="Status">
          <ul className="flex flex-col gap-3 text-[14px]">
            <li className="flex items-center justify-between gap-3">
              Registration <Badge tone={app?.registration_open ? "success" : "neutral"}>{app?.registration_open ? "Open" : "Closed"}</Badge>
            </li>
            <li className="flex items-center justify-between gap-3">
              QR verification <Badge tone={app?.verification_enabled ? "success" : "neutral"}>{app?.verification_enabled ? "Active" : "Inactive"}</Badge>
            </li>
            <li className="flex items-center justify-between gap-3">
              Public winners <Badge tone={app?.winners_public ? "success" : "neutral"}>{app?.winners_public ? "Visible" : "Hidden"}</Badge>
            </li>
            <li className="flex items-center justify-between gap-3">
              Live stream
              {nextStream ? <StreamStatusBadge status={nextStream.status} /> : <Badge>None scheduled</Badge>}
            </li>
          </ul>
          {s && (s.failed_verifications_24h > 0 || s.rate_limited_24h > 0) ? (
            <p className="mt-5 border-t border-soft-border pt-4 text-[13px] text-secondary-text">
              Last 24h: {s.failed_verifications_24h} unmatched verification attempts, {s.rate_limited_24h} throttled requests.
            </p>
          ) : null}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Upcoming events" actions={<Link href="/admin/events" className="text-[13px] text-secondary-text underline underline-offset-4">Manage</Link>}>
          {events.length ? (
            <ul className="divide-y divide-soft-border">
              {events.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] text-dark-walnut">{e.name}</p>
                    <p className="text-[13px] text-secondary-text">
                      {[formatDateOnly(e.event_date, "short"), formatTimeOnly(e.start_time)].filter(Boolean).join(" · ") || "Date not set"}
                    </p>
                  </div>
                  <Badge tone={e.is_published ? "success" : "neutral"}>{e.is_published ? "Published" : "Draft"}</Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-support text-secondary-text">No upcoming events.</p>
          )}
          {nextStream ? (
            <p className="mt-5 border-t border-soft-border pt-4 text-[13px] text-secondary-text">
              Next stream: <span className="text-dark-walnut">{nextStream.title}</span>
              {nextStream.scheduled_at ? ` · ${formatDateTimeInZone(nextStream.scheduled_at, tz)}` : ""}
            </p>
          ) : null}
        </Panel>

        <Panel title="Recent activity" actions={<Link href="/admin/audit" className="text-[13px] text-secondary-text underline underline-offset-4">Audit log</Link>}>
          {audit.length ? (
            <ul className="divide-y divide-soft-border">
              {audit.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <span className="text-[14px] text-dark-walnut">{auditActionLabel(a.action)}</span>
                  <span className="shrink-0 text-[12px] text-secondary-text">{formatDateTimeInZone(a.created_at, tz)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-support text-secondary-text">No administrative actions yet.</p>
          )}
        </Panel>
      </div>
    </>
  );
}
