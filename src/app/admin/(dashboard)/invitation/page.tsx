import { requireAdminPage } from "@/lib/auth/admin";
import { AdminPageHeader } from "@/components/admin/ui";
import { InvitationAdminForm } from "./InvitationAdminForm";
import { DEFAULT_WEDDING } from "@/services/content/defaults";
import { publicEnv } from "@/lib/env";
import type { WeddingSettings } from "@/types/database";

export const metadata = { title: "Digital Invitation Management" };

export default async function InvitationAdminPage() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("wedding_settings").select("*").single<WeddingSettings>();
  const w = { ...DEFAULT_WEDDING, ...(data ?? {}) };

  return (
    <>
      <AdminPageHeader
        eyebrow="Website"
        title="Digital Invitation Management"
        description="Configure your interactive digital wedding invitation experience, background music track, original PDF/card document, section visibility, and WhatsApp sharing."
      />
      <InvitationAdminForm wedding={w} siteUrl={publicEnv.siteUrl} />
    </>
  );
}
