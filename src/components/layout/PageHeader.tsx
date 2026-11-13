import { Container } from "./Container";
import { Eyebrow } from "@/components/typography/Headings";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils/cn";

/** Interior page masthead — consistent across all public pages. */
export function PageHeader({
  eyebrow,
  title,
  intro,
  align = "left",
  children,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "left" | "center";
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("pt-12 pb-12 sm:pt-16 sm:pb-16 lg:pt-24 lg:pb-20", className)}>
      <Container width="wide">
        <Reveal className={cn("max-w-[760px]", align === "center" && "mx-auto text-center")}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-5 text-display text-balance text-dark-walnut">{title}</h1>
          {intro ? <div className={cn("mt-6 max-w-[60ch] text-body text-secondary-text text-pretty", align === "center" && "mx-auto")}>{intro}</div> : null}
          {children}
        </Reveal>
        <div aria-hidden className={cn("mt-12 h-px bg-soft-border sm:mt-16", align === "center" && "mx-auto max-w-[200px] bg-champagne-gold")} />
      </Container>
    </header>
  );
}
