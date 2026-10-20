import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, hint, error, id, className, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const hintId = hint ? `${inputId}-hint` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-ink break-words"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "min-h-target w-full rounded-[var(--radius-control)] border bg-surface px-3.5 py-2.5 text-base text-ink",
            "placeholder:text-ink-muted",
            "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-calm)]",
            "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:opacity-60",
            error ? "border-danger" : "border-line-strong",
            className,
          )}
          {...props}
        />
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
TextField.displayName = "TextField";
