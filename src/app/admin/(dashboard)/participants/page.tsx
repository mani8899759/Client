import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Pagination, Panel } from "@/components/admin/ui";
import { ParticipantFilterBar, ParticipantTable } from "@/components/admin/ParticipantTable";
import { ButtonLink } from "@/components/buttons/Button";
import { EmptyState, ErrorState } from "@/components/feedback/States";
import { ADMIN_PAGE_SIZE } from "@/config/site";
import { filtersToQuery, listParticipants, parseParticipantFilters } from "@/services/admin/participants";

export const metadata = { title: "Participants" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ParticipantsPage({ searchParams }: Props) {
  const { supabase } = await requireAdminPage();
  const filters = parseParticipantFilters(await searchParams);
  const [{ rows, count, error }, tzRes] = await Promise.all([
    listParticipants(supabase, filters),
    supabase.from("wedding_settings").select("timezone").single(),
  ]);
  const tz = (tzRes.data as { timezone: string } | null)?.timezone ?? "Asia/Kolkata";
  const pageCount = Math.max(1, Math.ceil(count / ADMIN_PAGE_SIZE));
  const exportQuery = filtersToQuery({ ...filters, page: 1 });
  const sep = exportQuery ? "&" : "?";

  return (
    <>
      <AdminPageHeader
        eyebrow="Guests"
        title="Participants"
        description="Private guest registrations. Contact details are visible only to administrators."
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
      <Panel title={`${count} participant${count === 1 ? "" : "s"}`} description="Exports include every record matching the current filters.">
        <ParticipantFilterBar filters={filters} basePath="/admin/participants" />
        {error ? (
          <ErrorState title="Participants could not be loaded" />
        ) : rows.length ? (
          <>
            <ParticipantTable rows={rows} filters={filters} basePath="/admin/participants" timezone={tz} />
            <Pagination page={filters.page} pageCount={pageCount} makeHref={(p) => `/admin/participants${filtersToQuery(filters, { page: p })}`} />
          </>
        ) : (
          <EmptyState title="No participants found" description={filters.q || filters.side || filters.verification ? "Try different filters." : "Registrations will appear here."} />
        )}
      </Panel>
    </>
  );
}
