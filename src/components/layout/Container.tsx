import { cn } from "@/lib/utils/cn";

type Width = "narrow" | "default" | "wide";

const WIDTHS: Record<Width, string> = {
  narrow: "max-w-[720px]",
  default: "max-w-[1200px]",
  wide: "max-w-[1440px]",
};

/** Consistent content widths with a 16px mobile gutter. */
export function Container({
  width = "default",
  className,
  children,
  as: Tag = "div",
}: {
  width?: Width;
  className?: string;
  children: React.ReactNode;
  as?: "div" | "section" | "header" | "footer" | "nav" | "main";
}) {
  return <Tag className={cn("mx-auto w-full max-w-full px-4 box-border sm:px-6 lg:px-10", WIDTHS[width], className)}>{children}</Tag>;
}

/** Vertical rhythm for page sections (64px mobile → 80/112px desktop). */
export function Section({
  id,
  className,
  children,
  tone = "ivory",
  labelledBy,
}: {
  id?: string;
  className?: string;
  children: React.ReactNode;
  tone?: "ivory" | "cream" | "walnut";
  labelledBy?: string;
}) {
  const tones = {
    ivory: "bg-warm-ivory",
    cream: "bg-soft-cream",
    walnut: "bg-dark-walnut text-soft-cream",
  };
  return (
    <section id={id} aria-labelledby={labelledBy} className={cn("py-16 sm:py-20 lg:py-28", tones[tone], className)}>
      {children}
    </section>
  );
}
