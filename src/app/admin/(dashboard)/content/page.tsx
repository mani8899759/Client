import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader } from "@/components/admin/ui";
import { ContentForm } from "./ContentForm";
import { DEFAULT_WEDDING } from "@/services/content/defaults";
import { utcIsoToZonedLocal } from "@/lib/utils/datetime";
import type { WeddingSettings } from "@/types/database";

export const metadata = { title: "Website Content" };

export default async function ContentPage() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("wedding_settings").select("*").single<WeddingSettings>();
  const w = { ...DEFAULT_WEDDING, ...(data ?? {}) };
  const local = utcIsoToZonedLocal(w.wedding_date, w.timezone); // YYYY-MM-DDTHH:mm
  return (
    <>
      <AdminPageHeader
        eyebrow="Website"
        title="Website Content"
        description="Couple names, website title, wedding date and ceremony time, button labels, footer and contact details. These settings feed every page."
      />
      <ContentForm
        wedding={w}
        weddingDay={local.slice(0, 10)}
        ceremonyTime={w.wedding_time_confirmed ? local.slice(11, 16) : ""}
        weddingEndLocal={utcIsoToZonedLocal(w.wedding_end_at, w.timezone)}
      />
    </>
  );
}
