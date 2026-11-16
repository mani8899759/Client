"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookHeart,
  CalendarDays,
  ExternalLink,
  FileText,
  ClipboardList,
  Gift,
  Home,
  MapPin,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  QrCode,
  Radio,
  ScrollText,
  Settings,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; also?: string[] };

const NAV: Array<{ group: string | null; items: NavItem[] }> = [
  { group: null, items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  {
    group: "Website",
    items: [
      { href: "/admin/invitation", label: "Digital Invitation", icon: Mail },
      { href: "/admin/content", label: "Website Content", icon: FileText },
      { href: "/admin/homepage", label: "Homepage", icon: Home },
      { href: "/admin/story", label: "Our Love Story", icon: BookHeart },
      { href: "/admin/events", label: "Wedding Events", icon: CalendarDays },
      { href: "/admin/venues", label: "Venues & Locations", icon: MapPin },
      { href: "/admin/gallery", label: "Gallery & Media", icon: Images, also: ["/admin/media"] },
    ],
  },
  {
    group: "Guests",
    items: [
      { href: "/admin/registrations", label: "Registrations", icon: ClipboardList },
      { href: "/admin/participants", label: "Participants", icon: Users },
      { href: "/admin/verification", label: "QR & Verification", icon: QrCode },
    ],
  },
  {
    group: "Lucky Draw",
    items: [
      { href: "/admin/lucky-draw", label: "Lucky Draw", icon: Ticket },
      { href: "/admin/winners", label: "Winners", icon: Gift },
    ],
  },
  {
    group: "System",
    items: [
      { href: "/admin/live", label: "Live Streaming", icon: Radio },
      { href: "/admin/settings", label: "Settings", icon: Settings },
      { href: "/admin/audit", label: "Audit Logs", icon: ScrollText },
    ],
  },
];

function active(pathname: string, item: NavItem) {
  if (item.href === "/admin") return pathname === "/admin";
  return [item.href, ...(item.also ?? [])].some((h) => pathname === h || pathname.startsWith(`${h}/`));
}

function NavList({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Admin" className="flex flex-col gap-6">
      {NAV.map((g, gi) => (
        <div key={gi}>
          {g.group ? <p className="mb-2 px-3 text-meta text-secondary-text/80">{g.group}</p> : null}
          <ul className="flex flex-col gap-0.5">
            {g.items.map((item) => {
              const isActive = active(pathname, item);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex h-10 items-center gap-3 rounded-[var(--radius-control)] px-3 text-[14px] transition-colors",
                      isActive ? "bg-card-surface text-dark-walnut shadow-[inset_2px_0_0_var(--color-primary)]" : "text-secondary-text hover:bg-card-surface/70 hover:text-dark-walnut",
                    )}
                  >
                    <Icon className={cn("size-4", isActive ? "text-primary" : "text-muted-gold")} strokeWidth={1.5} aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({
  brand,
  adminName,
  role,
  signOut,
  children,
}: {
  brand: string;
  adminName: string;
  role: string;
  signOut: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const footer = (
    <div className="border-t border-soft-border pt-4">
      <p className="truncate px-3 text-support text-dark-walnut">{adminName}</p>
      <p className="px-3 text-meta text-secondary-text">{role}</p>
      <div className="mt-3 flex flex-col gap-0.5">
        <Link href="/" target="_blank" className="flex h-9 items-center gap-3 rounded-[var(--radius-control)] px-3 text-[13px] text-secondary-text hover:bg-card-surface hover:text-dark-walnut">
          <ExternalLink className="size-4" strokeWidth={1.5} aria-hidden /> View website
        </Link>
        <form action={signOut}>
          <button type="submit" className="flex h-9 w-full items-center gap-3 rounded-[var(--radius-control)] px-3 text-[13px] text-secondary-text hover:bg-card-surface hover:text-dark-walnut">
            <LogOut className="size-4" strokeWidth={1.5} aria-hidden /> Logout
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100svh] bg-warm-ivory lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-[100svh] flex-col justify-between overflow-y-auto border-r border-soft-border bg-soft-cream px-3 py-6 lg:flex">
        <div>
          <Link href="/admin" className="mb-8 block px-3">
            <span className="font-serif text-[24px] leading-none text-dark-walnut">{brand}</span>
            <span className="mt-1 block text-meta text-secondary-text">Administration</span>
          </Link>
          <NavList pathname={pathname} />
        </div>
        {footer}
      </aside>

      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-soft-border bg-soft-cream px-4 lg:hidden">
        <Link href="/admin" className="font-serif text-[22px] text-dark-walnut">
          {brand}
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="-mr-2 flex size-11 items-center justify-center" aria-expanded={open} aria-controls="admin-mobile-nav">
          <Menu className="size-5" strokeWidth={1.5} aria-hidden />
          <span className="sr-only">Open admin menu</span>
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-dark-walnut/30" onClick={() => setOpen(false)} />
          <div id="admin-mobile-nav" className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col justify-between overflow-y-auto bg-soft-cream px-3 py-4 shadow-[var(--shadow-lift)]">
            <div>
              <div className="mb-6 flex items-center justify-between px-3">
                <span className="font-serif text-[22px]">{brand}</span>
                <button type="button" onClick={() => setOpen(false)} className="-mr-2 flex size-10 items-center justify-center">
                  <X className="size-5" strokeWidth={1.5} aria-hidden />
                  <span className="sr-only">Close admin menu</span>
                </button>
              </div>
              <NavList pathname={pathname} />
            </div>
            <div className="mt-8">{footer}</div>
          </div>
        </div>
      ) : null}

      <main id="admin-main" className="min-w-0 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </main>
    </div>
  );
}
