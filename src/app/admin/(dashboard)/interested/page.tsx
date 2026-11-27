import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Pagination, Panel, StatCard } from "@/components/admin/ui";
import { InterestedFilterBar, InterestedTable } from "@/components/admin/InterestedTable";
import { EmptyState, ErrorState } from "@/components/feedback/States";
import { formatDateOnly, formatTimeOnly } from "@/lib/utils/datetime";
import {
  getInterestedSummary,
  listEventInterests,
  parseInterestedFilters,
  type InterestedFilters,
} from "@/services/admin/interested";
import { CalendarHeart, MapPin, Users } from "lucide-react";

export const metadata = { title: "I'm Interested — Guest Engagement" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function makePaginationHref(filters: InterestedFilters, page: number): string {
  const sp = new URLSearchParams();
  if (filters.q) sp.set("q", filters.q);
  if (filters.event && filters.event !== "all") sp.set("event", filters.event);
  if (filters.registered && filters.registered !== "all") sp.set("registered", filters.registered);
  if (filters.sort && filters.sort !== "date_desc") sp.set("sort", filters.sort);
  if (page > 1) sp.set("page", String(page));
  const q = sp.toString();
  return `/admin/interested${q ? `?${q}` : ""}`;
}

export default async function InterestedPage({ searchParams }: Props) {
  const { supabase } = await requireAdminPage();
  const rawParams = await searchParams;
  const filters = parseInterestedFilters(rawParams);

  const [summary, listResult, tzRes] = await Promise.all([
    getInterestedSummary(supabase),
    listEventInterests(supabase, filters),
    supabase.from("wedding_settings").select("timezone").single(),
  ]);

  const timezone = (tzRes.data as { timezone: string } | null)?.timezone ?? "Asia/Kolkata";
  const { rows, count, error } = listResult;
  const pageCount = Math.max(1, Math.ceil(count / filters.pageSize));

  const filterEvents = summary.events.map((e) => ({ slug: e.slug, name: e.name }));

  return (
    <>
      <AdminPageHeader
        eyebrow="Guest Engagement"
        title="I'm Interested"
        description="Track genuine visitor excitement and interest for each wedding event. Deduplication guarantees unique visitor metrics without public counter inflation."
      />

      {/* Top deduplicated metric summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-2">
          <StatCard
            label="Total Unique People Interested"
            value={summary.total_unique_interested}
            tone="accent"
            hint="Deduplicated visitor count across all wedding events combined"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <StatCard
            label="Tracked Celebrations"
            value={summary.events.length}
            hint="Published wedding ceremonies open for guest interest"
          />
        </div>
      </div>

      {/* Event-wise breakdown cards */}
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-[22px] text-dark-walnut">Event-Wise Breakdown</h2>
          <span className="text-[13px] text-secondary-text">Per-event unique counts</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {summary.events.map((event) => {
            const dateStr = formatDateOnly(event.event_date, "short") || "Date TBA";
            const timeStr = formatTimeOnly(event.start_time);
            return (
              <div
                key={event.event_id}
                className="flex flex-col justify-between rounded-[var(--radius-control)] border border-soft-border bg-card-surface p-5 shadow-xs transition-colors hover:border-champagne-gold/70"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif text-[18px] text-dark-walnut">{event.name}</h3>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-champagne-gold/60 bg-champagne-gold/10 px-3 py-1 text-[13px] font-semibold text-dark-walnut">
                      <Users className="size-3.5 text-primary" />
                      {event.interested_count}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-col gap-1.5 text-[13px] text-secondary-text">
                    <div className="flex items-center gap-2">
                      <CalendarHeart className="size-3.5 shrink-0 text-muted-gold" />
                      <span>{[dateStr, timeStr].filter(Boolean).join(" · ")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 shrink-0 text-muted-gold" />
                      <span className="truncate">{event.venue_name}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 border-t border-soft-border pt-3">
                  <span className="text-[12px] text-secondary-text">
                    {event.interested_count === 1
                      ? "1 person interested"
                      : `${event.interested_count} people interested`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Detailed interest logs table */}
      <Panel
        title={`Guest Interest Log (${count})`}
        description="Every visitor interest submission recorded with timestamp, event, and guest profile linkage."
        className="mt-8"
      >
        <InterestedFilterBar filters={filters} basePath="/admin/interested" events={filterEvents} />

        {error ? (
          <ErrorState title="Interest entries could not be loaded" />
        ) : rows.length ? (
          <>
            <InterestedTable rows={rows} timezone={timezone} />
            <Pagination
              page={filters.page}
              pageCount={pageCount}
              makeHref={(p) => makePaginationHref(filters, p)}
            />
          </>
        ) : (
          <EmptyState
            title="No interested guest records found"
            description={
              filters.q || (filters.event && filters.event !== "all") || filters.registered !== "all"
                ? "Try broadening your filter criteria or clearing search terms."
                : "When visitors click 'Interested' on wedding events, their records will display here."
            }
          />
        )}
      </Panel>
    </>
  );
}
