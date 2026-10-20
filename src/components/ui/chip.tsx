import * as React from "react";

import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  icon?: React.ReactNode;
  interactive?: boolean;
}

/**
 * Filter, interest or language chip (spec 9.2, 9.6).
 * When interactive, renders as a 44 px minimum touch target with `aria-pressed`
 * and pairs selection colour with a check icon so colour is never the only signal.
 */
export const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      selected = false,
      icon,
      interactive = true,
      className,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    if (!interactive) {
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 py-1.5 text-sm font-medium break-words",
            selected
              ? "border-accent bg-accent/15 text-ink"
              : "border-line bg-surface-sunken text-ink-secondary",
            className,
          )}
        >
          {selected ? <CheckIcon className="h-3.5 w-3.5 text-accent" /> : icon}
          <span>{children}</span>
        </span>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={selected}
        className={cn(
          "inline-flex min-h-target min-w-target items-center justify-center gap-2 rounded-[var(--radius-pill)] border px-4 py-2 text-sm font-medium",
          "whitespace-normal break-words transition-colors duration-[var(--duration-fast)] ease-[var(--ease-calm)]",
          "disabled:pointer-events-none disabled:opacity-50",
          selected
            ? "border-accent bg-accent text-on-accent"
            : "border-line-strong bg-surface text-ink hover:bg-surface-sunken",
          className,
        )}
        {...props}
      >
        {selected ? <CheckIcon className="h-4 w-4 shrink-0" /> : icon}
        <span>{children}</span>
      </button>
    );
  },
);
Chip.displayName = "Chip";
