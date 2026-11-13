import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Eyebrow } from "@/components/typography/Headings";
import { ButtonLink } from "@/components/buttons/Button";
import { Reveal } from "@/components/motion/Reveal";
import { RegistrationForm } from "@/components/forms/RegistrationForm";
import { getAppSettings, getWeddingSettings } from "@/services/content";
import { coupleNames } from "@/lib/utils/names";
import { isServiceRoleConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Register", description: "Register for the wedding lucky draw." };

const STEPS = [
  "Register below and choose Bride Side or Groom Side.",
  "At the wedding, scan the common event QR code.",
  "Enter your registered mobile number to verify.",
  "Verified guests are entered into the lucky draw.",
];

export default async function RegisterPage() {
  const [app, wedding] = await Promise.all([getAppSettings(), getWeddingSettings()]);
  const names = coupleNames(wedding);
  const available = app.registration_open && isServiceRoleConfigured();

  return (
    <section className="pt-12 pb-20 sm:pt-16 lg:pt-24 lg:pb-28">
      <Container width="wide">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <Eyebrow>Wedding Lucky Draw</Eyebrow>
              <h1 className="mt-5 text-display text-balance text-dark-walnut">Join the celebration</h1>
              <p className="mt-6 text-body text-secondary-text">
                Register as a guest of {names.joined}&apos;s wedding celebration. Each guest can register once.
              </p>
              <ol className="mt-10 border-t border-soft-border">
                {STEPS.map((s, i) => (
                  <li key={s} className="flex gap-5 border-b border-soft-border py-4">
                    <span className="text-numeral text-[20px] leading-6 text-champagne-gold">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-support text-secondary-text">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>

          <div className="min-w-0 lg:col-span-7 lg:col-start-6">
            {available ? (
              <RegistrationForm consentText={app.consent_text} coupleLabel={names.joined} />
            ) : (
              <div className="rounded-[var(--radius-surface)] border border-soft-border bg-card-surface p-8 text-center sm:p-12">
                <span aria-hidden className="mx-auto block h-12 w-px bg-champagne-gold" />
                <h2 className="mt-8 text-h1 text-dark-walnut">Registration is closed</h2>
                <p className="mx-auto mt-4 max-w-[44ch] text-body text-secondary-text">
                  {app.registration_open
                    ? "Registration is not available at the moment. Please try again later."
                    : "Thank you for your interest. Registration for the wedding lucky draw is no longer open."}
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <ButtonLink href="/lucky-draw/winners" variant="filled">
                    Lucky draw winners
                  </ButtonLink>
                  <ButtonLink href="/" variant="primary">
                    Back to home
                  </ButtonLink>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
