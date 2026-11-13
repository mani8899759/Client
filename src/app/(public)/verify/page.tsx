import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { VerifyForm } from "@/components/forms/VerifyForm";
import { getAppSettings, getWeddingSettings } from "@/services/content";
import { coupleNames } from "@/lib/utils/names";
import { isServiceRoleConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Guest Verification", robots: { index: false } };

/** Landing page encoded in the common event QR code. Mobile-first, single task. */
export default async function VerifyPage() {
  const [app, wedding] = await Promise.all([getAppSettings(), getWeddingSettings()]);
  const names = coupleNames(wedding);
  const enabled = app.verification_enabled && isServiceRoleConfigured();

  return (
    <section className="pt-10 pb-20 sm:pt-16 lg:pt-20 lg:pb-28">
      <Container width="narrow">
        <div className="mx-auto max-w-[520px]">
          <p className="text-center text-meta text-muted-gold">{names.isPlaceholder ? "Wedding celebration" : names.joined}</p>
          <h1 className="mt-5 text-center text-h1 text-dark-walnut sm:text-[40px] sm:leading-[1.1]">Wedding Guest Verification</h1>
          <p className="mt-4 text-center text-body text-secondary-text">
            Scan the event QR code and enter your registered mobile number to confirm your participation.
          </p>
          <div className="mt-10">
            <VerifyForm enabled={enabled} />
          </div>
        </div>
      </Container>
    </section>
  );
}
