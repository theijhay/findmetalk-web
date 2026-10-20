"use client";

import * as React from "react";

import { IconButton } from "@/components/ui/icon-button";
import { CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  closeLabel: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  inline?: boolean;
  className?: string;
}

/**
 * Accessible modal dialog for confirmations and notices (spec 9.6).
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  closeLabel,
  children,
  footer,
  inline = false,
  className,
}: DialogProps) {
  const titleId = React.useId();
  const descId = React.useId();

  React.useEffect(() => {
    if (!open || inline) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, inline, onClose]);

  if (!open) return null;

  const box = (
    <div
      role="dialog"
      aria-modal={inline ? undefined : true}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      className={cn(
        "w-full max-w-md rounded-[var(--radius-card)] border border-line bg-surface-raised p-6 text-ink shadow-[var(--shadow-raised)]",
        !inline && "relative z-10",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-lg font-semibold text-ink break-words">
            {title}
          </h2>
          {description ? (
            <p id={descId} className="mt-1 text-sm text-ink-secondary break-words">
              {description}
            </p>
          ) : null}
        </div>
        <IconButton variant="quiet" aria-label={closeLabel} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
      <div className="mt-4 text-sm text-ink break-words">{children}</div>
      {footer ? (
        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">{footer}</div>
      ) : null}
    </div>
  );

  if (inline) {
    return box;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-overlay/60 transition-opacity duration-[var(--duration-calm)]"
        onClick={onClose}
        aria-hidden="true"
      />
      {box}
    </div>
  );
}
