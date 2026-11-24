"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import * as React from "react";

import { HelpControl } from "@/components/layout/help-control";
import { Banner, Button, Card } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { SITE } from "@/config/site";
import {
  type AccountStandingData,
  APPEAL_MESSAGE_MAX_LENGTH,
  APPEAL_MESSAGE_MIN_LENGTH,
  type AppealState,
  canSubmitAppeal,
  validateAppealMessage,
} from "@/lib/safety";
import { cn } from "@/lib/utils";

export interface SuspensionScreenProps {
  readonly standing?: AccountStandingData | null;
  readonly apiErrorCode?: string | null;
  readonly onSubmitAppeal?: (payload: {
    readonly moderation_action_id: string;
    readonly message: string;
  }) => void;
  readonly onSignOut?: () => void;
  readonly onEnterCloud?: () => void;
  readonly embedded?: boolean;
  readonly stretch?: (text: string) => string;
}

function getAppealBadgeClasses(state: AppealState): string {
  switch (state) {
    case "overturned":
      return "border-good/40 bg-good/10 text-good";
    case "upheld":
      return "border-danger/40 bg-danger/10 text-danger";
    case "reviewing":
      return "border-accent/40 bg-accent/10 text-accent";
    case "open":
    default:
      return "border-caution/40 bg-caution/10 text-caution";
  }
}

/**
 * Suspended or banned account standing screen with plain explanation, in-app
 * appeal form and live appeal status (Spec 11.3 Appeals, API #44).
 *
 * Always keeps the one-tap "I need help" control and Sign out action reachable.
 */
export function SuspensionScreen({
  standing = null,
  apiErrorCode = null,
  onSubmitAppeal,
  onSignOut,
  onEnterCloud,
  embedded = false,
  stretch = (v) => v,
}: SuspensionScreenProps) {
  const tSafety = useTranslations("safety");
  const tShell = useTranslations("shell");
  const tErrors = useTranslations("errors");
  const mainId = React.useId();
  const messageId = React.useId();

  const [appealText, setAppealText] = React.useState("");
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [submittedLocally, setSubmittedLocally] = React.useState(false);

  const effectiveStanding: AccountStandingData | null = React.useMemo(() => {
    if (!standing) return null;
    if (!submittedLocally || standing.appeal) return standing;
    return {
      ...standing,
      can_appeal: false,
      appeal: {
        id: "submitted",
        state: "open",
        created_at: new Date().toISOString(),
      },
    };
  }, [standing, submittedLocally]);

  const translatedApiError = React.useMemo(() => {
    if (!apiErrorCode) return null;
    return tErrors.has(apiErrorCode)
      ? tErrors(apiErrorCode, { appName: SITE.name })
      : tErrors("unknown");
  }, [apiErrorCode, tErrors]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!effectiveStanding?.action) return;
    const check = validateAppealMessage(appealText);
    if (!check.valid) {
      setLocalError(
        tSafety("suspension.appealValidationError", {
          min: APPEAL_MESSAGE_MIN_LENGTH,
          max: APPEAL_MESSAGE_MAX_LENGTH,
        }),
      );
      return;
    }
    setLocalError(null);
    onSubmitAppeal?.({
      moderation_action_id: effectiveStanding.action.id,
      message: check.trimmed,
    });
    setSubmittedLocally(true);
  };

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
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <span className="text-base font-bold tracking-tight text-ink sm:text-lg">
            {SITE.name}
          </span>
          <HelpControl label={tShell("helpControl")} />
        </div>
      </header>

      <main
        id={mainId}
        tabIndex={-1}
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-5 px-4 py-6 sm:px-6 sm:py-8"
      >
        {!effectiveStanding ? (
          <Card elevated className="flex flex-col gap-4">
            <h1 className="text-xl font-bold text-ink break-words">
              {stretch(tSafety("suspension.unavailableTitle"))}
            </h1>
            <p className="text-sm text-ink-secondary break-words">
              {stretch(tSafety("suspension.unavailableBody"))}
            </p>
            <Link
              href={ROUTES.signIn}
              className="inline-flex min-h-target w-fit items-center justify-center rounded-[var(--radius-control)] bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
            >
              {stretch(tSafety("suspension.signInButton"))}
            </Link>
          </Card>
        ) : (
          <Card elevated className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold text-ink break-words">
                {stretch(
                  effectiveStanding.appeal?.state === "overturned"
                    ? tSafety("suspension.restoredTitle")
                    : effectiveStanding.status === "banned"
                      ? tSafety("suspension.bannedTitle")
                      : tSafety("suspension.suspendedTitle"),
                )}
              </h1>
              <p className="text-sm text-ink-secondary break-words">
                {stretch(
                  effectiveStanding.appeal?.state === "overturned"
                    ? tSafety("suspension.restoredBody")
                    : effectiveStanding.status === "banned"
                      ? tSafety("suspension.bannedBody")
                      : tSafety("suspension.suspendedBody"),
                )}
              </p>
            </div>

            {effectiveStanding.action ? (
              <div className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-line bg-surface-sunken p-4">
                <span className="text-xs font-semibold tracking-wide text-ink-secondary uppercase">
                  {stretch(tSafety("suspension.reasonHeading"))}
                </span>
                <p className="text-sm font-medium text-ink break-words">
                  {effectiveStanding.action.reason}
                </p>
                {effectiveStanding.action.ends_at &&
                effectiveStanding.status === "suspended" ? (
                  <p className="text-xs text-ink-muted break-words">
                    {tSafety("suspension.endsAtLabel", {
                      date: effectiveStanding.action.ends_at.slice(0, 10),
                    })}
                  </p>
                ) : null}
              </div>
            ) : null}

            {translatedApiError ? (
              <Banner
                tone="danger"
                title={stretch(tSafety("suspension.appealErrorTitle"))}
                description={stretch(translatedApiError)}
              />
            ) : null}

            {/* Existing Appeal status (open, reviewing, upheld, overturned) */}
            {effectiveStanding.appeal ? (
              <div className="flex flex-col gap-3 rounded-[var(--radius-control)] border border-line bg-surface-raised p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-ink break-words">
                    {stretch(tSafety("suspension.appealStatusHeading"))}
                  </h2>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-xs font-semibold",
                      getAppealBadgeClasses(effectiveStanding.appeal.state),
                    )}
                  >
                    {stretch(
                      tSafety(
                        `suspension.appealStates.${effectiveStanding.appeal.state}.label`,
                      ),
                    )}
                  </span>
                </div>
                <p className="text-sm text-ink-secondary break-words">
                  {stretch(
                    tSafety(
                      `suspension.appealStates.${effectiveStanding.appeal.state}.body`,
                    ),
                  )}
                </p>
                {effectiveStanding.appeal.state === "overturned" ? (
                  onEnterCloud ? (
                    <Button variant="primary" fullWidth onClick={onEnterCloud}>
                      {stretch(tSafety("backToCloud"))}
                    </Button>
                  ) : (
                    <Link
                      href={ROUTES.cloud}
                      className="inline-flex min-h-target w-full items-center justify-center rounded-[var(--radius-control)] bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
                    >
                      {stretch(tSafety("backToCloud"))}
                    </Link>
                  )
                ) : null}
              </div>
            ) : null}

            {/* In-app appeal submission form when eligible */}
            {canSubmitAppeal(effectiveStanding) ? (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-4 border-t border-line pt-4"
              >
                <div className="flex flex-col gap-1">
                  <h2 className="text-base font-semibold text-ink break-words">
                    {stretch(tSafety("suspension.appealFormHeading"))}
                  </h2>
                  <p className="text-xs text-ink-secondary break-words">
                    {stretch(tSafety("suspension.appealFormSubtitle"))}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={messageId}
                    className="text-sm font-medium text-ink break-words"
                  >
                    {stretch(tSafety("suspension.appealMessageLabel"))}
                  </label>
                  <textarea
                    id={messageId}
                    rows={4}
                    maxLength={APPEAL_MESSAGE_MAX_LENGTH}
                    value={appealText}
                    onChange={(e) => {
                      setAppealText(e.target.value);
                      if (localError) setLocalError(null);
                    }}
                    placeholder={tSafety("suspension.appealMessagePlaceholder")}
                    className="min-h-[7rem] w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus-visible:border-accent"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
                    <span>{stretch(tSafety("suspension.appealReviewNote"))}</span>
                    <span className="tabular-nums">
                      {appealText.length}/{APPEAL_MESSAGE_MAX_LENGTH}
                    </span>
                  </div>
                  {localError ? (
                    <p role="alert" className="text-xs font-medium text-danger">
                      {stretch(localError)}
                    </p>
                  ) : null}
                </div>

                <Button type="submit" variant="primary" fullWidth>
                  {stretch(tSafety("suspension.submitAppealButton"))}
                </Button>
              </form>
            ) : null}

            {/* Sign out remains available for suspended/banned users (API #44) */}
            <div className="flex justify-end border-t border-line pt-4">
              <Button variant="quiet" onClick={onSignOut}>
                {stretch(tSafety("suspension.signOutButton"))}
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
