"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface RecordingIndicatorProps {
  readonly recorded: boolean;
  readonly className?: string;
  readonly stretch?: (text: string) => string;
}

/**
 * Persistent, calm "recorded for safety" indicator (REC-2, Spec 7.5, 11.4).
 *
 * Shown for the entire call whenever the API reports `recorded: true`.
 * Pairs a shield/dot icon with plain text so colour is never the only signal.
 */
export function RecordingIndicator({
  recorded,
  className,
  stretch = (v) => v,
}: RecordingIndicatorProps) {
  const tCalls = useTranslations("calls");

  if (!recorded) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-line-strong bg-surface-raised px-3.5 py-1.5 text-xs font-semibold text-ink shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-2.5 w-2.5 shrink-0 items-center justify-center rounded-full bg-danger"
      />
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-4 w-4 shrink-0 text-ink-secondary"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 2.5L4.5 5v4.8c0 3.7 2.3 6.7 5.5 7.7 3.2-1 5.5-4 5.5-7.7V5L10 2.5z"
        />
      </svg>
      <span className="break-words">{stretch(tCalls("recording.badge"))}</span>
    </div>
  );
}
