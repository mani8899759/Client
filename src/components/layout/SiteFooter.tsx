import Link from "next/link";
import { PUBLIC_NAV } from "@/config/site";
import { Container } from "./Container";
import { weddingSchedule } from "@/lib/utils/wedding";
import { coupleNames } from "@/lib/utils/names";
import { HashtagBadge } from "@/components/common/HashtagBadge";
import type { WeddingSettings } from "@/types/database";

/** Dark Walnut footer — the one place the deep tone is used as a full surface. */
export function SiteFooter({ wedding }: { wedding: WeddingSettings }) {
  const names = coupleNames(wedding);
  const date = weddingSchedule(wedding)?.dateOnlyLabel ?? null;
  const year = new Date().getFullYear();
  const socials = wedding.social_links.filter((s) => s?.url && /^https:\/\//.test(s.url));

  return (
    <footer className="bg-dark-walnut text-soft-border">
      <Container width="wide" className="pt-16 pb-10 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-serif text-[36px] leading-[1.1] text-soft-cream sm:text-[48px]">
              {names.groom}
              <span className="mx-3 text-champagne-gold italic">&amp;</span>
              {names.bride}
            </p>
            <p className="mt-4 text-meta text-champagne-gold">{date ?? "Date to be announced"}</p>
            {wedding.footer_note ? <p className="mt-6 max-w-[42ch] text-support text-soft-border/80">{wedding.footer_note}</p> : null}
            {wedding.hashtag_homepage_visible !== false ? (
              <div className="mt-5 flex items-center gap-2.5">
                <span className="text-[12px] uppercase tracking-widest text-champagne-gold/75">Hashtag:</span>
                <HashtagBadge hashtag={wedding.hashtag || "#Kanmani"} variant="footer" />
              </div>
            ) : null}
          </div>

          <nav aria-label="Footer" className="lg:col-span-3 lg:col-start-7">
            <p className="text-meta text-champagne-gold">Explore</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 lg:grid-cols-1">
              {PUBLIC_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-support text-soft-border transition-colors hover:text-soft-cream">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/register" className="text-support text-soft-border transition-colors hover:text-soft-cream">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/lucky-draw/winners" className="text-support text-soft-border transition-colors hover:text-soft-cream">
                  Lucky Draw Winners
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <div>
              <p className="text-meta text-champagne-gold">Contact</p>
              <address className="mt-5 flex flex-col gap-2 text-support not-italic">
                {wedding.contact_name ? <span className="text-soft-cream">{wedding.contact_name}</span> : null}
                {wedding.contact_phone ? (
                  <a href={`tel:${wedding.contact_phone.replace(/[^\d+]/g, "")}`} className="hover:text-soft-cream">
                    {wedding.contact_phone}
                  </a>
                ) : null}
                {wedding.contact_email ? (
                  <a href={`mailto:${wedding.contact_email}`} className="break-all hover:text-soft-cream">
                    {wedding.contact_email}
                  </a>
                ) : null}
                <div className="mt-3 pt-3 border-t border-soft-cream/15 flex flex-col gap-1.5">
                  <span className="text-soft-cream font-medium">Sruthi &amp; Suraj</span>
                  <a href="tel:+919390808327" className="hover:text-soft-cream">
                    +91 9390808327
                  </a>
                  <a href="tel:+918919492032" className="hover:text-soft-cream">
                    +91 8919492032
                  </a>
                </div>
              </address>
            </div>
            {socials.length ? (
              <div className="mt-8">
                <p className="text-meta text-champagne-gold">Follow</p>
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  {socials.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-support hover:text-soft-cream">
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-soft-cream/10 pt-6 text-[12px] text-soft-border/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {names.joined}. All rights reserved.
          </p>
          <Link href="/verify" className="hover:text-soft-cream">
            Guest verification
          </Link>
        </div>
      </Container>
    </footer>
  );
}
