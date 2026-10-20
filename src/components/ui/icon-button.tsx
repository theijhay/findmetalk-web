import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  [
    "inline-flex min-h-target min-w-target shrink-0 items-center justify-center",
    "rounded-[var(--radius-pill)] p-2.5",
    "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-calm)]",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        secondary: "border border-line-strong bg-surface text-ink hover:bg-surface-sunken",
        quiet: "bg-transparent text-ink hover:bg-surface-sunken",
        primary: "bg-accent text-on-accent hover:bg-accent-hover",
        danger: "bg-danger text-on-danger hover:bg-danger-hover",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  },
);

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label">,
    VariantProps<typeof iconButtonVariants> {
  "aria-label": string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, type = "button", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(iconButtonVariants({ variant }), className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
IconButton.displayName = "IconButton";
