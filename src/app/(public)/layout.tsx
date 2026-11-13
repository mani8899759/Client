import { SiteHeader } from "@/components/navigation/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getWeddingSettings } from "@/services/content";
import { coupleNames } from "@/lib/utils/names";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const wedding = await getWeddingSettings();
  return (
    <>
      <SiteHeader
        brand={wedding.website_title ?? coupleNames(wedding).joined}
        coupleLabel={coupleNames(wedding).joined}
        ctaLabel={wedding.cta_primary_label ?? "Register Now"}
      />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter wedding={wedding} />
    </>
  );
}
