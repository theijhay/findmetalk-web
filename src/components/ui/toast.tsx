import * as React from "react";

import { IconButton } from "@/components/ui/icon-button";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface ToastProps {
  title: string;
  description?: string;
  tone?: "neutral" | "good" | "caution" | "danger";
  dismissLabel?: string;
  onDismiss?: () => void;
  className?: string;
}

function ToneIcon({ tone }: { tone: NonNullable<ToastProps["tone"]> }) {
  switch (tone) {
    case "good":
      return <CheckIcon className="h-5 w-5 shrink-0 text-good" />;
    case "caution":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0 text-caution" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 3.5L2.5 16.5h15L10 3.5z" />
          <path strokeLinecap="round" d="M10 8.5v3.5M10 14.25h.01" />
        </svg>
      );
    case "danger":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0 text-danger" aria-hidden="true">
          <circle cx="10" cy="10" r="7" />
          <path strokeLinecap="round" d="M10 6.5v4M10 13.25h.01" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5 shrink-0 text-accent" aria-hidden="true">
          <circle cx="10" cy="10" r="7" />
          <path strokeLinecap="round" d="M10 9.5v4M10 6.75h.01" />
        </svg>
      );
  }
}

/**
 * Calm status toast with icon + text so colour is never the only signal.
 */
export function Toast({
  title,
  description,
  tone = "neutral",
  dismissLabel,
  onDismiss,
  className,
}: ToastProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      aria-live={tone === "danger" ? "assertive" : "polite"}
      className={cn(
        "flex w-full max-w-md items-start gap-3 rounded-[var(--radius-card)] border bg-surface-raised p-4 text-ink shadow-[var(--shadow-raised)]",
        tone === "good" && "border-good/40",
        tone === "caution" && "border-caution/40",
        tone === "danger" && "border-danger/40",
        tone === "neutral" && "border-line-strong",
        className,
      )}
    >
      <div className="mt-0.5">
        <ToneIcon tone={tone} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink break-words">{title}</p>
        {description ? (
          <p className="mt-0.5 text-sm text-ink-secondary break-words">{description}</p>
        ) : null}
      </div>
      {onDismiss && dismissLabel ? (
        <IconButton variant="quiet" aria-label={dismissLabel} onClick={onDismiss} className="-my-1 -mr-1">
          <CloseIcon />
        </IconButton>
      ) : null}
    </div>
  );
}
