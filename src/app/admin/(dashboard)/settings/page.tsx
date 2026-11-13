import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Badge, Panel } from "@/components/admin/ui";
import { ToggleSetting } from "@/components/admin/ToggleSetting";
import { ConsentForm } from "./ConsentForm";
import type { AdminProfile, AppSettings, LuckyDrawConfig } from "@/types/database";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { supabase } = await requireAdminPage();
  const [appRes, adminsRes, cfgRes, wRes] = await Promise.all([
    supabase.from("app_settings").select("*").single<AppSettings>(),
    supabase.from("admin_profiles").select("user_id, full_name, role, is_active").order("created_at"),
    supabase.from("lucky_draw_config").select("winner_count, eligibility_rule, event_id").single<LuckyDrawConfig>(),
    supabase.from("wedding_settings").select("timezone").single(),
  ]);
  const app = appRes.data;
  const admins = (adminsRes.data as AdminProfile[] | null) ?? [];
  const cfg = cfgRes.data;
  const tz = (wRes.data as { timezone: string } | null)?.timezone ?? "Asia/Kolkata";

  return (
    <>
      <AdminPageHeader eyebrow="System" title="Settings" description="Operational switches. Every change is recorded in the audit log." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Availability" bodyClassName="divide-y divide-soft-border py-1!">
          <ToggleSetting
            settingKey="registration_open"
            value={app?.registration_open ?? false}
            label="Guest registration"
            onLabel="Open"
            offLabel="Closed"
            description="Controls the /register page."
            confirmOff="Guests will no longer be able to register."
            confirmOn="Guests will be able to register."
          />
          <ToggleSetting
            settingKey="verification_enabled"
            value={app?.verification_enabled ?? false}
            label="QR verification"
            onLabel="Active"
            offLabel="Inactive"
            description="Controls the /verify page used by the common event QR."
            confirmOn="Guests will be able to verify at the venue."
            confirmOff="Guests will not be able to verify until re-activated."
          />
          <ToggleSetting
            settingKey="winners_public"
            value={app?.winners_public ?? false}
            label="Public winner announcement"
            onLabel="Visible"
            offLabel="Hidden"
            confirmOn="Winners will be shown publicly (display name, side, position)."
            confirmOff="The winners page will say “announced soon”."
          />
          <ToggleSetting
            settingKey="live_section_visible"
            value={app?.live_section_visible ?? true}
            label="Live-stream visibility"
            onLabel="Visible"
            offLabel="Hidden"
          />
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel title="Wedding information">
            <p className="text-[14px] text-secondary-text">
              Couple names, wedding date and timezone (<span className="text-dark-walnut">{tz}</span>) are edited in{" "}
              <Link href="/admin/content" className="underline underline-offset-4">
                Content
              </Link>
              .
            </p>
          </Panel>
          <Panel title="Lucky draw configuration">
            <p className="text-[14px] text-secondary-text">
              {cfg ? (
                <>
                  <span className="text-dark-walnut">{cfg.winner_count}</span> winners ·{" "}
                  <span className="text-dark-walnut">{cfg.eligibility_rule === "verified_only" ? "verified participants only" : "all registered participants"}</span>.{" "}
                </>
              ) : null}
              Change it on the{" "}
              <Link href="/admin/lucky-draw" className="underline underline-offset-4">
                Lucky Draw
              </Link>{" "}
              screen.
            </p>
          </Panel>
          <Panel title="Administrators" description="Accounts are provisioned in Supabase (see docs/ENVIRONMENT_SETUP.md). There is no public sign-up.">
            <ul className="divide-y divide-soft-border">
              {admins.map((a) => (
                <li key={a.user_id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="text-[14px]">{a.full_name}</span>
                  <span className="flex gap-2">
                    <Badge tone={a.role === "owner" ? "dark" : "neutral"}>{a.role === "owner" ? "Owner" : "Admin"}</Badge>
                    {!a.is_active ? <Badge tone="danger">Inactive</Badge> : null}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="mt-6">
        <ConsentForm text={app?.consent_text ?? ""} version={app?.consent_policy_version ?? ""} />
      </div>
    </>
  );
}
