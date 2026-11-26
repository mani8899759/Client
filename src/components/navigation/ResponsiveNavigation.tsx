"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { PRIMARY_CTA } from "@/config/site";
import { OFFICIAL_LOGO } from "@/config/logo";
import { ButtonLink } from "@/components/buttons/Button";
import { ViewInvitationButton } from "@/components/invitation/ViewInvitationButton";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Complete mobile navigation items as requested */
const MOBILE_NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/story", label: "Our Story" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/live", label: "Live" },
  { href: "/locations", label: "Location" },
  { href: "/invitation", label: "View Invitation" },
  { href: "/register", label: "Win a Special Gift" },
] as const;

/** Mobile/tablet navigation: full-screen vertical overlay with zero horizontal scrolling. */
export function ResponsiveNavigation({
  pathname,
  brand,
  familyHeading,
  ctaLabel,
  invitationUrl,
  invitationType,
  logoUrl = OFFICIAL_LOGO.src,
  logoEnabled = true,
}: {
  pathname: string;
  brand: string;
  familyHeading?: string | null;
  ctaLabel: string;
  invitationUrl?: string | null;
  invitationType?: "pdf" | "image" | null;
  logoUrl?: string | null;
  logoEnabled?: boolean;
}) {
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const setOpen = (next: boolean) => setOpenPath(next ? pathname : null);
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target only exists after mount
  useEffect(() => setMounted(true), []);

  // Clean body scroll locking and keyboard accessibility
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>("a, button");
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>("a")?.focus(), 50);
    const trigger = triggerRef.current;
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        aria-label="Open navigation menu"
        className="flex size-11 items-center justify-center rounded-[var(--radius-control)] text-dark-walnut hover:bg-soft-cream lg:hidden cursor-pointer active:scale-95 transition-transform"
      >
        <Menu className="size-6 text-dark-walnut" strokeWidth={2} aria-hidden />
        <span className="sr-only">Open menu</span>
      </button>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  id="mobile-navigation"
                  ref={panelRef}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Site navigation"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
                  className="fixed inset-0 z-[100] flex h-full h-[100dvh] w-full max-w-full flex-col bg-warm-ivory box-border overflow-x-hidden overflow-y-auto lg:hidden"
                >
                  {/* Top Bar: Brand on left, Close button on right */}
                  <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6 border-b border-soft-border/80 bg-warm-ivory/95 backdrop-blur-sm sticky top-0 z-10 box-border">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      {logoEnabled && logoUrl ? (
                        <Image
                          src={logoUrl}
                          alt={OFFICIAL_LOGO.alt}
                          width={OFFICIAL_LOGO.width}
                          height={OFFICIAL_LOGO.height}
                          className="h-[18px] w-auto shrink-0 object-contain"
                        />
                      ) : null}
                      <div className="flex flex-col min-w-0">
                        {familyHeading ? (
                          <span className="font-sans text-[10px] tracking-[0.16em] uppercase text-muted-gold leading-tight truncate">
                            {familyHeading}
                          </span>
                        ) : null}
                        <span className="font-serif text-[17px] xs:text-[19px] sm:text-[24px] leading-tight text-dark-walnut font-medium truncate">
                          {brand}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Close menu"
                      className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-control)] hover:bg-soft-cream text-dark-walnut cursor-pointer active:scale-95 transition-transform"
                    >
                      <X className="size-6" strokeWidth={2} aria-hidden />
                      <span className="sr-only">Close menu</span>
                    </button>
                  </div>

                  {/* Navigation content in single vertical column */}
                  <nav aria-label="Mobile Navigation" className="flex flex-1 flex-col justify-between overflow-y-auto px-4 pt-4 pb-8 sm:px-6 box-border">
                    <ul className="flex flex-col divide-y divide-soft-border/70">
                      {MOBILE_NAV_ITEMS.map((item, i) => {
                        const active = isActive(pathname, item.href);
                        return (
                          <motion.li
                            key={item.href}
                            initial={reduce ? false : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.03 + i * 0.03, duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
                          >
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                "flex min-h-[52px] items-center justify-between py-3.5 font-serif text-[24px] xs:text-[26px] sm:text-[28px] leading-tight transition-colors",
                                active ? "text-primary font-medium" : "text-dark-walnut hover:text-primary",
                              )}
                            >
                              <span>{item.label}</span>
                              <span aria-hidden className="font-sans text-[12px] tracking-[0.16em] text-muted-gold font-normal">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                            </Link>
                          </motion.li>
                        );
                      })}
                    </ul>

                    {/* Prominent Action Buttons */}
                    <div className="mt-8 flex flex-col gap-3 pt-4 border-t border-soft-border/60">
                      <ViewInvitationButton
                        invitationUrl={invitationUrl}
                        invitationType={invitationType}
                        size="lg"
                        variant="primary"
                        className="w-full min-h-[48px] text-center justify-center"
                        onClick={() => setOpen(false)}
                      />
                      <ButtonLink
                        href={PRIMARY_CTA.href}
                        variant="filled"
                        size="lg"
                        className="w-full min-h-[48px] text-center justify-center font-medium"
                        onClick={() => setOpen(false)}
                      >
                        {ctaLabel}
                      </ButtonLink>
                      <ButtonLink
                        href="/lucky-draw/winners"
                        variant="ghost"
                        size="md"
                        className="w-full text-center justify-center text-dark-walnut hover:text-primary"
                        onClick={() => setOpen(false)}
                      >
                        View Lucky Draw Winners
                      </ButtonLink>
                      <p className="text-center text-[12px] text-secondary-text mt-1">
                        Join our wedding gift draw for a chance to win a special gift.
                      </p>
                    </div>
                  </nav>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
