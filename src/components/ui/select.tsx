import * as React from "react";

import { cn } from "@/lib/utils";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: readonly SelectOption[];
  hint?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, hint, error, id, className, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id ?? generatedId;
    const hintId = hint ? `${selectId}-hint` : undefined;
    const errorId = error ? `${selectId}-error` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-ink break-words">
          {label}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              "min-h-target w-full appearance-none rounded-[var(--radius-control)] border bg-surface py-2.5 pr-10 pl-3.5 text-base text-ink",
              "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-calm)]",
              "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:opacity-60",
              error ? "border-danger" : "border-line-strong",
              className,
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink-secondary"
            aria-hidden="true"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 7.5L10 12l4.5-4.5" />
            </svg>
          </span>
        </div>
        {hint && !error ? (
          <p id={hintId} className="text-xs text-ink-secondary break-words">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="flex items-start gap-1.5 text-xs font-medium text-danger break-words">
            <span aria-hidden="true">!</span>
            <span>{error}</span>
          </p>
        ) : null}
      </div>
    );
  },
);
Select.displayName = "Select";
