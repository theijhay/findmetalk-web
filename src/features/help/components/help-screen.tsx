"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import * as React from "react";

import { Banner, Button, Card, Select } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { SITE } from "@/config/site";
import {
  type CrisisDirectoryProvider,
  FIND_A_HELPLINE_PROVIDER,
  HELP_COUNTRY_CODES,
  type HelpCountryCode,
  inferCountryFromLocale,
} from "@/lib/safety";
import { cn } from "@/lib/utils";

export interface HelpScreenProps {
  readonly initialCountry?: HelpCountryCode | null;
  readonly browserLocales?: readonly string[];
  readonly directoryProvider?: CrisisDirectoryProvider;
  readonly onBackToCloud?: () => void;
  readonly embedded?: boolean;
  readonly stretch?: (text: string) => string;
}

/**
 * Calm "I need help" screen (Spec 7.7, CR-1, CR-2, CR-3, CR-4, CR-5, OPEN-25).
 *
 * - Clearly states the app is for conversation, not crisis or medical care.
 * - Pre-fills country from browser locale only (never IP) and lets the user
 *   choose or confirm their country.
 * - Links to the verified directory via a swappable CrisisDirectoryProvider
 *   abstraction (default: Find A Helpline by ThroughLine).
 * - Never hardcodes hotline numbers anywhere in code.
 */
export function HelpScreen({
  initialCountry,
  browserLocales,
  directoryProvider = FIND_A_HELPLINE_PROVIDER,
  onBackToCloud,
  embedded = false,
  stretch = (v) => v,
}: HelpScreenProps) {
  const tHelp = useTranslations("help");
  const tShell = useTranslations("shell");
  const mainId = React.useId();

  const [country, setCountry] = React.useState<HelpCountryCode | null>(() => {
    if (initialCountry !== undefined) return initialCountry;
    if (browserLocales) return inferCountryFromLocale(browserLocales);
    if (typeof navigator !== "undefined") {
      return inferCountryFromLocale(
        navigator.languages && navigator.languages.length > 0
          ? navigator.languages
          : navigator.language,
      );
    }
    return null;
  });

  const directoryLink = React.useMemo(
    () => directoryProvider.getDirectoryLink(country),
    [directoryProvider, country],
  );

  const countryOptions = React.useMemo(
    () => [
      { value: "", label: tHelp("countrySelectPlaceholder") },
      ...HELP_COUNTRY_CODES.map((code) => ({
        value: code,
        label: tHelp(`countries.${code}`),
      })),
    ],
    [tHelp],
  );

  return (
    <div
      className={cn(
        "flex flex-col bg-gradient-to-b from-sky-top to-sky-bottom text-ink",
        embedded
          ? "overflow-hidden rounded-[var(--radius-card)] border border-line shadow-[var(--shadow-card)]"
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

      <header className="border-b border-line bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <span className="text-base font-bold tracking-tight text-ink sm:text-lg">
            {SITE.name}
          </span>
          {onBackToCloud ? (
            <Button variant="quiet" onClick={onBackToCloud}>
              {stretch(tHelp("backToCloud"))}
            </Button>
          ) : (
            <Link
              href={ROUTES.cloud}
              className="inline-flex min-h-target items-center justify-center rounded-[var(--radius-control)] px-3 py-2 text-sm font-semibold text-ink hover:bg-surface-sunken"
            >
              {stretch(tHelp("backToCloud"))}
            </Link>
          )}
        </div>
      </header>

      <main
        id={mainId}
        tabIndex={-1}
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-5 px-4 py-6 sm:px-6 sm:py-8"
      >
        <Banner
          tone="caution"
          title={stretch(tHelp("emergencyTitle"))}
          description={stretch(tHelp("emergencyFallback"))}
        />

        <Card elevated className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-ink break-words">
              {stretch(tHelp("title"))}
            </h1>
            <p className="text-sm leading-relaxed text-ink-secondary break-words">
              {stretch(tHelp("companionNotice", { appName: SITE.name }))}
            </p>
          </div>

          <Select
            label={stretch(tHelp("countryLabel"))}
            hint={stretch(tHelp("countryHint"))}
            options={countryOptions}
            value={country ?? ""}
            onChange={(e) =>
              setCountry((e.target.value || null) as HelpCountryCode | null)
            }
          />

          <div className="flex flex-col gap-3 rounded-[var(--radius-control)] border border-line bg-surface-sunken p-4">
            <h2 className="text-sm font-semibold text-ink break-words">
              {stretch(tHelp("directoryHeading"))}
            </h2>
            <p className="text-xs leading-relaxed text-ink-secondary break-words">
              {stretch(
                country
                  ? tHelp("directoryCountryBody", {
                      country: tHelp(`countries.${country}`),
                    })
                  : tHelp("directoryGlobalBody"),
              )}
            </p>
            <a
              href={directoryLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-target w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-help px-5 py-2.5 text-center text-sm font-semibold text-on-help transition-opacity duration-[var(--duration-fast)] hover:opacity-90 whitespace-normal break-words"
            >
              <span>
                {stretch(
                  country
                    ? tHelp("directoryOpenCountryButton", {
                        country: tHelp(`countries.${country}`),
                      })
                    : tHelp("directoryOpenGlobalButton"),
                )}
              </span>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 4h5v5M16 4l-7 7M8.5 5.5H5a1.5 1.5 0 00-1.5 1.5v8A1.5 1.5 0 005 16.5h8a1.5 1.5 0 001.5-1.5v-3.5"
                />
              </svg>
            </a>
            <p className="text-xs text-ink-muted break-words">
              {stretch(tHelp("directoryExternalNote"))}
            </p>
          </div>

          <div className="border-t border-line pt-4">
            {onBackToCloud ? (
              <Button variant="secondary" fullWidth onClick={onBackToCloud}>
                {stretch(tHelp("backToCloud"))}
              </Button>
            ) : (
              <Link
                href={ROUTES.cloud}
                className="inline-flex min-h-target w-full items-center justify-center rounded-[var(--radius-control)] border border-line-strong bg-surface px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface-sunken"
              >
                {stretch(tHelp("backToCloud"))}
              </Link>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
