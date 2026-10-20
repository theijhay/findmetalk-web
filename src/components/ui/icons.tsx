import * as React from "react";

import type { StatusIconId } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function StatusIcon({
  icon,
  className,
}: {
  icon: StatusIconId;
  className?: string;
}) {
  const shared = cn("h-4 w-4 shrink-0", className);
  switch (icon) {
    case "spark":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className={shared} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 2.5v3M10 14.5v3M2.5 10h3M14.5 10h3M4.9 4.9l2.1 2.1M13 13l2.1 2.1M15.1 4.9L13 7M7 13l-2.1 2.1" />
          <circle cx="10" cy="10" r="2.25" />
        </svg>
      );
    case "cloud_rain":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className={shared} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5a3.5 3.5 0 01-.4-6.97A4.5 4.5 0 0114.5 7.5a3 3 0 01.5 5.96H6z" />
          <path strokeLinecap="round" d="M7.5 15.5l-1 2M11 15.5l-1 2M14.5 15.5l-1 2" />
        </svg>
      );
    case "ear":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className={shared} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 8.5a4.5 4.5 0 118.5 2c-.8 1.5-1.5 2.3-2 3.5-.4 1-1.2 2-2.8 2a2.2 2.2 0 01-2.2-2.2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 8.5a2 2 0 113.8.8c-.4.7-.9 1.2-1.3 2" />
        </svg>
      );
    case "moon":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className={shared} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.5 12.8A6 6 0 017.2 4.5a6.02 6.02 0 00-3.7 5.5 6 6 0 0012 2.8z" />
        </svg>
      );
    case "globe":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className={shared} aria-hidden="true">
          <circle cx="10" cy="10" r="7" />
          <path strokeLinecap="round" d="M3 10h14M10 3c2 2.2 2 11.8 0 14M10 3c-2 2.2-2 11.8 0 14" />
        </svg>
      );
    case "wave":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className={shared} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0M3 13.5c1.5-2 3-2 4.5 0s3 2 4.5 0 3-2 4.5 0" />
        </svg>
      );
    case "book":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className={shared} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.5 5.5A2 2 0 015.5 3.5H9a1.5 1.5 0 011 1v11a1.5 1.5 0 00-1-1H5.5a2 2 0 01-2-2v-6zM16.5 5.5a2 2 0 00-2-2H11a1.5 1.5 0 00-1 1v11a1.5 1.5 0 011-1h3.5a2 2 0 002-2v-6z" />
        </svg>
      );
    case "message":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className={shared} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5.5A2 2 0 016 3.5h8a2 2 0 012 2v6a2 2 0 01-2 2H9l-3.5 3v-3H6a2 2 0 01-2-2v-6z" />
        </svg>
      );
  }
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className={cn("h-4 w-4 shrink-0", className)} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5l3.5 3.5 7.5-7.5" />
    </svg>
  );
}

export function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className={cn("h-4 w-4 shrink-0", className)} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5l10 10M15 5L5 15" />
    </svg>
  );
}
