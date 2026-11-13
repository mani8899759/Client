import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader } from "@/components/admin/ui";
import { HomepageForm } from "./HomepageForm";
import { DEFAULT_WEDDING } from "@/services/content/defaults";
import { aiRef } from "@/config/ai-assets";
import type { WeddingSettings } from "@/types/database";

export const metadata = { title: "Homepage" };

export default async function HomepageAdminPage() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("wedding_settings").select("*").single<WeddingSettings>();
  const w = { ...DEFAULT_WEDDING, ...(data ?? {}) };
  const fallbacks = {
    hero_image_path: aiRef("hero"),
    welcome_image_path: aiRef("couple-editorial-portrait"),
    bride_image_path: aiRef("bride-detail"),
    groom_image_path: aiRef("groom-detail"),
    secondary_image_path: aiRef("wedding-environment"),
  };
  return (
    <>
      <AdminPageHeader
        eyebrow="Website"
        title="Homepage"
        description={
          <>
            Hero, welcome, couple introduction and supporting imagery. Images left empty use the AI illustration for that slot (see{" "}
            <Link href="/admin/media" className="underline underline-offset-4">
              Media
            </Link>
            ) until you upload a real photograph.
          </>
        }
      />
      <HomepageForm wedding={w} fallbacks={fallbacks} />
    </>
  );
}
