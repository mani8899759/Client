import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Pagination, Panel, StatCard } from "@/components/admin/ui";
import { ToggleSetting } from "@/components/admin/ToggleSetting";
import { ParticipantFilterBar, ParticipantTable } from "@/components/admin/ParticipantTable";
import { ButtonLink } from "@/components/buttons/Button";
import { EmptyState, ErrorState } from "@/components/feedback/States";
import { ADMIN_PAGE_SIZE } from "@/config/site";
import { filtersToQuery, listParticipants, parseParticipantFilters } from "@/services/admin/participants";
import { cn } from "@/lib/utils/cn";
import type { AppSettings, DashboardStats } from "@/types/database";

export const metadata = { title: "Registrations — Guest Management" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function RegistrationsPage({ searchParams }: Props) {
  const { supabase } = await requireAdminPage();
  const rawParams = await searchParams;
  const filters = parseParticipantFilters(rawParams);

  const [appRes, statsRes, listRes, tzRes] = await Promise.all([
    supabase.from("app_settings").select("*").single<AppSettings>(),
    supabase.rpc("admin_dashboard_stats"),
    listParticipants(supabase, filters),
    supabase.from("wedding_settings").select("timezone").single(),
  ]);

  const app = appRes.data;
  const s = statsRes.data as DashboardStats | null;
  const open = app?.registration_open ?? false;
  const tz = (tzRes.data as { timezone: string } | null)?.timezone ?? "Asia/Kolkata";
  const { rows, count, error } = listRes;
  const pageCount = Math.max(1, Math.ceil(count / ADMIN_PAGE_SIZE));
  const exportQuery = filtersToQuery({ ...filters, page: 1 });
  const sep = exportQuery ? "&" : "?";

  return (
    <>
      <AdminPageHeader
        eyebrow="Guests"
        title="Registrations"
        description="Comprehensive guest registration management. Closing registration is enforced on the server — the form displays a closed notice and new submissions are rejected while existing records are preserved."
        actions={
          <>
            <ButtonLink href={`/api/admin/participants/export${exportQuery}${sep}format=csv`} variant="primary" size="sm">
              Export CSV
            </ButtonLink>
            <ButtonLink href={`/api/admin/participants/export${exportQuery}${sep}format=xlsx`} variant="primary" size="sm">
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
          <p className={cn("mt-2 font-serif text-[48px] leading-none", open ? "text-[#5b634d]" : "text-secondary")}>
            {open ? "OPEN" : "CLOSED"}
          </p>
          <p className="mt-3 text-[14px] text-secondary-text">
            {open ? (
              <>
                Guests can register at{" "}
                <Link href="/register" target="_blank" className="underline underline-offset-4 text-dark-walnut font-medium">
                  /register
                </Link>{" "}
                without signing in.
              </>
            ) : (
              "The public registration form displays that registration is currently closed."
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

      {/* Summary metric cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total Registrations" value={s?.total_registered ?? "—"} href="/admin/registrations" />
        <StatCard label="Verified" value={s?.total_verified ?? "—"} tone="accent" href="/admin/registrations?verification=verified" />
        <StatCard label="Pending" value={s?.total_pending ?? "—"} href="/admin/registrations?verification=pending" />
        <StatCard label="Bride Side" value={s?.bride_registered ?? "—"} href="/admin/registrations?side=bride" />
        <StatCard label="Groom Side" value={s?.groom_registered ?? "—"} href="/admin/registrations?side=groom" />
      </div>

      {/* Full registration records table with filters and pagination */}
      <Panel
        title={`All Registered Guests (${count})`}
        description="Private registrations with contact information, family side, verification status, and timestamps."
        className="mt-6"
      >
        <ParticipantFilterBar filters={filters} basePath="/admin/registrations" />

        {error ? (
          <ErrorState title="Registrations could not be loaded" />
        ) : rows.length ? (
          <>
            <ParticipantTable rows={rows} filters={filters} basePath="/admin/registrations" timezone={tz} />
            <Pagination
              page={filters.page}
              pageCount={pageCount}
              makeHref={(p) => `/admin/registrations${filtersToQuery(filters, { page: p })}`}
            />
          </>
        ) : (
          <EmptyState
            title="No registrations found"
            description={
              filters.q || filters.side || filters.verification
                ? "Try adjusting your search query or clearing your filter criteria."
                : "Guest registrations will appear here as soon as guests submit the form."
            }
          />
        )}
      </Panel>
    </>
  );
}
