import * as React from "react";

import { StatusIcon } from "@/components/ui/icons";
import { type AvatarPresetId, getStatusMeta, type StatusPresetId } from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  presetId: AvatarPresetId | string;
  photoUrl?: string | null;
  allowPhoto?: boolean;
  label: string;
  size?: "sm" | "md" | "lg" | "xl";
  statusPreset?: StatusPresetId | "custom" | null;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-20 w-20",
};

function PresetIllustration({ presetId }: { presetId: string }) {
  switch (presetId) {
    case "avatar_01":
      return (
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full text-status-chat" aria-hidden="true">
          <rect width="48" height="48" className="fill-status-chat/15" />
          <circle cx="24" cy="24" r="11" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="24" cy="24" r="4" fill="currentColor" />
        </svg>
      );
    case "avatar_02":
      return (
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full text-status-listen" aria-hidden="true">
          <rect width="48" height="48" className="fill-status-listen/15" />
          <path d="M24 11c7 5 9 14 0 26-9-12-7-21 0-26z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M24 16v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "avatar_03":
      return (
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full text-status-rough-day" aria-hidden="true">
          <rect width="48" height="48" className="fill-status-rough-day/15" />
          <path d="M12 27c3-4 6-4 9 0s6 4 9 0 6-4 6 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M12 20c3-4 6-4 9 0s6 4 9 0 6-4 6 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case "avatar_04":
      return (
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full text-status-sleep" aria-hidden="true">
          <rect width="48" height="48" className="fill-status-sleep/15" />
          <path d="M29 31a10 10 0 01-10-10c0-3.5 1.8-6.6 4.5-8.4A10.5 10.5 0 1033.4 29.5c-1.3.9-2.8 1.5-4.4 1.5z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      );
    case "avatar_05":
      return (
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full text-status-language" aria-hidden="true">
          <rect width="48" height="48" className="fill-status-language/15" />
          <polygon points="24,12 35,32 13,32" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <circle cx="24" cy="26" r="3" fill="currentColor" />
        </svg>
      );
    case "avatar_06":
      return (
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full text-status-hi" aria-hidden="true">
          <rect width="48" height="48" className="fill-status-hi/15" />
          <rect x="14" y="14" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      );
    case "avatar_07":
      return (
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full text-status-study" aria-hidden="true">
          <rect width="48" height="48" className="fill-status-study/15" />
          <path d="M24 12l4 8 8 4-8 4-4 8-4-8-8-4 8-4 4-8z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" fill="none" className="h-full w-full text-accent" aria-hidden="true">
          <rect width="48" height="48" className="fill-accent/15" />
          <circle cx="20" cy="24" r="7" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="28" cy="24" r="7" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      );
  }
}

/**
 * Illustrated preset or approved photo avatar (spec FR-PROF-2, FR-PROF-6).
 * Orbs pass `allowPhoto={false}` so photos appear only on profile cards and
 * incoming-call screens.
 */
export function Avatar({
  presetId,
  photoUrl,
  allowPhoto = true,
  label,
  size = "md",
  statusPreset,
  className,
}: AvatarProps) {
  const showPhoto = allowPhoto && Boolean(photoUrl);
  const statusMeta = statusPreset ? getStatusMeta(statusPreset) : null;

  return (
    <div
      role="img"
      aria-label={label}
      className={cn("relative inline-flex shrink-0 items-center justify-center", SIZE_CLASSES[size], className)}
    >
      <div className="h-full w-full overflow-hidden rounded-[var(--radius-pill)] border border-line-strong bg-surface-sunken">
        {showPhoto && photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- User-uploaded storage URL or data URI in fixtures
          <img
            src={photoUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <PresetIllustration presetId={presetId} />
        )}
      </div>
      {statusMeta ? (
        <span
          className={cn(
            "absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-[var(--radius-pill)] border border-surface bg-surface-raised shadow-[var(--shadow-card)]",
            statusMeta.textClass,
          )}
          aria-hidden="true"
        >
          <StatusIcon icon={statusMeta.icon} className="h-3.5 w-3.5" />
        </span>
      ) : null}
    </div>
  );
}
