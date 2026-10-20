import * as React from "react";

import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
}

/**
 * Loading placeholder (spec 9.3, 9.6). Respects prefers-reduced-motion via globals.css.
 */
export function Skeleton({ label, className, ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label={label}
      aria-busy="true"
      className={cn(
        "animate-pulse rounded-[var(--radius-control)] border border-line bg-surface-sunken",
        className,
      )}
      {...props}
    />
  );
}
