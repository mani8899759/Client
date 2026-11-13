import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Button variants
 *  - primary: gold hairline outline, walnut text (signature CTA)
 *  - filled:  dark walnut fill, cream text (decisive / submit actions)
 *  - ghost:   text with an underline that draws on hover
 *  - danger:  terracotta outline for destructive admin actions
 * Gold is used for borders/accents rather than as a text-on-gold fill so every
 * label meets WCAG AA contrast.
 */
export type ButtonVariant = "primary" | "filled" | "gold" | "ghost" | "danger" | "light";
export type ButtonSize = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-sans font-normal tracking-[0.02em] whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[var(--ease-editorial)] disabled:pointer-events-none disabled:opacity-50 select-none";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "border border-primary/70 bg-transparent text-dark-walnut hover:border-primary hover:bg-card-surface hover:shadow-[var(--shadow-soft)]",
  filled: "border border-dark-walnut bg-dark-walnut text-soft-cream hover:bg-[#3b2b1f] hover:shadow-[var(--shadow-soft)]",
  // Champagne gold with walnut text (4.7:1 — passes WCAG AA).
  gold: "border border-champagne-gold bg-champagne-gold text-dark-walnut hover:border-muted-gold hover:bg-[#bb9860] hover:shadow-[var(--shadow-soft)]",
  ghost:
    "px-0! h-auto! border-0 bg-transparent text-dark-walnut underline decoration-champagne-gold decoration-1 underline-offset-[6px] hover:decoration-primary hover:text-primary",
  danger: "border border-secondary/60 bg-transparent text-secondary hover:bg-secondary hover:text-soft-cream",
  light: "border border-soft-cream/50 bg-transparent text-soft-cream hover:border-soft-cream hover:bg-soft-cream/10",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-6 text-[14px]",
  lg: "h-12 px-8 text-[15px]",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

export function Button({ variant = "primary", size = "md", loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export const PrimaryButton = (p: Omit<ButtonProps, "variant">) => <Button variant="primary" {...p} />;
export const FilledButton = (p: Omit<ButtonProps, "variant">) => <Button variant="filled" {...p} />;
export const GhostButton = (p: Omit<ButtonProps, "variant">) => <Button variant="ghost" {...p} />;

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  external,
  ...rest
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  if (href.startsWith("/api/")) {
    // File downloads and other API endpoints: plain anchor, no client-side navigation/prefetch.
    return (
      <a href={href} className={buttonClasses(variant, size, className)} {...rest}>
        {children}
      </a>
    );
  }
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClasses(variant, size, className)} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
