"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { PRIMARY_CTA, PUBLIC_NAV } from "@/config/site";
import { ButtonLink } from "@/components/buttons/Button";
import { ViewInvitationButton } from "@/components/invitation/ViewInvitationButton";
import { cn } from "@/lib/utils/cn";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

/** Mobile/tablet navigation: full-height sheet with large serif links. */
export function ResponsiveNavigation({
  pathname,
  brand,
  ctaLabel,
  invitationUrl,
  invitationType,
}: {
  pathname: string;
  brand: string;
  ctaLabel: string;
  invitationUrl?: string | null;
  invitationType?: "pdf" | "image" | null;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target only exists after mount
  useEffect(() => setMounted(true), []);

  // Close mobile navigation drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
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
      document.body.style.overflow = previous;
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
                  initial={reduce ? false : { opacity: 0, x: "100%" }}
                  animate={{ opacity: 1, x: "0%" }}
                  exit={reduce ? undefined : { opacity: 0, x: "100%" }}
                  transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
                  className="fixed inset-0 z-[70] flex flex-col bg-warm-ivory lg:hidden"
                >
                  <div className="flex h-16 items-center justify-between px-4 sm:px-6 border-b border-soft-border/80">
                    <span className="font-serif text-[22px] sm:text-[24px] leading-none text-dark-walnut">{brand}</span>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="-mr-2 flex size-11 items-center justify-center rounded-[var(--radius-control)] hover:bg-soft-cream text-dark-walnut cursor-pointer active:scale-95 transition-transform"
                    >
                      <X className="size-6" strokeWidth={1.75} aria-hidden />
                      <span className="sr-only">Close menu</span>
                    </button>
                  </div>
                  <nav aria-label="Mobile" className="flex flex-1 flex-col justify-between overflow-y-auto px-4 pt-6 pb-8 sm:px-6">
                    <ul className="flex flex-col">
                      {PUBLIC_NAV.map((item, i) => {
                        const active = isActive(pathname, item.href);
                        return (
                          <motion.li
                            key={item.href}
                            initial={reduce ? false : { opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 + i * 0.04, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                            className="border-b border-soft-border"
                          >
                            <Link
                              href={item.href}
                              onClick={() => setOpen(false)}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                "flex items-center justify-between py-3.5 sm:py-4 font-serif text-[26px] sm:text-[30px] leading-tight transition-colors",
                                active ? "text-primary font-medium" : "text-dark-walnut hover:text-primary",
                              )}
                            >
                              {item.label}
                              <span aria-hidden className="text-meta text-muted-gold">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                            </Link>
                          </motion.li>
                        );
                      })}
                    </ul>
                    <div className="mt-8 flex flex-col gap-3">
                      <ViewInvitationButton
                        invitationUrl={invitationUrl}
                        invitationType={invitationType}
                        size="lg"
                        variant="primary"
                        className="w-full text-center"
                        onClick={() => setOpen(false)}
                      />
                      <ButtonLink href={PRIMARY_CTA.href} variant="filled" size="lg" className="w-full text-center" onClick={() => setOpen(false)}>
                        {ctaLabel}
                      </ButtonLink>
                      <p className="text-center text-[12px] text-secondary-text">
                        Join our wedding gift draw for a chance to win a special gift.
                      </p>
                      <ButtonLink href="/lucky-draw/winners" variant="ghost" size="md" className="w-full text-center" onClick={() => setOpen(false)}>
                        Lucky Draw Winners
                      </ButtonLink>
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
