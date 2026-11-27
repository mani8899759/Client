import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { VerifyForm } from "@/components/forms/VerifyForm";
import { getAppSettings, getWeddingSettings } from "@/services/content";
import { coupleNames } from "@/lib/utils/names";
import { isServiceRoleConfigured } from "@/lib/env";
import { getAdminContext } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Registration Verification",
  description: "Verify your wedding guest registration using your registered mobile number.",
  robots: { index: false },
};

/** Landing page encoded in the common event QR code. Mobile-first, single task. */
export default async function VerifyPage() {
  const [app, wedding, adminCtx] = await Promise.all([
    getAppSettings(),
    getWeddingSettings(),
    getAdminContext().catch(() => null),
  ]);
  const names = coupleNames(wedding);
  const enabled = app.verification_enabled && isServiceRoleConfigured();

  return (
    <section className="pt-8 pb-20 sm:pt-14 lg:pt-16 lg:pb-24">
      <Container width="narrow">
        <div className="mx-auto max-w-[520px]">
          <p className="text-center text-meta text-muted-gold">
            {names.isPlaceholder ? "Wedding Celebration" : names.joined}
          </p>
          <h1 className="mt-3 text-center text-h1 text-dark-walnut sm:text-[38px] sm:leading-[1.1]">
            Registration Verification
          </h1>
          <p className="mt-3 text-center text-body text-secondary-text">
            Enter your registered mobile number to verify your registration.
          </p>

          <div className="mt-8">
            <VerifyForm
              enabled={enabled}
              staffUser={adminCtx ? { name: adminCtx.profile.full_name, role: adminCtx.profile.role } : null}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
