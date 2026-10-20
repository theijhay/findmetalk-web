import * as React from "react";

import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevated = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-[var(--radius-card)] border border-line bg-surface p-5 text-ink",
          elevated
            ? "bg-surface-raised shadow-[var(--shadow-raised)]"
            : "shadow-[var(--shadow-card)]",
          className,
        )}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";
