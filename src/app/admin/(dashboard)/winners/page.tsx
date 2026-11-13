import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader, Panel, StatCard } from "@/components/admin/ui";
import { ToggleSetting } from "@/components/admin/ToggleSetting";
import { EmptyState } from "@/components/feedback/States";
import { WinnerRow } from "./WinnerRow";
import { formatMobile } from "@/lib/validation/participant";
import { formatDateTimeInZone } from "@/lib/utils/datetime";
import type { AppSettings, LuckyDraw, LuckyDrawWinner } from "@/types/database";

export const metadata = { title: "Winners" };

type WinnerWithContact = LuckyDrawWinner & { participant: { full_name: string; side: "bride" | "groom"; normalized_mobile: string } | null };

export default async function WinnersAdminPage() {
  const { supabase } = await requireAdminPage();
  const [drawRes, appRes, tzRes] = await Promise.all([
    supabase.from("lucky_draws").select("*").eq("status", "completed").maybeSingle<LuckyDraw>(),
    supabase.from("app_settings").select("*").single<AppSettings>(),
    supabase.from("wedding_settings").select("timezone").single(),
  ]);
  const draw = drawRes.data;
  const tz = (tzRes.data as { timezone: string } | null)?.timezone ?? "Asia/Kolkata";

  let winners: WinnerWithContact[] = [];
  if (draw) {
    const { data } = await supabase
      .from("lucky_draw_winners")
      .select("*, participant:participants(full_name, side, normalized_mobile)")
      .eq("draw_id", draw.id)
      .order("winner_position");
    winners = (data as WinnerWithContact[] | null) ?? [];
  }
  const delivered = winners.filter((w) => w.gift_status === "delivered").length;
  const contacted = winners.filter((w) => w.gift_status === "contacted").length;

  return (
    <>
      <AdminPageHeader
        eyebrow="Lucky Draw"
        title="Winners"
        description={draw ? `Draw completed ${formatDateTimeInZone(draw.executed_at, tz)}. Mobile numbers are visible here only — never on the public page.` : "Winners appear here after the draw is executed."}
      />
      {draw ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Pending" value={winners.length - delivered - contacted} />
            <StatCard label="Contacted" value={contacted} />
            <StatCard label="Delivered" value={delivered} tone="accent" />
          </div>
          <Panel title="Public announcement" className="mt-6">
            <ToggleSetting
              settingKey="winners_public"
              value={appRes.data?.winners_public ?? false}
              label="Show winners on /lucky-draw/winners"
              onLabel="Published"
              offLabel="Hidden"
              confirmOn="Winners will be announced publicly (position, display name and side only)."
              confirmOff="The public page will say the winners will be announced soon."
            />
          </Panel>
          <Panel title={`${winners.length} winners`} className="mt-6">
            <ul className="flex flex-col gap-3">
              {winners.map((w) => (
                <WinnerRow key={w.id} winner={w} mobile={w.participant ? formatMobile(w.participant.normalized_mobile) : ""} />
              ))}
            </ul>
          </Panel>
        </>
      ) : (
        <Panel>
          <EmptyState
            title="No winners yet"
            description="Run the draw from the Lucky Draw screen."
            action={
              <Link href="/admin/lucky-draw" className="text-[14px] underline underline-offset-4">
                Go to Lucky Draw
              </Link>
            }
          />
        </Panel>
      )}
    </>
  );
}
