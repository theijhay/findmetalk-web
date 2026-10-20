"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { Button, Sheet } from "@/components/ui";
import { SITE } from "@/config/site";
import { cn } from "@/lib/utils";

export interface HelpControlProps {
  label?: string;
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
 * Persistent "I need help" control (spec 7.7, CR-2, CR-5).
 * Always visible in the top bar of every screen and reachable in one tap,
 * never tucked inside a menu. Until the dedicated help directory ships (#8),
 * activating the control opens a Sheet with the companion notice, the
 * emergency services fallback line, and "Back to the cloud".
 */
export function HelpControl({
  label,
  onActivate,
  className,
}: HelpControlProps) {
  const t = useTranslations("shell");
  const tCommon = useTranslations("common");
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setOpen(true);
          onActivate?.();
        }}
        className={cn(
          "inline-flex min-h-target min-w-target shrink-0 items-center justify-center gap-2",
          "rounded-[var(--radius-pill)] border border-help bg-help px-3.5 py-2 text-sm font-semibold text-on-help",
          "shadow-[var(--shadow-card)] transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-calm)]",
          "hover:opacity-90 whitespace-normal break-words",
          className,
        )}
      >
        <HelpHeartIcon />
        <span>{label ?? t("helpControl")}</span>
      </button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={t("helpSheet.title")}
        description={t("helpSheet.companionNotice", { appName: SITE.name })}
        closeLabel={tCommon("close")}
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium text-ink">
            {t("helpSheet.emergencyFallback")}
          </p>
          <Button variant="primary" fullWidth onClick={() => setOpen(false)}>
            {t("helpSheet.backToCloud")}
          </Button>
        </div>
      </Sheet>
    </>
  );
}
