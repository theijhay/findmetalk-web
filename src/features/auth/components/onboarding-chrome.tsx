"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { HelpControl } from "@/components/layout/help-control";
import { SITE } from "@/config/site";
import {
  getOnboardingStepProgress,
  type OnboardingStep,
} from "@/lib/onboarding";
import { cn } from "@/lib/utils";

export interface OnboardingChromeProps {
  readonly step: OnboardingStep;
  readonly embedded?: boolean;
  readonly stretch?: (text: string) => string;
  readonly children: React.ReactNode;
}

/**
 * Calm focused shell for sign-in and onboarding screens (Spec 7.1, 7.7).
 *
 * Keeps one-tap "I need help" reachable on every onboarding step without
 * exposing primary app navigation before onboarding finishes.
 */
export function OnboardingChrome({
  step,
  embedded = false,
  stretch = (v) => v,
  children,
}: OnboardingChromeProps) {
  const tShell = useTranslations("shell");
  const tOnb = useTranslations("onboarding");
  const mainId = React.useId();

  const progress = getOnboardingStepProgress(step);
  const progressPercent = Math.round((progress.current / progress.total) * 100);

  return (
    <div
      className={cn(
        "relative flex flex-col bg-gradient-to-b from-sky-top to-sky-bottom text-ink",
        embedded
          ? "min-h-[34rem] overflow-hidden rounded-[var(--radius-card)] border border-line shadow-[var(--shadow-card)]"
          : "min-h-[100dvh]",
      )}
    >
      {!embedded ? (
        <a
          href={`#${mainId}`}
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:inline-flex focus:min-h-target focus:items-center focus:rounded-[var(--radius-control)] focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-accent"
        >
          {tShell("skipToContent")}
        </a>
      ) : null}

      <header
        className={cn(
          "border-b border-line bg-surface/95 backdrop-blur-sm",
          !embedded && "sticky top-0 z-30 pt-[env(safe-area-inset-top,0px)]",
        )}
      >
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold tracking-tight text-ink sm:text-lg">
              {SITE.name}
            </span>
            <span className="rounded-[var(--radius-pill)] border border-line bg-surface-sunken px-2.5 py-0.5 text-xs font-medium text-ink-secondary">
              {stretch(
                tOnb("stepProgress", {
                  current: progress.current,
                  total: progress.total,
                }),
              )}
            </span>
          </div>

          <HelpControl label={tShell("helpControl")} />
        </div>

        {/* Calm linear step progress indicator */}
        <div
          role="progressbar"
          aria-label={tOnb("progressAriaLabel")}
          aria-valuemin={1}
          aria-valuemax={progress.total}
          aria-valuenow={progress.current}
          className="h-1 w-full bg-surface-sunken"
        >
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-accent transition-[width] duration-[var(--duration-calm)] ease-[var(--ease-calm)]"
          />
        </div>
      </header>

      <main
        id={mainId}
        tabIndex={-1}
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-6 sm:px-6 sm:py-8"
      >
        {children}
      </main>
    </div>
  );
}
