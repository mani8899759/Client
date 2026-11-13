import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Badge, Panel, StatCard, TableWrap, td, th } from "@/components/admin/ui";
import { ToggleSetting } from "@/components/admin/ToggleSetting";
import { ConfirmActionButton } from "@/components/admin/forms";
import { DrawConfigForm, ExecuteDrawButton } from "./DrawControls";
import { voidDraw } from "./actions";
import { SIDE_LABEL } from "@/config/site";
import { formatDateTimeInZone } from "@/lib/utils/datetime";
import { cn } from "@/lib/utils/cn";
import type { AppSettings, DashboardStats, LuckyDraw, LuckyDrawConfig, LuckyDrawWinner, WeddingEvent } from "@/types/database";

export const metadata = { title: "Lucky Draw" };

function Step({ n, title, done, children }: { n: number; title: string; done: boolean; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[40px_1fr] gap-4 border-b border-soft-border py-6 last:border-b-0">
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full border text-numeral text-[18px]",
          done ? "border-muted-sage bg-muted-sage/10 text-[#5b634d]" : "border-champagne-gold text-muted-gold",
        )}
      >
        {done ? "✓" : n}
      </span>
      <div className="min-w-0">
        <h3 className="font-serif text-[22px] leading-tight text-dark-walnut">{title}</h3>
        <div className="mt-3">{children}</div>
      </div>
    </li>
  );
}

export default async function LuckyDrawPage() {
  const { supabase, profile } = await requireAdminPage();
  const isOwner = profile.role === "owner";

  const [statsRes, cfgRes, appRes, drawsRes, eventsRes, tzRes] = await Promise.all([
    supabase.rpc("admin_dashboard_stats"),
    supabase.from("lucky_draw_config").select("winner_count, eligibility_rule, event_id").single<LuckyDrawConfig>(),
    supabase.from("app_settings").select("*").single<AppSettings>(),
    supabase.from("lucky_draws").select("*").order("executed_at", { ascending: false }),
    supabase.from("events").select("id, name").order("sort_order"),
    supabase.from("wedding_settings").select("timezone").single(),
  ]);
  const s = statsRes.data as DashboardStats | null;
  const cfg = cfgRes.data ?? { winner_count: 11, eligibility_rule: "verified_only" as const, event_id: null };
  const app = appRes.data;
  const draws = (drawsRes.data as LuckyDraw[] | null) ?? [];
  const events = (eventsRes.data as Pick<WeddingEvent, "id" | "name">[] | null) ?? [];
  const tz = (tzRes.data as { timezone: string } | null)?.timezone ?? "Asia/Kolkata";
  const completed = draws.find((d) => d.status === "completed") ?? null;
  const voided = draws.filter((d) => d.status === "voided");

  const verifiedOnly = cfg.eligibility_rule === "verified_only";
  const eligible = s ? (verifiedOnly ? s.total_verified : s.total_registered) : 0;
  const eligibleBride = s ? (verifiedOnly ? s.bride_verified : s.bride_registered) : 0;
  const eligibleGroom = s ? (verifiedOnly ? s.groom_verified : s.groom_registered) : 0;
  const registrationClosed = app ? !app.registration_open : false;
  const enough = eligible >= cfg.winner_count && eligible > 0;

  let winners: LuckyDrawWinner[] = [];
  if (completed) {
    const { data } = await supabase
      .from("lucky_draw_winners")
      .select("*, participant:participants(full_name, side)")
      .eq("draw_id", completed.id)
      .order("winner_position");
    winners = (data as LuckyDrawWinner[] | null) ?? [];
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Lucky Draw"
        title="Lucky draw control"
        description="Winners are selected on the server with a cryptographically secure random generator from the combined Bride Side and Groom Side pool. Results are permanent."
        actions={
          completed ? (
            <Badge tone="success">Completed {formatDateTimeInZone(completed.executed_at, tz)}</Badge>
          ) : (
            <Badge tone="warning">Not yet drawn</Badge>
          )
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Registered" value={s?.total_registered ?? "—"} />
        <StatCard label="Verified" value={s?.total_verified ?? "—"} />
        <StatCard label="Eligible" value={s ? eligible : "—"} tone="accent" hint={`${eligibleBride} Bride Side · ${eligibleGroom} Groom Side`} />
        <StatCard label="Winners" value={cfg.winner_count} hint={verifiedOnly ? "Verified participants only" : "All registered participants"} />
      </div>

      {completed ? (
        <Panel
          title="Results"
          className="mt-6"
          description={`Drawn from ${completed.eligible_count} eligible participants (${completed.eligibility_rule === "verified_only" ? "verified only" : "all registered"}).`}
          actions={
            <>
              <Link href="/admin/winners" className="inline-flex h-9 items-center rounded-[var(--radius-control)] border border-primary/70 px-4 text-[13px]">
                Manage winners
              </Link>
              {isOwner ? (
                <ConfirmActionButton
                  action={voidDraw}
                  fields={{ id: completed.id }}
                  label="Void draw"
                  title="Void this lucky draw?"
                  description="Exceptional correction only. The original result is kept in history and the audit log, the public announcement is hidden, and a new draw can then be executed."
                  tone="danger"
                  requireReason
                  reasonLabel="Reason for voiding"
                />
              ) : null}
            </>
          }
        >
          <TableWrap>
            <thead>
              <tr>
                <th className={th}>Position</th>
                <th className={th}>Winner</th>
                <th className={th}>Side</th>
                <th className={th}>Public name</th>
              </tr>
            </thead>
            <tbody>
              {winners.map((w) => (
                <tr key={w.id}>
                  <td className={`${td} text-numeral text-[22px] text-muted-gold`}>{String(w.winner_position).padStart(2, "0")}</td>
                  <td className={td}>{w.participant?.full_name}</td>
                  <td className={td}>{w.participant ? SIDE_LABEL[w.participant.side] : "—"}</td>
                  <td className={`${td} text-secondary-text`}>{w.public_display_name}</td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
          <div className="mt-6 border-t border-soft-border">
            <ToggleSetting
              settingKey="winners_public"
              value={app?.winners_public ?? false}
              label="Public announcement"
              onLabel="Published"
              offLabel="Hidden"
              description="Shows positions, display names and sides on /lucky-draw/winners. Contact details are never shown."
              confirmOn="Winners will be announced publicly on the website."
              confirmOff="The public winners page will show “announced soon” again."
            />
          </div>
        </Panel>
      ) : (
        <Panel title="Run the draw" className="mt-6">
          <ol>
            <Step n={1} title="Close registration" done={registrationClosed}>
              <p className="text-[14px] text-secondary-text">The draw can only run once registration is closed, so the eligible pool cannot change.</p>
              <div className="mt-2 max-w-[560px]">
                <ToggleSetting
                  settingKey="registration_open"
                  value={app?.registration_open ?? true}
                  label="Registration"
                  onLabel="Open"
                  offLabel="Closed"
                  confirmOff="Guests will no longer be able to register."
                  confirmOn="Guests will be able to register again."
                />
              </div>
            </Step>
            <Step n={2} title="Review eligible participants" done={enough}>
              <p className="text-[14px] text-secondary-text">
                {eligible} eligible participant{eligible === 1 ? "" : "s"} ({eligibleBride} Bride Side, {eligibleGroom} Groom Side).{" "}
                {!enough ? <span className="text-secondary">At least {cfg.winner_count} are needed for {cfg.winner_count} winners.</span> : null}
              </p>
              <Link
                href={verifiedOnly ? "/admin/participants?verification=verified&registration=registered" : "/admin/participants?registration=registered"}
                className="mt-2 inline-block text-[14px] underline underline-offset-4"
              >
                Review the eligible list
              </Link>
            </Step>
            <Step n={3} title="Configure" done>
              <DrawConfigForm config={cfg} events={events} isOwner={isOwner} />
            </Step>
            <Step n={4} title="Confirm and execute" done={false}>
              {isOwner ? (
                <ExecuteDrawButton
                  winnerCount={cfg.winner_count}
                  rule={cfg.eligibility_rule}
                  eligible={eligible}
                  disabled={!registrationClosed || !enough}
                />
              ) : (
                <p className="text-[14px] text-secondary-text">Only an owner account can execute the draw.</p>
              )}
            </Step>
          </ol>
        </Panel>
      )}

      {voided.length ? (
        <Panel title="Voided draws" className="mt-6" description="Kept permanently for transparency.">
          <ul className="divide-y divide-soft-border">
            {voided.map((d) => (
              <li key={d.id} className="py-3 text-[14px] first:pt-0">
                Executed {formatDateTimeInZone(d.executed_at, tz)} · voided {formatDateTimeInZone(d.voided_at, tz)}
                <span className="block text-[13px] text-secondary-text">“{d.void_reason}”</span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}
    </>
  );
}
