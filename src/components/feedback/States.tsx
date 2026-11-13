import { cn } from "@/lib/utils/cn";

export function LoadingState({ label = "Loading", className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn("flex flex-col items-center justify-center gap-4 py-24", className)}>
      <span className="relative block h-px w-24 overflow-hidden bg-soft-border">
        <span className="absolute inset-y-0 left-0 w-1/3 animate-[loading-bar_1.4s_ease-in-out_infinite] bg-primary" />
      </span>
      <span className="text-meta text-secondary-text">{label}</span>
      <style>{`@keyframes loading-bar{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto flex max-w-[480px] flex-col items-center gap-3 py-16 text-center", className)}>
      <span aria-hidden className="mb-2 block h-10 w-px bg-champagne-gold" />
      <p className="text-h2 text-dark-walnut">{title}</p>
      {description ? <div className="text-support text-secondary-text">{description}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "Please refresh the page or try again in a moment.",
  action,
  className,
}: {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div role="alert" className={cn("mx-auto flex max-w-[480px] flex-col items-center gap-3 py-16 text-center", className)}>
      <span aria-hidden className="mb-2 block h-10 w-px bg-secondary/60" />
      <p className="text-h2 text-dark-walnut">{title}</p>
      <div className="text-support text-secondary-text">{description}</div>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
