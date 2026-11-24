"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { Banner, Button, Card } from "@/components/ui";
import { SITE } from "@/config/site";
import {
  canSubmitConsent,
  type ConsentRequirements,
} from "@/lib/onboarding";
import { cn } from "@/lib/utils";

export interface ConsentStepProps {
  readonly requirements: ConsentRequirements;
  readonly apiErrorCode?: string | null;
  readonly initialAgeConfirmed?: boolean;
  readonly initialRulesAccepted?: boolean;
  readonly initialRecordingAccepted?: boolean;
  readonly onContinue: (payload: {
    readonly age_confirmed: true;
    readonly rules_version: string;
    readonly recording_notice_version: string;
  }) => void;
  readonly stretch?: (text: string) => string;
}

/**
 * Explicit 18+ age confirmation, community rules and recording notice in short
 * plain language (Spec 7.1, FR-AUTH-2, SAFE-1, SAFE-8, REC-2, API #13).
 *
 * All sensitive legal/recording copy keys are listed in messages/needs-review.json.
 */
export function ConsentStep({
  requirements,
  apiErrorCode = null,
  initialAgeConfirmed = false,
  initialRulesAccepted = false,
  initialRecordingAccepted = false,
  onContinue,
  stretch = (v) => v,
}: ConsentStepProps) {
  const tOnb = useTranslations("onboarding");
  const tErrors = useTranslations("errors");

  const [ageConfirmed, setAgeConfirmed] = React.useState(initialAgeConfirmed);
  const [rulesAccepted, setRulesAccepted] = React.useState(
    initialRulesAccepted,
  );
  const [recordingAccepted, setRecordingAccepted] = React.useState(
    initialRecordingAccepted,
  );

  const ready = canSubmitConsent({
    ageConfirmed,
    rulesAccepted,
    recordingAccepted,
  });

  const translatedApiError = React.useMemo(() => {
    if (!apiErrorCode) return null;
    if (tErrors.has(apiErrorCode)) {
      return tErrors(apiErrorCode, { appName: SITE.name });
    }
    return tErrors("unknown");
  }, [apiErrorCode, tErrors]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!ready) return;
    onContinue({
      age_confirmed: true,
      rules_version: requirements.rules_version,
      recording_notice_version: requirements.recording_notice_version,
    });
  };

  return (
    <Card elevated className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-ink break-words">
          {stretch(tOnb("consent.title"))}
        </h1>
        <p className="text-sm text-ink-secondary break-words">
          {stretch(tOnb("consent.subtitle", { appName: SITE.name }))}
        </p>
      </div>

      {translatedApiError ? (
        <Banner
          tone="caution"
          title={stretch(tOnb("consent.outdatedTitle"))}
          description={stretch(translatedApiError)}
        />
      ) : null}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* 18+ age self-declaration (SAFE-1, FR-AUTH-2) */}
        <label
          className={cn(
            "flex min-h-target cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border p-4 transition-colors duration-[var(--duration-fast)]",
            ageConfirmed
              ? "border-accent bg-accent/5"
              : "border-line bg-surface-raised",
          )}
        >
          <input
            type="checkbox"
            checked={ageConfirmed}
            onChange={(e) => setAgeConfirmed(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
          />
          <span className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-ink break-words">
              {stretch(
                tOnb("consent.ageLabel", { age: requirements.minimum_age }),
              )}
            </span>
            <span className="text-xs text-ink-secondary break-words">
              {stretch(tOnb("consent.ageDetail", { appName: SITE.name }))}
            </span>
          </span>
        </label>

        {/* Short plain-language community rules (SAFE-8) */}
        <div className="flex flex-col gap-2.5 rounded-[var(--radius-control)] border border-line bg-surface-sunken p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink break-words">
              {stretch(tOnb("consent.rulesHeading"))}
            </h2>
            <span className="rounded-[var(--radius-sm)] bg-surface px-2 py-0.5 text-xs text-ink-muted">
              {tOnb("consent.versionTag", {
                version: requirements.rules_version,
              })}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-ink-secondary break-words">
            {stretch(tOnb("consent.rulesSummary", { appName: SITE.name }))}
          </p>
          <label className="flex min-h-target cursor-pointer items-center gap-3 pt-1">
            <input
              type="checkbox"
              checked={rulesAccepted}
              onChange={(e) => setRulesAccepted(e.target.checked)}
              className="h-5 w-5 shrink-0 accent-[var(--color-accent)]"
            />
            <span className="text-sm font-medium text-ink break-words">
              {stretch(tOnb("consent.rulesCheckbox"))}
            </span>
          </label>
        </div>

        {/* Short plain-language recording notice (REC-2) */}
        <div className="flex flex-col gap-2.5 rounded-[var(--radius-control)] border border-line bg-surface-sunken p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-ink break-words">
              {stretch(tOnb("consent.recordingHeading"))}
            </h2>
            <span className="rounded-[var(--radius-sm)] bg-surface px-2 py-0.5 text-xs text-ink-muted">
              {tOnb("consent.versionTag", {
                version: requirements.recording_notice_version,
              })}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-ink-secondary break-words">
            {stretch(tOnb("consent.recordingSummary", { appName: SITE.name }))}
          </p>
          <label className="flex min-h-target cursor-pointer items-center gap-3 pt-1">
            <input
              type="checkbox"
              checked={recordingAccepted}
              onChange={(e) => setRecordingAccepted(e.target.checked)}
              className="h-5 w-5 shrink-0 accent-[var(--color-accent)]"
            />
            <span className="text-sm font-medium text-ink break-words">
              {stretch(tOnb("consent.recordingCheckbox"))}
            </span>
          </label>
        </div>

        <Button type="submit" variant="primary" fullWidth disabled={!ready}>
          {stretch(tOnb("consent.continueButton"))}
        </Button>
      </form>
    </Card>
  );
}
