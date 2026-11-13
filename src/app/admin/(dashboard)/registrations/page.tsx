import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Panel, StatCard } from "@/components/admin/ui";
import { ToggleSetting } from "@/components/admin/ToggleSetting";
import { ParticipantTable } from "@/components/admin/ParticipantTable";
import { ButtonLink } from "@/components/buttons/Button";
import { EmptyState } from "@/components/feedback/States";
import { listParticipants, parseParticipantFilters } from "@/services/admin/participants";
import { cn } from "@/lib/utils/cn";
import type { AppSettings, DashboardStats } from "@/types/database";

export const metadata = { title: "Registrations" };

export default async function RegistrationsPage() {
  const { supabase } = await requireAdminPage();
  const recentFilters = { ...parseParticipantFilters({}), sort: "registered_at" as const, dir: "desc" as const };
  const [appRes, statsRes, recent, tzRes] = await Promise.all([
    supabase.from("app_settings").select("*").single<AppSettings>(),
    supabase.rpc("admin_dashboard_stats"),
    listParticipants(supabase, recentFilters),
    supabase.from("wedding_settings").select("timezone").single(),
  ]);
  const app = appRes.data;
  const s = statsRes.data as DashboardStats | null;
  const open = app?.registration_open ?? false;
  const tz = (tzRes.data as { timezone: string } | null)?.timezone ?? "Asia/Kolkata";

  return (
    <>
      <AdminPageHeader
        eyebrow="Guests"
        title="Registrations"
        description="Control public guest registration. Closing registration is enforced on the server — the form shows a closed notice and new submissions are rejected. Existing records are always kept."
        actions={
          <>
            <ButtonLink href="/api/admin/participants/export?format=csv" variant="primary" size="sm">
              Export CSV
            </ButtonLink>
            <ButtonLink href="/api/admin/participants/export?format=xlsx" variant="primary" size="sm">
              Export Excel
            </ButtonLink>
          </>
        }
      />

      <section
        aria-labelledby="reg-status"
        className={cn(
          "flex flex-col gap-6 rounded-[var(--radius-surface)] border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8",
          open ? "border-muted-sage/50 bg-card-surface" : "border-secondary/30 bg-card-surface",
        )}
      >
        <div>
          <p id="reg-status" className="text-meta text-secondary-text">
            Registration Status
          </p>
          <p className={cn("mt-2 font-serif text-[48px] leading-none", open ? "text-[#5b634d]" : "text-secondary")}>{open ? "OPEN" : "CLOSED"}</p>
          <p className="mt-3 text-[14px] text-secondary-text">
            {open ? (
              <>
                Guests can register at{" "}
                <Link href="/register" target="_blank" className="underline underline-offset-4">
                  /register
                </Link>{" "}
                without signing in.
              </>
            ) : (
              "The public form shows that registration is closed."
            )}
          </p>
        </div>
        <div className="w-full max-w-[360px]">
          <ToggleSetting
            settingKey="registration_open"
            value={open}
            label={open ? "Close registrations" : "Open registrations"}
            onLabel="Open"
            offLabel="Closed"
            confirmOff="New guests will not be able to register. Existing registrations are kept."
            confirmOn="The registration form will be available to the public again."
          />
        </div>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total registrations" value={s?.total_registered ?? "—"} href="/admin/participants" />
        <StatCard label="Bride Side" value={s?.bride_registered ?? "—"} href="/admin/participants?side=bride" />
        <StatCard label="Groom Side" value={s?.groom_registered ?? "—"} href="/admin/participants?side=groom" />
        <StatCard label="Verified" value={s?.total_verified ?? "—"} tone="accent" href="/admin/verification?verification=verified" />
      </div>

      <Panel
        title="Latest registrations"
        className="mt-6"
        actions={
          <form method="get" action="/admin/participants" role="search" className="flex gap-2">
            <label htmlFor="reg-q" className="sr-only">
              Search participants
            </label>
            <input
              id="reg-q"
              name="q"
              placeholder="Search name or mobile"
              className="h-9 w-48 rounded-[var(--radius-control)] border border-soft-border bg-card-surface px-3 text-[14px] focus:border-primary focus:outline-none sm:w-60"
            />
            <button type="submit" className="h-9 rounded-[var(--radius-control)] bg-dark-walnut px-4 text-[13px] text-soft-cream">
              Search
            </button>
          </form>
        }
      >
        {recent.rows.length ? (
          <>
            <ParticipantTable rows={recent.rows.slice(0, 10)} filters={recentFilters} basePath="/admin/participants" timezone={tz} />
            <div className="mt-4 text-right">
              <Link href="/admin/participants" className="text-[13px] underline underline-offset-4">
                All {recent.count} participants →
              </Link>
            </div>
          </>
        ) : (
          <EmptyState title="No registrations yet" description="New registrations will appear here as soon as guests sign up." />
        )}
      </Panel>
    </>
  );
}
