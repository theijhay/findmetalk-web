"use client";

import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface HelpControlProps {
  label: string;
  href?: string;
  onActivate?: () => void;
  className?: string;
}

function HelpHeartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      className={cn("h-4 w-4 shrink-0", className)}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 16.5s-6-3.8-6-8.2A3.5 3.5 0 0110 5.7a3.5 3.5 0 016 2.6c0 4.4-6 8.2-6 8.2z"
      />
      <path strokeLinecap="round" d="M10 8v3.5M8.25 9.75h3.5" />
    </svg>
  );
}

/**
 * Persistent "I need help" control (spec 7.7, CR-5).
 * Always visible in the top bar of every screen and reachable in one tap,
 * never tucked inside a menu.
 */
export function HelpControl({
  label,
  href = "/help",
  onActivate,
  className,
}: HelpControlProps) {
  const sharedClasses = cn(
    "inline-flex min-h-target min-w-target shrink-0 items-center justify-center gap-2",
    "rounded-[var(--radius-pill)] border border-help bg-help px-3.5 py-2 text-sm font-semibold text-on-help",
    "shadow-[var(--shadow-card)] transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-calm)]",
    "hover:opacity-90 whitespace-normal break-words",
    className,
  );

  if (onActivate) {
    return (
      <button type="button" onClick={onActivate} className={sharedClasses}>
        <HelpHeartIcon />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <Link href={href} className={sharedClasses}>
      <HelpHeartIcon />
      <span>{label}</span>
    </Link>
  );
}
