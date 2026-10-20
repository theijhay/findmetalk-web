"use client";

import * as React from "react";

import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label: string;
  description?: string;
  onLabel?: string;
  offLabel?: string;
}

/**
 * Accessible switch control (spec 9.3, 9.6). Pairs colour with a check icon
 * and explicit state text so colour is never the only signal.
 */
export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      onCheckedChange,
      label,
      description,
      onLabel,
      offLabel,
      disabled,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const switchId = id ?? generatedId;
    const descId = description ? `${switchId}-desc` : undefined;

    return (
      <div className={cn("flex items-center justify-between gap-4", className)}>
        <div className="min-w-0 flex-1">
          <label
            htmlFor={switchId}
            className="block cursor-pointer text-base font-medium text-ink break-words"
          >
            {label}
          </label>
          {description ? (
            <p id={descId} className="mt-0.5 text-sm text-ink-secondary break-words">
              {description}
            </p>
          ) : null}
        </div>
        <button
          ref={ref}
          id={switchId}
          type="button"
          role="switch"
          aria-checked={checked}
          aria-describedby={descId}
          disabled={disabled}
          onClick={() => onCheckedChange?.(!checked)}
          className={cn(
            "group inline-flex min-h-target shrink-0 items-center gap-2 rounded-[var(--radius-pill)] px-2 py-1.5",
            "border transition-colors duration-[var(--duration-fast)] ease-[var(--ease-calm)]",
            "disabled:pointer-events-none disabled:opacity-50",
            checked
              ? "border-good bg-good text-on-good"
              : "border-line-strong bg-surface-sunken text-ink-secondary",
          )}
          {...props}
        >
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-[var(--radius-pill)]",
              "transition-transform duration-[var(--duration-fast)] ease-[var(--ease-calm)]",
              checked
                ? "translate-x-0.5 bg-on-good text-good"
                : "bg-surface text-ink-muted border border-line",
            )}
            aria-hidden="true"
          >
            {checked ? (
              <CheckIcon className="h-3.5 w-3.5" />
            ) : (
              <span className="h-2 w-2 rounded-[var(--radius-pill)] bg-ink-muted" />
            )}
          </span>
          {onLabel && offLabel ? (
            <span className="pr-1.5 text-xs font-semibold tracking-wide uppercase">
              {checked ? onLabel : offLabel}
            </span>
          ) : null}
        </button>
      </div>
    );
  },
);
Switch.displayName = "Switch";
