import * as React from "react";

import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface BannerProps {
  title: string;
  description?: string;
  tone?: "info" | "good" | "caution" | "danger";
  action?: React.ReactNode;
  className?: string;
}

function BannerIcon({ tone }: { tone: NonNullable<BannerProps["tone"]> }) {
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
 * Persistent inline banner for connection quality, offline, reconnecting or
 * recording notices (spec 7.5, 9.7, 11.4). Pairs colour with a distinct icon.
 */
export function Banner({
  title,
  description,
  tone = "info",
  action,
  className,
}: BannerProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-card)] border px-4 py-3 text-ink",
        tone === "info" && "border-accent/40 bg-accent/10",
        tone === "good" && "border-good/40 bg-good/10",
        tone === "caution" && "border-caution/40 bg-caution/10",
        tone === "danger" && "border-danger/40 bg-danger/10",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="mt-0.5">
          <BannerIcon tone={tone} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink break-words">{title}</p>
          {description ? (
            <p className="mt-0.5 text-sm text-ink-secondary break-words">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
