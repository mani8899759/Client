import Link from "next/link";
import { Badge, TableWrap, td, th } from "./ui";
import { formatDateTimeInZone } from "@/lib/utils/datetime";
import { formatMobile } from "@/lib/validation/participant";
import type { InterestedFilters, InterestedRow } from "@/services/admin/interested";

export function InterestedFilterBar({
  filters,
  basePath,
  events,
}: {
  filters: InterestedFilters;
  basePath: string;
  events: Array<{ slug: string; name: string }>;
}) {
  const select =
    "h-10 rounded-[var(--radius-control)] border border-soft-border bg-card-surface px-3 text-[14px] text-dark-walnut focus:border-primary focus:outline-none";

  return (
    <form method="get" action={basePath} className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]" role="search">
      <label className="sr-only" htmlFor="iq">
        Search interested guests
      </label>
      <input
        id="iq"
        name="q"
        defaultValue={filters.q}
        placeholder="Search guest name, email, phone or event"
        className={`${select} w-full`}
        maxLength={80}
      />

      <select name="event" defaultValue={filters.event ?? "all"} className={select} aria-label="Filter by Event">
        <option value="all">All Events</option>
        {events.map((e) => (
          <option key={e.slug} value={e.slug}>
            {e.name}
          </option>
        ))}
      </select>

      <select name="registered" defaultValue={filters.registered ?? "all"} className={select} aria-label="Registration status">
        <option value="all">All Guests</option>
        <option value="registered">Registered Only</option>
        <option value="unregistered">Not Registered</option>
      </select>

      <select name="sort" defaultValue={filters.sort ?? "date_desc"} className={select} aria-label="Sort order">
        <option value="date_desc">Latest first</option>
        <option value="date_asc">Oldest first</option>
      </select>

      <div className="flex gap-2">
        <button
          type="submit"
          className="h-10 flex-1 rounded-[var(--radius-control)] border border-dark-walnut bg-dark-walnut px-5 text-[14px] text-soft-cream transition-colors hover:bg-dark-walnut/90"
        >
          Filter
        </button>
        <Link
          href={basePath}
          className="flex h-10 items-center rounded-[var(--radius-control)] px-3 text-[13px] text-secondary-text hover:text-dark-walnut"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}

export function InterestedTable({
  rows,
  timezone,
}: {
  rows: InterestedRow[];
  timezone: string;
}) {
  return (
    <TableWrap>
      <thead>
        <tr>
          <th className={th}>Guest Name</th>
          <th className={th}>Email</th>
          <th className={th}>Phone Number</th>
          <th className={th}>Interested Event</th>
          <th className={th}>Date &amp; Time (IST)</th>
          <th className={th}>Registration Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="hover:bg-soft-cream/60 transition-colors">
            <td className={td}>
              {row.participant_id ? (
                <Link
                  href={`/admin/participants/${row.participant_id}`}
                  className="font-medium text-dark-walnut underline-offset-4 hover:underline"
                >
                  {row.guest_name}
                </Link>
              ) : (
                <span className="text-secondary-text italic">{row.guest_name}</span>
              )}
            </td>
            <td className={`${td} max-w-[200px] truncate text-secondary-text`}>
              {row.guest_email || "—"}
            </td>
            <td className={`${td} whitespace-nowrap tabular-nums text-secondary-text`}>
              {row.guest_phone ? formatMobile(row.guest_phone) : "—"}
            </td>
            <td className={`${td} font-medium text-dark-walnut`}>
              {row.event_name}
            </td>
            <td className={`${td} whitespace-nowrap text-secondary-text`}>
              {formatDateTimeInZone(row.created_at, timezone) ?? "—"}
            </td>
            <td className={td}>
              {row.is_registered ? (
                <Badge tone="success">Registered</Badge>
              ) : (
                <Badge tone="neutral">Not Registered</Badge>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </TableWrap>
  );
}
