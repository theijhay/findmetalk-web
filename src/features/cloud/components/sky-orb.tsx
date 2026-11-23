"use client";

import * as React from "react";

import { Avatar, StatusIcon } from "@/components/ui";
import {
  computeLanguageRingSegments,
  type OrbPlacement,
} from "@/lib/cloud";
import { getStatusMeta } from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface SkyOrbProps {
  readonly placement: OrbPlacement;
  readonly statusLabel: string;
  readonly languagesLabel: string;
  readonly ariaLabel: string;
  readonly selected?: boolean;
  readonly onSelect: (userId: string) => void;
}

/**
 * Single open person's orb in the living sky (Spec 9.2, FR-PROF-6).
 *
 * - Uses the illustrated avatar only, never a photo (FR-PROF-6).
 * - Pairs status colour with both an icon and visible text so colour is never
 *   the only signal (WCAG 2.2 AA).
 * - Draws a thin segmented SVG ring for spoken languages with a visible label
 *   on focus or hover (Spec 9.2).
 * - Animates with CSS transform/opacity only when within the animated orb cap.
 */
export function SkyOrb({
  placement,
  statusLabel,
  languagesLabel,
  ariaLabel,
  selected = false,
  onSelect,
}: SkyOrbProps) {
  const { entry, xPercent, yPercent, animated, driftDelaySeconds, driftDurationSeconds } =
    placement;

  const presetKey = entry.status?.preset ?? "custom";
  const statusMeta = getStatusMeta(presetKey);
  const ringSegments = React.useMemo(
    () => computeLanguageRingSegments(entry.languages),
    [entry.languages],
  );

  return (
    <div
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2"
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-pressed={selected}
        onClick={() => onSelect(entry.user_id)}
        style={
          animated
            ? {
                animationDelay: `${driftDelaySeconds}s`,
                animationDuration: `${driftDurationSeconds}s`,
              }
            : undefined
        }
        className={cn(
          "group relative flex min-h-target min-w-target flex-col items-center gap-1 rounded-[var(--radius-card)] p-1.5 text-center transition-transform duration-[var(--duration-normal)] ease-[var(--ease-calm)]",
          "focus-visible:z-20 hover:z-20",
          animated && "cloud-orb-animated",
          selected && "z-20 ring-2 ring-accent",
        )}
      >
        {/* Orb core + thin segmented language ring */}
        <span className="relative flex h-16 w-16 items-center justify-center">
          <svg
            viewBox="0 0 64 64"
            className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-line/50"
            />
            {ringSegments.map((seg) => (
              <circle
                key={seg.code}
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                className={statusMeta.textClass}
              />
            ))}
          </svg>

          {/* Avatar only on orbs, never photo (FR-PROF-6) */}
          <Avatar
            presetId={entry.avatar_id}
            allowPhoto={false}
            size="md"
            statusPreset={presetKey}
            label={entry.display_name}
          />

          {/* Paired status icon badge so colour is never the only signal */}
          <span
            className={cn(
              "absolute -right-0.5 -bottom-0.5 flex h-6 w-6 items-center justify-center rounded-[var(--radius-pill)] border bg-surface shadow-[var(--shadow-card)]",
              statusMeta.borderClass,
              statusMeta.textClass,
            )}
            aria-hidden="true"
          >
            <StatusIcon icon={statusMeta.icon} className="h-3.5 w-3.5" />
          </span>
        </span>

        {/* Name + status pill */}
        <span
          className={cn(
            "max-w-[9.5rem] rounded-[var(--radius-pill)] border bg-surface/95 px-2.5 py-0.5 text-xs font-semibold text-ink shadow-[var(--shadow-card)]",
            statusMeta.borderClass,
          )}
        >
          <span className="block truncate">{entry.display_name}</span>
          <span className={cn("block truncate text-[11px] font-medium", statusMeta.textClass)}>
            {statusLabel}
          </span>
        </span>

        {/* Language ring label revealed on focus or hover (Spec 9.2) */}
        <span
          className={cn(
            "pointer-events-none rounded-[var(--radius-pill)] border border-line bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-ink-secondary shadow-[var(--shadow-card)] transition-opacity duration-[var(--duration-fast)]",
            selected
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
          )}
        >
          {languagesLabel}
        </span>
      </button>
    </div>
  );
}
