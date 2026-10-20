"use client";

import * as React from "react";

import { IconButton } from "@/components/ui/icon-button";
import { CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  closeLabel: string;
  children: React.ReactNode;
  inline?: boolean;
  className?: string;
}

/**
 * Bottom sheet on mobile, calm side or centred panel on desktop (spec 9.6).
 * Supports Escape key dismissal and accessible dialog labelling.
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  closeLabel,
  children,
  inline = false,
  className,
}: SheetProps) {
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

  const panel = (
    <div
      role="dialog"
      aria-modal={inline ? undefined : true}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      className={cn(
        "w-full rounded-t-[var(--radius-sheet)] sm:rounded-[var(--radius-sheet)] border border-line bg-surface-raised p-6 text-ink shadow-[var(--shadow-raised)]",
        inline ? "max-w-lg" : "relative z-10 max-h-[90dvh] max-w-lg overflow-y-auto",
        className,
      )}
    >
      <div className="mx-auto mb-4 h-1.5 w-12 rounded-[var(--radius-pill)] bg-line-strong/40 sm:hidden" aria-hidden="true" />
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
      <div className="mt-4">{children}</div>
    </div>
  );

  if (inline) {
    return panel;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="fixed inset-0 bg-overlay/60 transition-opacity duration-[var(--duration-calm)]"
        onClick={onClose}
        aria-hidden="true"
      />
      {panel}
    </div>
  );
}
