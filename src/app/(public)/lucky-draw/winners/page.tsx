import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/buttons/Button";
import { Reveal } from "@/components/motion/Reveal";
import { SIDE_LABEL } from "@/config/site";
import { getAppSettings, getPublicWinners, getWeddingSettings } from "@/services/content";
import { formatInZone } from "@/lib/utils/datetime";

export const revalidate = 30;
export const metadata: Metadata = { title: "Lucky Draw Winners" };

/**
 * Public announcement. Shows only position, approved display name, side and
 * announcement date — data comes from get_public_winners(), which never
 * returns contact details.
 */
export default async function WinnersPage() {
  const [result, wedding, app] = await Promise.all([getPublicWinners(), getWeddingSettings(), getAppSettings()]);
  const announced = result.status === "announced" && (result.winners?.length ?? 0) > 0;
  const date = formatInZone(result.announced_at, wedding.timezone, { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <PageHeader
        align="center"
        eyebrow="Wedding Lucky Draw"
        title={announced ? "Congratulations to our winners" : "The winners will be announced soon"}
        intro={
          announced
            ? `Drawn at random from every verified guest${date ? ` · Announced ${date}` : ""}.`
            : "The lucky draw takes place at the wedding. Check back here for the announcement."
        }
      />
      <section aria-label="Winners" className="pb-20 lg:pb-28">
        <Container width="default">
          {announced ? (
            <ol className="grid gap-px overflow-hidden rounded-[var(--radius-control)] border border-soft-border bg-soft-border sm:grid-cols-2 lg:grid-cols-3">
              {result.winners!.map((w, i) => (
                <Reveal as="li" key={w.position} delay={Math.min(i, 10) * 0.05} className="flex items-center gap-6 bg-card-surface px-6 py-7 sm:px-8">
                  <span className="w-14 shrink-0 text-numeral text-[44px] leading-none text-champagne-gold">{String(w.position).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <p className="truncate font-serif text-[26px] leading-tight text-dark-walnut">{w.display_name}</p>
                    <p className="mt-1 text-meta text-secondary-text">{SIDE_LABEL[w.side]}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          ) : (
            <Reveal className="mx-auto flex max-w-[520px] flex-col items-center text-center">
              <span aria-hidden className="block h-16 w-px bg-champagne-gold" />
              <p className="mt-8 text-body text-secondary-text">
                Only guests who registered and verified at the venue by scanning the event QR code are eligible.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {app.registration_open ? (
                  <ButtonLink href="/register" variant="filled">
                    Register now
                  </ButtonLink>
                ) : null}
                <ButtonLink href="/verify" variant="primary">
                  Verify at the venue
                </ButtonLink>
              </div>
            </Reveal>
          )}
        </Container>
      </section>
    </>
  );
}
