"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PRIMARY_CTA, PUBLIC_NAV } from "@/config/site";
import { ButtonLink } from "@/components/buttons/Button";
import { ViewInvitationButton } from "@/components/invitation/ViewInvitationButton";
import { ResponsiveNavigation } from "./ResponsiveNavigation";
import { cn } from "@/lib/utils/cn";

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({
  brand,
  coupleLabel,
  ctaLabel,
  invitationUrl,
  invitationType,
}: {
  brand: string;
  coupleLabel: string;
  ctaLabel: string;
  invitationUrl?: string | null;
  invitationType?: "pdf" | "image" | null;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/invitation")) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-warm-ivory transition-[border-color,box-shadow] duration-500",
        scrolled ? "border-soft-border shadow-[0_8px_24px_-20px_rgb(73_54_40/0.35)]" : "border-transparent",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-[60] focus:rounded-[var(--radius-control)] focus:bg-card-surface focus:px-4 focus:py-2 focus:text-support"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-[76px] lg:px-10">
        <Link href="/" className="group flex min-w-0 items-baseline gap-2 shrink-0" aria-label={`${coupleLabel} — home`}>
          <span className="truncate font-serif text-[21px] leading-none text-dark-walnut transition-colors group-hover:text-primary xs:text-[23px] sm:text-[26px]">
            {brand}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {PUBLIC_NAV.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative py-2 text-[13px] tracking-[0.08em] uppercase transition-colors",
                      "after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:bg-primary after:transition-transform after:duration-500",
                      active ? "text-dark-walnut after:scale-x-100" : "text-secondary-text after:scale-x-0 hover:text-dark-walnut hover:after:scale-x-100",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <ViewInvitationButton
            invitationUrl={invitationUrl}
            invitationType={invitationType}
            size="sm"
            variant="primary"
            className="hidden md:inline-flex px-3 sm:px-4"
          />
          <ButtonLink href={PRIMARY_CTA.href} size="sm" variant="filled" className="hidden md:inline-flex px-3 sm:px-4">
            {ctaLabel}
          </ButtonLink>
          <ResponsiveNavigation
            pathname={pathname}
            brand={brand}
            ctaLabel={ctaLabel}
            invitationUrl={invitationUrl}
            invitationType={invitationType}
          />
        </div>
      </div>
    </header>
  );
}
