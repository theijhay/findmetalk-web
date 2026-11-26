"use client";

import * as React from "react";

/**
 * Full-bleed living cloud and sky backdrop (Spec 9.1, 9.2).
 *
 * Uses lightweight SVG cloud silhouettes colored exclusively with design
 * tokens (no raw hex, no heavy repaint filters) and gentle transform-only
 * horizontal drift that pauses automatically under prefers-reduced-motion.
 */
export function CloudBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden bg-gradient-to-b from-sky-top via-sky-bottom to-page"
    >
      {/* Soft warm/cool ambient sky glow following dawn/day/dusk/night palette */}
      <div className="absolute -top-24 left-1/2 h-80 w-[34rem] -translate-x-1/2 rounded-full bg-sky-glow/20 blur-3xl sm:w-[48rem]" />
      <div className="absolute top-1/3 -left-24 h-64 w-64 rounded-full bg-sky-glow/12 blur-3xl" />
      <div className="absolute top-1/2 -right-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      {/* Upper drifting cloud layer */}
      <svg
        viewBox="0 0 1440 320"
        fill="currentColor"
        preserveAspectRatio="none"
        className="cloud-layer-slow absolute top-6 -left-16 h-44 w-[115%] text-surface/55 sm:h-56"
      >
        <path d="M110 210c-44 0-78-28-78-64 0-32 27-59 63-63 14-36 52-61 97-61 50 0 92 31 102 74 36 4 64 30 64 62 0 35-32 52-74 52H110z" />
        <path d="M560 175c-36 0-66-22-66-52 0-27 23-49 54-52 13-29 45-49 84-49 44 0 80 26 88 61 30 4 53 24 53 50 0 28-26 42-61 42H560z" />
        <path d="M1040 220c-48 0-84-30-84-68 0-34 29-62 68-66 15-38 56-64 104-64 54 0 99 33 110 79 39 5 68 32 68 65 0 37-34 54-79 54h-187z" />
      </svg>

      {/* Mid-sky soft cloud wisps */}
      <svg
        viewBox="0 0 1440 320"
        fill="currentColor"
        preserveAspectRatio="none"
        className="cloud-layer-reverse absolute top-1/3 -left-12 h-48 w-[112%] text-surface-raised/50 sm:h-64"
      >
        <path d="M250 230c-54 0-96-33-96-75 0-37 33-68 77-72 17-41 62-70 116-70 60 0 110 36 122 86 43 5 76 35 76 72 0 41-38 59-88 59H250z" />
        <path d="M840 250c-50 0-88-30-88-68 0-33 30-62 71-66 16-38 58-64 108-64 56 0 102 33 114 79 40 5 70 32 70 65 0 37-35 54-81 54H840z" />
      </svg>

      {/* Soft rolling cloud bank along the bottom horizon behind the Open to talk card */}
      <svg
        viewBox="0 0 1440 240"
        fill="currentColor"
        preserveAspectRatio="none"
        className="absolute right-0 bottom-0 left-0 h-44 w-full text-surface/75 sm:h-56"
      >
        <path d="M0 150c52-42 124-62 198-52 54-56 146-78 228-48 64-48 164-56 238-14 68-48 176-52 248-6 66-46 168-48 238-2 58-34 136-32 196 10 34-14 70-18 94-12v166H0V150z" />
      </svg>
      <svg
        viewBox="0 0 1440 180"
        fill="currentColor"
        preserveAspectRatio="none"
        className="absolute right-0 bottom-0 left-0 h-28 w-full text-surface/90 sm:h-36"
      >
        <path d="M0 118c72-38 164-42 238-6 70-48 182-52 256-4 72-42 178-40 248 6 76-48 190-46 264 4 68-36 158-36 226 4 64-28 144-24 208 10v48H0v-62z" />
      </svg>
    </div>
  );
}
