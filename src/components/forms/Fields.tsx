import { useId } from "react";
import { cn } from "@/lib/utils/cn";

const CONTROL =
  "block w-full rounded-[var(--radius-control)] border border-soft-border bg-card-surface px-4 text-[16px] text-dark-walnut placeholder:text-secondary-text/60 transition-[border-color,box-shadow] duration-200 hover:border-champagne-gold focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-secondary aria-[invalid=true]:focus:ring-secondary/15";

export function controlClasses(className?: string) {
  return cn(CONTROL, className);
}

type FieldShellProps = {
  label: string;
  hint?: React.ReactNode;
  error?: string | null;
  required?: boolean;
  className?: string;
  optionalLabel?: boolean;
};

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  optionalLabel,
  className,
  children,
}: FieldShellProps & { id: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-support text-dark-walnut">
        {label}
        {required ? <span className="text-secondary" aria-hidden> *</span> : null}
        {optionalLabel && !required ? <span className="text-secondary-text"> (optional)</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-[13px] leading-snug text-secondary-text">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[13px] leading-snug text-secondary">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint: unknown, error: unknown) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export function TextInput({
  label,
  hint,
  error,
  className,
  optionalLabel,
  id: idProp,
  ...rest
}: FieldShellProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={rest.required} optionalLabel={optionalLabel} className={className}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={controlClasses("h-12")}
        {...rest}
      />
    </FieldShell>
  );
}

export function TextArea({
  label,
  hint,
  error,
  className,
  optionalLabel,
  id: idProp,
  rows = 4,
  ...rest
}: FieldShellProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={rest.required} optionalLabel={optionalLabel} className={className}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={controlClasses("min-h-[96px] resize-y py-3 leading-relaxed")}
        {...rest}
      />
    </FieldShell>
  );
}

export function SelectInput({
  label,
  hint,
  error,
  className,
  optionalLabel,
  options,
  placeholder,
  id: idProp,
  ...rest
}: FieldShellProps &
  React.SelectHTMLAttributes<HTMLSelectElement> & {
    options: ReadonlyArray<{ value: string; label: string }>;
    placeholder?: string;
  }) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} required={rest.required} optionalLabel={optionalLabel} className={className}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={controlClasses("h-12 appearance-none pr-10")}
          {...rest}
        >
          {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg aria-hidden viewBox="0 0 12 8" className="pointer-events-none absolute top-1/2 right-4 h-2 w-3 -translate-y-1/2 text-muted-gold">
          <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </div>
    </FieldShell>
  );
}

export function Checkbox({
  label,
  error,
  className,
  id: idProp,
  ...rest
}: { label: React.ReactNode; error?: string | null; className?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const auto = useId();
  const id = idProp ?? auto;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <span className="relative mt-[3px] flex size-[18px] shrink-0">
          <input
            id={id}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className="peer size-[18px] cursor-pointer appearance-none rounded-[4px] border border-muted-gold bg-card-surface transition-colors checked:border-dark-walnut checked:bg-dark-walnut focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            {...rest}
          />
          <svg
            aria-hidden
            viewBox="0 0 12 10"
            className="pointer-events-none absolute top-[4px] left-[3px] hidden h-2.5 w-3 text-soft-cream peer-checked:block"
          >
            <path d="M1 5.2 4.3 8.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </span>
        <span className="text-support text-secondary-text">{label}</span>
      </label>
      {error ? (
        <p id={`${id}-error`} role="alert" className="pl-[30px] text-[13px] text-secondary">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormMessage({ tone, children }: { tone: "error" | "success" | "info"; children: React.ReactNode }) {
  const tones = {
    error: "border-secondary/30 bg-secondary/[0.06] text-secondary",
    success: "border-muted-sage/40 bg-muted-sage/10 text-dark-walnut",
    info: "border-soft-border bg-soft-cream text-secondary-text",
  };
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("rounded-[var(--radius-control)] border px-4 py-3 text-support", tones[tone])}>
      {children}
    </div>
  );
}
