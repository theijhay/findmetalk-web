import * as React from "react";

import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  body: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

/**
 * Calm empty state (spec 9.7). Warm, plain copy and at most one primary action.
 */
export function EmptyState({
  title,
  body,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-line bg-surface p-8 text-center shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-[var(--radius-pill)] bg-surface-sunken text-accent"
        aria-hidden="true"
      >
        {icon ?? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-7 w-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 17.5a4.5 4.5 0 01-.5-8.97 6 6 0 0111.5 1.47 3.75 3.75 0 01.5 7.5H6.5z" />
          </svg>
        )}
      </div>
      <h3 className="max-w-md text-lg font-semibold text-ink break-words">{title}</h3>
      <p className="mt-1.5 max-w-md text-sm text-ink-secondary break-words">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
