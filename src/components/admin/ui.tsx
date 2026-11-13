import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-soft-border pb-6 sm:flex-row sm:items-end sm:justify-between lg:mb-10">
      <div className="min-w-0">
        {eyebrow ? <p className="text-meta text-muted-gold">{eyebrow}</p> : null}
        <h1 className="mt-2 text-h1 text-dark-walnut sm:text-[36px] sm:leading-[1.1]">{title}</h1>
        {description ? <div className="mt-2 max-w-[70ch] text-support text-secondary-text">{description}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-[var(--radius-control)] border border-soft-border bg-card-surface", className)}>
      {title ? (
        <div className="flex flex-col gap-3 border-b border-soft-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="font-serif text-[22px] leading-tight text-dark-walnut">{title}</h2>
            {description ? <div className="mt-1 text-[13px] text-secondary-text">{description}</div> : null}
          </div>
          {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
        </div>
      ) : null}
      <div className={cn("p-5 sm:p-6", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  href?: string;
  tone?: "default" | "accent";
}) {
  const body = (
    <>
      <p className="text-meta text-secondary-text">{label}</p>
      <p className={cn("mt-3 text-numeral text-[40px] leading-none", tone === "accent" ? "text-primary" : "text-dark-walnut")}>{value}</p>
      {hint ? <p className="mt-2 text-[13px] text-secondary-text">{hint}</p> : null}
    </>
  );
  const cls = "block rounded-[var(--radius-control)] border border-soft-border bg-card-surface p-5 transition-colors";
  return href ? (
    <Link href={href} className={cn(cls, "hover:border-champagne-gold")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

const BADGE_TONES = {
  neutral: "border-soft-border text-secondary-text bg-soft-cream",
  success: "border-muted-sage/50 text-[#5b634d] bg-muted-sage/10",
  warning: "border-champagne-gold/60 text-[#7a5c1e] bg-champagne-gold/10",
  danger: "border-secondary/40 text-secondary bg-secondary/5",
  dark: "border-dark-walnut text-soft-cream bg-dark-walnut",
} as const;

export function Badge({ tone = "neutral", children, className }: { tone?: keyof typeof BADGE_TONES; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 items-center rounded-full border px-2.5 text-[12px] whitespace-nowrap", BADGE_TONES[tone], className)}>{children}</span>
  );
}

/** Horizontal-scroll wrapper so wide tables never cause page overflow. */
export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-5 overflow-x-auto sm:-mx-6">
      <table className="w-full min-w-[720px] border-collapse text-left text-[14px]">{children}</table>
    </div>
  );
}

export const th = "border-b border-soft-border px-5 py-3 text-meta font-normal text-secondary-text sm:px-6 whitespace-nowrap";
export const td = "border-b border-soft-border/70 px-5 py-3.5 align-middle text-dark-walnut sm:px-6";

export function Pagination({ page, pageCount, makeHref }: { page: number; pageCount: number; makeHref: (p: number) => string }) {
  if (pageCount <= 1) return null;
  const link = "flex h-9 min-w-9 items-center justify-center rounded-[var(--radius-control)] border px-3 text-[13px]";
  return (
    <nav aria-label="Pagination" className="mt-5 flex items-center justify-between gap-3">
      <p className="text-[13px] text-secondary-text">
        Page {page} of {pageCount}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={makeHref(page - 1)} className={cn(link, "border-soft-border bg-card-surface hover:border-champagne-gold")}>
            Previous
          </Link>
        ) : (
          <span className={cn(link, "border-soft-border/60 text-secondary-text/50")}>Previous</span>
        )}
        {page < pageCount ? (
          <Link href={makeHref(page + 1)} className={cn(link, "border-soft-border bg-card-surface hover:border-champagne-gold")}>
            Next
          </Link>
        ) : (
          <span className={cn(link, "border-soft-border/60 text-secondary-text/50")}>Next</span>
        )}
      </div>
    </nav>
  );
}
