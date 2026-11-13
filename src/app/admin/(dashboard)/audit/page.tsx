import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Pagination, Panel, TableWrap, td, th } from "@/components/admin/ui";
import { EmptyState } from "@/components/feedback/States";
import { auditActionLabel } from "@/services/admin/audit";
import { formatDateTimeInZone } from "@/lib/utils/datetime";
import type { AdminProfile, AuditLog } from "@/types/database";

export const metadata = { title: "Audit Log" };

const PAGE = 50;
const GROUPS: Record<string, string> = {
  participant: "Participants",
  lucky: "Lucky draw",
  winner: "Winners",
  settings: "Settings",
  content: "Content",
  stream: "Live streams",
};

function groupFilter(group: string): string | null {
  switch (group) {
    case "participant":
      return "participant%";
    case "lucky":
      return "lucky_draw%";
    case "winner":
      return "winner%";
    case "stream":
      return "live_streams%";
    default:
      return null;
  }
}

function Diff({ before, after }: { before: Record<string, unknown> | null; after: Record<string, unknown> | null }) {
  const keys = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])].filter(
    (k) => !["updated_at", "created_at", "id"].includes(k) && JSON.stringify(before?.[k]) !== JSON.stringify(after?.[k]),
  );
  if (!keys.length) return null;
  const show = (v: unknown) => (v === null || v === undefined ? "—" : typeof v === "object" ? JSON.stringify(v) : String(v));
  return (
    <details className="mt-1">
      <summary className="cursor-pointer text-[12px] text-secondary-text">Details</summary>
      <dl className="mt-2 grid gap-1 text-[12px]">
        {keys.slice(0, 12).map((k) => (
          <div key={k} className="grid grid-cols-[120px_1fr] gap-2">
            <dt className="text-secondary-text">{k}</dt>
            <dd className="break-all">
              {before ? <span className="text-secondary line-through decoration-secondary/50">{show(before[k])}</span> : null}
              {before && after ? " → " : null}
              {after ? <span>{show(after[k])}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string; group?: string }> }) {
  const { supabase } = await requireAdminPage();
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const group = sp.group && sp.group in GROUPS ? sp.group : "";

  let q = supabase.from("audit_logs").select("*", { count: "exact" }).order("created_at", { ascending: false });
  const pattern = groupFilter(group);
  if (pattern) q = q.like("action", pattern);
  if (group === "settings") q = q.or("action.like.registration.%,action.like.verification.%,action.like.winners.%,action.eq.settings.update");
  if (group === "content") q = q.or("action.like.%.delete,action.eq.wedding_settings.update");
  const [{ data, count }, adminsRes, tzRes] = await Promise.all([
    q.range((page - 1) * PAGE, page * PAGE - 1),
    supabase.from("admin_profiles").select("user_id, full_name"),
    supabase.from("wedding_settings").select("timezone").single(),
  ]);
  const logs = (data as AuditLog[] | null) ?? [];
  const names = new Map(((adminsRes.data as Pick<AdminProfile, "user_id" | "full_name">[] | null) ?? []).map((a) => [a.user_id, a.full_name]));
  const tz = (tzRes.data as { timezone: string } | null)?.timezone ?? "Asia/Kolkata";
  const pageCount = Math.max(1, Math.ceil((count ?? 0) / PAGE));

  return (
    <>
      <AdminPageHeader eyebrow="System" title="Audit Log" description="Append-only record of administrative actions. Entries cannot be edited or deleted." />
      <nav aria-label="Filter" className="mb-5 flex flex-wrap gap-2">
        {[["", "All"], ...Object.entries(GROUPS)].map(([k, label]) => (
          <Link
            key={k}
            href={k ? `/admin/audit?group=${k}` : "/admin/audit"}
            aria-current={group === k ? "page" : undefined}
            className={`h-8 rounded-full border px-3 text-[13px] leading-[30px] ${group === k ? "border-dark-walnut bg-dark-walnut text-soft-cream" : "border-soft-border bg-card-surface text-secondary-text hover:border-champagne-gold"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
      <Panel>
        {logs.length ? (
          <>
            <TableWrap>
              <thead>
                <tr>
                  <th className={th}>When</th>
                  <th className={th}>Action</th>
                  <th className={th}>By</th>
                  <th className={th}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="align-top">
                    <td className={`${td} whitespace-nowrap text-secondary-text`}>{formatDateTimeInZone(l.created_at, tz)}</td>
                    <td className={td}>
                      {l.entity_type === "participant" && l.entity_id ? (
                        <Link href={`/admin/participants/${l.entity_id}`} className="underline-offset-4 hover:underline">
                          {auditActionLabel(l.action)}
                        </Link>
                      ) : (
                        auditActionLabel(l.action)
                      )}
                      <Diff before={l.before_data} after={l.after_data} />
                    </td>
                    <td className={`${td} text-secondary-text`}>{l.admin_id ? (names.get(l.admin_id) ?? "Former admin") : "System"}</td>
                    <td className={`${td} max-w-[280px] text-secondary-text`}>{l.reason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <Pagination page={page} pageCount={pageCount} makeHref={(p) => `/admin/audit?${new URLSearchParams({ ...(group ? { group } : {}), page: String(p) })}`} />
          </>
        ) : (
          <EmptyState title="No entries" />
        )}
      </Panel>
    </>
  );
}
