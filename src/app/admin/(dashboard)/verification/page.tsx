import Link from "next/link";
import QRCode from "qrcode";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Pagination, Panel, StatCard } from "@/components/admin/ui";
import { ParticipantFilterBar, ParticipantTable } from "@/components/admin/ParticipantTable";
import { ToggleSetting } from "@/components/admin/ToggleSetting";
import { ConfirmActionButton } from "@/components/admin/forms";
import { ButtonLink } from "@/components/buttons/Button";
import { EmptyState } from "@/components/feedback/States";
import { CopyLink } from "./CopyLink";
import { manualVerify } from "../participants/actions";
import { ADMIN_PAGE_SIZE } from "@/config/site";
import { publicEnv } from "@/lib/env";
import { filtersToQuery, listParticipants, parseParticipantFilters } from "@/services/admin/participants";
import { cn } from "@/lib/utils/cn";
import type { AppSettings, DashboardStats } from "@/types/database";

export const metadata = { title: "QR & Verification" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function VerificationPage({ searchParams }: Props) {
  const { supabase } = await requireAdminPage();
  const sp = await searchParams;
  // The tab is the verification filter itself, so every link/sort/page keeps it.
  const tab = sp.verification === "verified" ? "verified" : "pending";
  const filters = parseParticipantFilters({ ...sp, verification: tab, registration: "registered" });
  const url = `${publicEnv.siteUrl}/verify`;

  const [statsRes, settingsRes, list, tzRes, drawRes, qrSvg] = await Promise.all([
    supabase.rpc("admin_dashboard_stats"),
    supabase.from("app_settings").select("*").single<AppSettings>(),
    listParticipants(supabase, filters),
    supabase.from("wedding_settings").select("timezone").single(),
    supabase.from("lucky_draws").select("id").eq("status", "completed").maybeSingle(),
    QRCode.toString(url, { type: "svg", errorCorrectionLevel: "H", margin: 1, color: { dark: "#493628", light: "#FFFCF7" } }),
  ]);
  const s = statsRes.data as DashboardStats | null;
  const app = settingsRes.data;
  const tz = (tzRes.data as { timezone: string } | null)?.timezone ?? "Asia/Kolkata";
  const drawDone = !!drawRes.data;
  const pageCount = Math.max(1, Math.ceil(list.count / ADMIN_PAGE_SIZE));
  const base = "/admin/verification";
  const tabHref = (t: string) => `${base}?verification=${t}`;

  return (
    <>
      <AdminPageHeader
        eyebrow="Guests"
        title="QR & Verification"
        description="One common QR code for every guest. Guests scan it at the venue and enter their registered mobile number — no OTP, no individual codes."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Panel title="Common event QR code">
          <div
            className="mx-auto aspect-square w-full max-w-[280px] rounded-[var(--radius-control)] border border-soft-border bg-card-surface p-3 [&_svg]:h-full [&_svg]:w-full"
            role="img"
            aria-label={`QR code linking to ${url}`}
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <div className="mt-5">
            <CopyLink url={url} />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <ButtonLink href="/api/admin/qr?format=png" variant="primary" size="sm">
              Download PNG
            </ButtonLink>
            <ButtonLink href="/api/admin/qr?format=pdf" variant="filled" size="sm">
              Print-ready PDF
            </ButtonLink>
          </div>
          <div className="mt-4 border-t border-soft-border">
            <ToggleSetting
              settingKey="verification_enabled"
              value={app?.verification_enabled ?? false}
              label="Verification endpoint"
              onLabel="Active"
              offLabel="Inactive"
              description="When inactive, the QR page shows “Verification currently unavailable”."
              confirmOn="Guests will be able to verify by scanning the QR code and entering their mobile number."
              confirmOff="Guests will no longer be able to verify until you activate it again."
            />
          </div>
          {publicEnv.siteUrl.startsWith("http://localhost") ? (
            <p className="mt-2 text-[12px] text-secondary">NEXT_PUBLIC_SITE_URL points to localhost — set it to the production domain before printing.</p>
          ) : null}
        </Panel>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard label="Verified" value={s?.total_verified ?? "—"} tone="accent" />
            <StatCard label="Pending" value={s?.total_pending ?? "—"} />
            <StatCard label="Bride Side verified" value={s?.bride_verified ?? "—"} />
            <StatCard label="Groom Side verified" value={s?.groom_verified ?? "—"} />
          </div>
          {s ? (
            <p className="text-[13px] text-secondary-text">
              Last 24 hours: {s.failed_verifications_24h} attempts with an unregistered number · {s.rate_limited_24h} throttled requests.
            </p>
          ) : null}

          <Panel
            title={tab === "verified" ? "Verified participants" : "Pending participants"}
            actions={
              <div className="flex rounded-[var(--radius-control)] border border-soft-border p-0.5" role="tablist">
                {(["pending", "verified"] as const).map((t) => (
                  <Link
                    key={t}
                    href={tabHref(t)}
                    role="tab"
                    aria-selected={tab === t}
                    className={cn("rounded-[4px] px-3 py-1.5 text-[13px] capitalize", tab === t ? "bg-dark-walnut text-soft-cream" : "text-secondary-text hover:text-dark-walnut")}
                  >
                    {t}
                  </Link>
                ))}
              </div>
            }
          >
            <ParticipantFilterBar filters={filters} basePath={base} hideVerification />
            {list.rows.length ? (
              <>
                <ParticipantTable
                  rows={list.rows}
                  filters={filters}
                  basePath={base}
                  timezone={tz}
                  actions={
                    tab === "pending" && !drawDone
                      ? (p) => (
                          <ConfirmActionButton
                            action={manualVerify}
                            fields={{ id: p.id }}
                            label="Verify"
                            title={`Verify ${p.full_name} manually?`}
                            description="Records your name, the time and the reason in the audit log."
                            requireReason
                            size="sm"
                          />
                        )
                      : undefined
                  }
                />
                <Pagination
                  page={filters.page}
                  pageCount={pageCount}
                  makeHref={(pg) => `${base}${filtersToQuery(filters, { page: pg })}`}
                />
              </>
            ) : (
              <EmptyState title={tab === "verified" ? "No one has verified yet" : "No pending participants"} />
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
