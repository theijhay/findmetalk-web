import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex min-h-target min-w-target items-center justify-center gap-2",
    "rounded-[var(--radius-control)] px-5 py-2.5 text-base font-medium leading-snug",
    "text-center whitespace-normal break-words select-none",
    "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-calm)]",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent hover:bg-accent-hover shadow-[var(--shadow-card)]",
        secondary:
          "border border-line-strong bg-surface text-ink hover:bg-surface-sunken",
        quiet: "bg-transparent text-ink hover:bg-surface-sunken",
        danger:
          "bg-danger text-on-danger hover:bg-danger-hover shadow-[var(--shadow-card)]",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, fullWidth, asChild = false, type = "button", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(buttonVariants({ variant, fullWidth }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
