import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Badge, Panel } from "@/components/admin/ui";
import { ConfirmActionButton } from "@/components/admin/forms";
import { CorrectionForm } from "./CorrectionForm";
import { manualVerify, revertVerification, setRegistrationStatus } from "../actions";
import { GENDER_LABEL, SIDE_LABEL } from "@/config/site";
import { formatMobile } from "@/lib/validation/participant";
import { formatDateTimeInZone } from "@/lib/utils/datetime";
import { auditActionLabel } from "@/services/admin/audit";
import { PARTICIPANT_COLUMNS } from "@/services/admin/participants";
import type { AuditLog, Checkin, Participant } from "@/types/database";

export const metadata = { title: "Participant" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-soft-border py-3 last:border-b-0 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="text-[13px] text-secondary-text">{label}</dt>
      <dd className="text-[15px] break-words text-dark-walnut">{children}</dd>
    </div>
  );
}

export default async function ParticipantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase, profile } = await requireAdminPage();

  const [pRes, cRes, aRes, tzRes, drawRes] = await Promise.all([
    supabase.from("participants").select(PARTICIPANT_COLUMNS).eq("id", id).maybeSingle<Participant>(),
    supabase.from("checkins").select("*").eq("participant_id", id).maybeSingle<Checkin>(),
    supabase.from("audit_logs").select("*").eq("entity_id", id).order("created_at", { ascending: false }).limit(50),
    supabase.from("wedding_settings").select("timezone").single(),
    supabase.from("lucky_draws").select("id").eq("status", "completed").maybeSingle(),
  ]);
  const p = pRes.data;
  if (!p) notFound();
  const checkin = cRes.data;
  const history = (aRes.data as AuditLog[] | null) ?? [];
  const tz = (tzRes.data as { timezone: string } | null)?.timezone ?? "Asia/Kolkata";
  const drawDone = !!drawRes.data;

  return (
    <>
      <Link href="/admin/participants" className="mb-6 inline-flex items-center gap-2 text-[13px] text-secondary-text hover:text-dark-walnut">
        <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden /> Participants
      </Link>
      <AdminPageHeader
        eyebrow={SIDE_LABEL[p.side]}
        title={p.full_name}
        description={
          <span className="flex flex-wrap gap-2">
            <Badge tone={p.verification_status === "verified" ? "success" : "neutral"}>{p.verification_status === "verified" ? "Verified" : "Pending verification"}</Badge>
            <Badge tone={p.registration_status === "registered" ? "neutral" : "danger"}>{p.registration_status === "registered" ? "Registered" : "Cancelled"}</Badge>
          </span>
        }
        actions={
          drawDone ? null : (
            <>
              {p.verification_status === "pending" && p.registration_status === "registered" ? (
                <ConfirmActionButton
                  action={manualVerify}
                  fields={{ id: p.id }}
                  label="Verify manually"
                  title="Verify this participant manually?"
                  description="Use when a guest is present but cannot verify by QR. Your name, the time and the reason are recorded."
                  variant="filled"
                  requireReason
                />
              ) : null}
              {p.verification_status === "verified" ? (
                <ConfirmActionButton
                  action={revertVerification}
                  fields={{ id: p.id }}
                  label="Revert verification"
                  title="Revert to pending?"
                  description="The check-in record is removed. This is recorded in the audit log."
                  tone="danger"
                  requireReason
                />
              ) : null}
              <ConfirmActionButton
                action={setRegistrationStatus}
                fields={{ id: p.id, status: p.registration_status === "registered" ? "cancelled" : "registered" }}
                label={p.registration_status === "registered" ? "Cancel registration" : "Reinstate registration"}
                title={p.registration_status === "registered" ? "Cancel this registration?" : "Reinstate this registration?"}
                description={
                  p.registration_status === "registered"
                    ? "Cancelled participants cannot verify and are excluded from the lucky draw."
                    : "The participant becomes eligible again, subject to verification."
                }
                tone={p.registration_status === "registered" ? "danger" : "default"}
                requireReason
              />
            </>
          )
        }
      />

      {drawDone ? (
        <p className="mb-6 rounded-[var(--radius-control)] border border-champagne-gold/50 bg-card-surface p-4 text-[14px] text-secondary-text">
          The lucky draw has been completed, so verification and registration status are locked.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title="Registration details" className="lg:col-span-3">
          <dl>
            <Row label="Mobile">{formatMobile(p.normalized_mobile)}</Row>
            <Row label="Email">{p.email}</Row>
            <Row label="Gender">{GENDER_LABEL[p.gender]}</Row>
            <Row label="Address">{p.address}</Row>
            <Row label="Side">{SIDE_LABEL[p.side]}</Row>
            <Row label="Registered">{formatDateTimeInZone(p.registered_at, tz)}</Row>
            <Row label="Consent">
              Given {formatDateTimeInZone(p.consent_timestamp, tz)} · policy {p.consent_policy_version}
            </Row>
          </dl>
        </Panel>
        <Panel title="Check-in" className="lg:col-span-2">
          {checkin ? (
            <dl>
              <Row label="Verified at">{formatDateTimeInZone(checkin.verified_at, tz)}</Row>
              <Row label="Method">{checkin.verification_method === "common_qr_mobile_match" ? "Common QR + mobile match" : "Manual (administrator)"}</Row>
              {checkin.reason ? <Row label="Reason">{checkin.reason}</Row> : null}
            </dl>
          ) : (
            <p className="text-support text-secondary-text">Not checked in yet.</p>
          )}
        </Panel>
      </div>

      <div className="mt-6">
        <CorrectionForm participant={p} isOwner={profile.role === "owner"} />
      </div>

      <Panel title="History" className="mt-6" description="Audited administrative changes for this participant.">
        {history.length ? (
          <ol className="divide-y divide-soft-border">
            {history.map((h) => (
              <li key={h.id} className="flex flex-col gap-1 py-3 first:pt-0 sm:flex-row sm:items-baseline sm:justify-between">
                <span>
                  <span className="text-[14px] text-dark-walnut">{auditActionLabel(h.action)}</span>
                  {h.reason ? <span className="block text-[13px] text-secondary-text">“{h.reason}”</span> : null}
                </span>
                <span className="text-[12px] text-secondary-text">{formatDateTimeInZone(h.created_at, tz)}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-support text-secondary-text">No changes recorded.</p>
        )}
      </Panel>
    </>
  );
}
