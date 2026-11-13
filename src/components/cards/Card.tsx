import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  children,
  padded = true,
  as: Tag = "div",
  elevated = false,
}: {
  className?: string;
  children: React.ReactNode;
  padded?: boolean;
  as?: "div" | "section" | "article" | "li";
  elevated?: boolean;
}) {
  return (
    <Tag
      className={cn(
        "rounded-[var(--radius-control)] border border-soft-border bg-card-surface",
        elevated && "shadow-[var(--shadow-soft)]",
        padded && "p-6 sm:p-8",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
