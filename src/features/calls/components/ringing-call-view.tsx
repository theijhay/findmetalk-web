"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { Avatar, Button, Card, StatusIcon } from "@/components/ui";
import type { CallCallerCard, CallSuggestion } from "@/lib/calls";
import { getStatusMeta } from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface RingingCallViewProps {
  readonly mode: "ringing" | "unavailable";
  readonly callee: CallCallerCard;
  readonly suggestions?: readonly CallSuggestion[];
  readonly onCancel?: () => void;
  readonly onSelectSuggestion?: (userId: string) => void;
  readonly onBackToCloud?: () => void;
  readonly stretch?: (text: string) => string;
}

/**
 * Outgoing ringing and unavailable views (Spec 7.4, FR-CALL-4, API #22).
 *
 * - Ringing: calm pulse around callee avatar/photo and a single Cancel button.
 * - Unavailable: identical calm copy ("Not available right now") whether the
 *   callee skipped, timed out after 20s, or could not connect, with gentle
 *   suggestions of other open people.
 */
export function RingingCallView({
  mode,
  callee,
  suggestions = [],
  onCancel,
  onSelectSuggestion,
  onBackToCloud,
  stretch = (v) => v,
}: RingingCallViewProps) {
  const tCalls = useTranslations("calls");
  const tCloud = useTranslations("cloud");
  const tLang = useTranslations("languages");
  const tStatus = useTranslations("statusPresets");

  const presetKey = callee.status?.preset ?? "custom";
  const statusMeta = getStatusMeta(presetKey);
  const statusText =
    callee.status?.custom ??
    (callee.status?.preset ? tStatus(callee.status.preset) : tStatus("just_chat"));

  if (mode === "ringing") {
    return (
      <section
        aria-label={tCalls("ringing.regionLabel")}
        className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 text-center"
      >
        <Card elevated className="flex w-full flex-col items-center gap-5 py-8">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <span
              aria-hidden="true"
              className="own-orb-glow pointer-events-none absolute inset-0 rounded-full border-2 border-accent/40 bg-sky-glow/10"
            />
            <Avatar
              presetId={callee.avatar_id}
              photoUrl={callee.photo_url}
              allowPhoto={true}
              size="xl"
              statusPreset={presetKey}
              label={tCloud("profileCard.avatarLabel", {
                name: callee.display_name,
              })}
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <p
              role="status"
              aria-live="polite"
              className="text-sm font-semibold text-accent break-words"
            >
              {stretch(tCalls("ringing.status"))}
            </p>
            <h1 className="text-2xl font-bold text-ink break-words">
              {callee.display_name}
            </h1>
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 py-1 text-xs font-semibold",
                statusMeta.bgClass,
                statusMeta.borderClass,
                statusMeta.textClass,
              )}
            >
              <StatusIcon icon={statusMeta.icon} className="h-3.5 w-3.5" />
              <span className="break-words">{stretch(statusText)}</span>
            </div>
            <p className="mt-1 max-w-sm text-sm text-ink-secondary break-words">
              {stretch(tCalls("ringing.subtitle"))}
            </p>
          </div>

          <div className="w-full max-w-xs border-t border-line pt-4">
            <Button variant="secondary" fullWidth onClick={onCancel}>
              {stretch(tCalls("ringing.cancelButton"))}
            </Button>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section
      aria-label={tCalls("unavailable.regionLabel")}
      className="mx-auto flex w-full max-w-lg flex-col gap-5"
    >
      <Card elevated className="flex flex-col items-center gap-4 py-6 text-center">
        <Avatar
          presetId={callee.avatar_id}
          allowPhoto={false}
          size="lg"
          statusPreset={presetKey}
          label={callee.display_name}
        />
        <div className="flex flex-col gap-1.5">
          <h1
            role="status"
            aria-live="polite"
            className="text-xl font-bold text-ink break-words"
          >
            {stretch(tCalls("unavailable.title"))}
          </h1>
          <p className="max-w-md text-sm text-ink-secondary break-words">
            {stretch(
              tCalls("unavailable.body", { name: callee.display_name }),
            )}
          </p>
        </div>
        <Button variant="primary" onClick={onBackToCloud}>
          {stretch(tCalls("unavailable.backToCloud"))}
        </Button>
      </Card>

      {suggestions.length > 0 ? (
        <Card className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-base font-semibold text-ink break-words">
              {stretch(tCalls("unavailable.suggestionsHeading"))}
            </h2>
            <p className="text-xs text-ink-secondary break-words">
              {stretch(tCalls("unavailable.suggestionsSubtitle"))}
            </p>
          </div>
          <ul className="flex flex-col gap-3">
            {suggestions.map((person) => {
              const sPreset = person.status?.preset ?? "custom";
              const sMeta = getStatusMeta(sPreset);
              const sText =
                person.status?.custom ??
                (person.status?.preset
                  ? tStatus(person.status.preset)
                  : tStatus("just_chat"));
              const langs = person.languages
                .map((code) => (tLang.has(code) ? tLang(code) : code))
                .join(" · ");

              return (
                <li
                  key={person.user_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-line bg-surface-raised p-3"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar
                      presetId={person.avatar_id}
                      allowPhoto={false}
                      size="md"
                      statusPreset={sPreset}
                      label={person.display_name}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink break-words">
                        {person.display_name}
                      </p>
                      <p className="inline-flex items-center gap-1 text-xs font-medium text-ink-secondary break-words">
                        <StatusIcon
                          icon={sMeta.icon}
                          className={cn("h-3.5 w-3.5 shrink-0", sMeta.textClass)}
                        />
                        <span>{stretch(sText)}</span>
                      </p>
                      <p className="text-xs text-ink-muted break-words">{langs}</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => onSelectSuggestion?.(person.user_id)}
                  >
                    {stretch(
                      tCloud("profileCard.callButton", {
                        name: person.display_name,
                      }),
                    )}
                  </Button>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}
    </section>
  );
}
