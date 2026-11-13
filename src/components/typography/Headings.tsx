import { cn } from "@/lib/utils/cn";

export function Eyebrow({ children, className, tone = "gold" }: { children: React.ReactNode; className?: string; tone?: "gold" | "muted" | "light" }) {
  const tones = { gold: "text-muted-gold", muted: "text-secondary-text", light: "text-champagne-gold" };
  return <p className={cn("text-meta", tones[tone], className)}>{children}</p>;
}

export function DisplayHeading({
  children,
  className,
  as: Tag = "h1",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "p";
  id?: string;
}) {
  return (
    <Tag id={id} className={cn("text-display text-balance", className)}>
      {children}
    </Tag>
  );
}

/**
 * Section heading: eyebrow, serif title, optional intro. Left-aligned by
 * default (editorial); centred for ceremonial moments.
 */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  level = "h2",
  size = "h1",
  id,
  className,
  tone = "dark",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "left" | "center";
  level?: "h1" | "h2" | "h3";
  size?: "display" | "h1" | "h2";
  id?: string;
  className?: string;
  tone?: "dark" | "light";
}) {
  const Tag = level;
  const sizeClass = { display: "text-display", h1: "text-h1 sm:text-[36px] sm:leading-[1.12]", h2: "text-h2" }[size];
  return (
    <div className={cn("max-w-[640px]", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <Eyebrow tone={tone === "light" ? "light" : "gold"} className="mb-4">
          {eyebrow}
        </Eyebrow>
      ) : null}
      <Tag id={id} className={cn(sizeClass, "text-balance", tone === "light" ? "text-soft-cream" : "text-dark-walnut")}>
        {title}
      </Tag>
      {intro ? (
        <div className={cn("text-body mt-5 text-pretty", tone === "light" ? "text-soft-border" : "text-secondary-text")}>{intro}</div>
      ) : null}
    </div>
  );
}
