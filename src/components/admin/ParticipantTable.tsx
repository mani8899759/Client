import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Badge, TableWrap, td, th } from "./ui";
import { SIDE_LABEL } from "@/config/site";
import { formatMobile } from "@/lib/validation/participant";
import { formatDateTimeInZone } from "@/lib/utils/datetime";
import { filtersToQuery, type ParticipantFilters } from "@/services/admin/participants";
import type { Participant } from "@/types/database";

function SortHeader({
  label,
  column,
  filters,
  basePath,
}: {
  label: string;
  column: ParticipantFilters["sort"];
  filters: ParticipantFilters;
  basePath: string;
}) {
  const active = filters.sort === column;
  const nextDir = active && filters.dir === "desc" ? "asc" : "desc";
  return (
    <th className={th} aria-sort={active ? (filters.dir === "asc" ? "ascending" : "descending") : "none"}>
      <Link href={`${basePath}${filtersToQuery(filters, { sort: column, dir: nextDir, page: 1 })}`} className="inline-flex items-center gap-1 hover:text-dark-walnut">
        {label}
        {active ? (
          filters.dir === "asc" ? (
            <ArrowUp className="size-3" aria-hidden />
          ) : (
            <ArrowDown className="size-3" aria-hidden />
          )
        ) : null}
      </Link>
    </th>
  );
}

/** Private participant table — only rendered inside the authenticated admin area. */
export function ParticipantTable({
  rows,
  filters,
  basePath,
  timezone,
  actions,
}: {
  rows: Participant[];
  filters: ParticipantFilters;
  basePath: string;
  timezone: string;
  actions?: (p: Participant) => React.ReactNode;
}) {
  return (
    <TableWrap>
      <thead>
        <tr>
          <SortHeader label="Participant" column="full_name" filters={filters} basePath={basePath} />
          <th className={th}>Mobile</th>
          <th className={th}>Email</th>
          <th className={th}>Side</th>
          <SortHeader label="Registered" column="registered_at" filters={filters} basePath={basePath} />
          <th className={th}>Verification</th>
          <SortHeader label="Verified at" column="verified_at" filters={filters} basePath={basePath} />
          {actions ? (
            <th className={th}>
              <span className="sr-only">Actions</span>
            </th>
          ) : null}
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => (
          <tr key={p.id} className="hover:bg-soft-cream/60">
            <td className={td}>
              <Link href={`/admin/participants/${p.id}`} className="text-[15px] underline-offset-4 hover:underline">
                {p.full_name}
              </Link>
              {p.registration_status === "cancelled" ? (
                <Badge tone="danger" className="ml-2">
                  Cancelled
                </Badge>
              ) : null}
            </td>
            <td className={`${td} whitespace-nowrap tabular-nums`}>{formatMobile(p.normalized_mobile)}</td>
            <td className={`${td} max-w-[220px] truncate text-secondary-text`}>{p.email}</td>
            <td className={`${td} whitespace-nowrap`}>{SIDE_LABEL[p.side]}</td>
            <td className={`${td} whitespace-nowrap text-secondary-text`}>{formatDateTimeInZone(p.registered_at, timezone)}</td>
            <td className={td}>
              <Badge tone={p.verification_status === "verified" ? "success" : "neutral"}>{p.verification_status === "verified" ? "Verified" : "Pending"}</Badge>
            </td>
            <td className={`${td} whitespace-nowrap text-secondary-text`}>{p.verified_at ? formatDateTimeInZone(p.verified_at, timezone) : "—"}</td>
            {actions ? <td className={`${td} text-right whitespace-nowrap`}>{actions(p)}</td> : null}
          </tr>
        ))}
      </tbody>
    </TableWrap>
  );
}

export function ParticipantFilterBar({ filters, basePath, hideVerification = false }: { filters: ParticipantFilters; basePath: string; hideVerification?: boolean }) {
  const select =
    "h-10 rounded-[var(--radius-control)] border border-soft-border bg-card-surface px-3 text-[14px] text-dark-walnut focus:border-primary focus:outline-none";
  return (
    <form method="get" action={basePath} className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto]" role="search">
      <label className="sr-only" htmlFor="pq">
        Search participants
      </label>
      <input id="pq" name="q" defaultValue={filters.q} placeholder="Search name, mobile or email" className={`${select} w-full`} maxLength={80} />
      <select name="side" defaultValue={filters.side} className={select} aria-label="Side">
        <option value="">All sides</option>
        <option value="bride">Bride Side</option>
        <option value="groom">Groom Side</option>
      </select>
      {!hideVerification ? (
        <select name="verification" defaultValue={filters.verification} className={select} aria-label="Verification status">
          <option value="">Any verification</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
        </select>
      ) : (
        <input type="hidden" name="verification" value={filters.verification} />
      )}
      <select name="registration" defaultValue={filters.registration} className={select} aria-label="Registration status">
        <option value="">Any registration</option>
        <option value="registered">Registered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <div className="flex gap-2">
        <button type="submit" className="h-10 flex-1 rounded-[var(--radius-control)] border border-dark-walnut bg-dark-walnut px-5 text-[14px] text-soft-cream">
          Apply
        </button>
        <Link href={basePath} className="flex h-10 items-center rounded-[var(--radius-control)] px-3 text-[13px] text-secondary-text hover:text-dark-walnut">
          Reset
        </Link>
      </div>
    </form>
  );
}
