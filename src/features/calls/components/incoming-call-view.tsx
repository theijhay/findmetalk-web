"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { Avatar, Button, Card, Chip, StatusIcon } from "@/components/ui";
import type { CallAvatarId, IncomingCallEventData } from "@/lib/calls";
import { getStatusMeta } from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface IncomingCallViewProps {
  readonly incoming: IncomingCallEventData;
  readonly viewerAvatarId: CallAvatarId;
  readonly ringMuted: boolean;
  readonly onToggleRingMuted: () => void;
  readonly onAccept: (requestId: string) => void;
  readonly onSkip: (requestId: string) => void;
  readonly stretch?: (text: string) => string;
}

/**
 * Incoming 1:1 voice call screen (Spec 7.4, 9.2, FR-PROF-6, API #22).
 *
 * - Visual cue: expanding ripple rings from the user's own orb, plus static
 *   concentric rings that remain visible under prefers-reduced-motion.
 * - Caller card: name, avatar or approved photo (allowPhoto={true}), status
 *   icon + text, spoken languages, curated interests, optional intent/country.
 * - Soft, user-mutable ring control plus Accept and silent Skip actions.
 */
export function IncomingCallView({
  incoming,
  viewerAvatarId,
  ringMuted,
  onToggleRingMuted,
  onAccept,
  onSkip,
  stretch = (v) => v,
}: IncomingCallViewProps) {
  const tCalls = useTranslations("calls");
  const tCloud = useTranslations("cloud");
  const tLang = useTranslations("languages");
  const tInterests = useTranslations("interests");
  const tIntents = useTranslations("intents");
  const tStatus = useTranslations("statusPresets");

  const { caller, request_id } = incoming;
  const presetKey = caller.status?.preset ?? "custom";
  const statusMeta = getStatusMeta(presetKey);
  const statusText =
    caller.status?.custom ??
    (caller.status?.preset ? tStatus(caller.status.preset) : tStatus("just_chat"));

  return (
    <section
      aria-label={tCalls("incoming.regionLabel")}
      className="mx-auto flex w-full max-w-lg flex-col items-center gap-6"
    >
      {/* Visual incoming cue: ripple expanding from the user's own orb (Spec 9.2) */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className="relative flex h-32 w-32 items-center justify-center"
          aria-hidden="true"
        >
          {/* Static concentric cue so reduced-motion users always keep a visual cue */}
          <span className="pointer-events-none absolute inset-1 rounded-full border-2 border-accent/35" />
          <span className="pointer-events-none absolute inset-4 rounded-full border-2 border-sky-glow/45" />
          {/* Animated ripple rings (transform + opacity only, disabled under reduced motion) */}
          <span className="incoming-orb-ripple pointer-events-none absolute inset-4 rounded-full border-2 border-accent/60" />
          <span className="incoming-orb-ripple-delayed pointer-events-none absolute inset-4 rounded-full border-2 border-sky-glow/60" />
          <Avatar
            presetId={viewerAvatarId}
            allowPhoto={false}
            size="lg"
            statusPreset="just_chat"
            label={tCalls("incoming.ownOrbLabel")}
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <p
            role="status"
            aria-live="assertive"
            className="text-sm font-semibold tracking-wide text-accent uppercase break-words"
          >
            {stretch(tCalls("incoming.eyebrow"))}
          </p>
          <h1 className="text-2xl font-bold text-ink break-words">
            {stretch(tCalls("incoming.heading", { name: caller.display_name }))}
          </h1>
          <p className="text-sm text-ink-secondary break-words">
            {stretch(tCalls("incoming.subtitle"))}
          </p>
        </div>

        {/* Soft mutable ring toggle (Spec 9.6) */}
        <Button
          variant="quiet"
          aria-pressed={ringMuted}
          onClick={onToggleRingMuted}
          className="text-xs"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="h-4 w-4 shrink-0"
            aria-hidden="true"
          >
            {ringMuted ? (
              <>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.5 4.5L5.5 8H3v4h2.5l4 3.5v-11z"
                />
                <path strokeLinecap="round" d="M13 7.5l4 5M17 7.5l-4 5" />
              </>
            ) : (
              <>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.5 4.5L5.5 8H3v4h2.5l4 3.5v-11z"
                />
                <path
                  strokeLinecap="round"
                  d="M13 7.5a3.5 3.5 0 010 5M15.3 5.5a6.5 6.5 0 010 9"
                />
              </>
            )}
          </svg>
          <span>
            {stretch(
              ringMuted
                ? tCalls("incoming.unmuteRing")
                : tCalls("incoming.muteRing"),
            )}
          </span>
        </Button>
      </div>

      {/* Caller card (FR-PROF-6: approved photo allowed on incoming-call screen) */}
      <Card elevated className="flex w-full flex-col gap-5">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar
            presetId={caller.avatar_id}
            photoUrl={caller.photo_url}
            allowPhoto={true}
            size="xl"
            statusPreset={presetKey}
            label={tCloud("profileCard.avatarLabel", {
              name: caller.display_name,
            })}
          />
          <div className="min-w-0 flex-1 flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-ink break-words">
              {caller.display_name}
            </h2>
            <div
              className={cn(
                "inline-flex w-fit items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 py-1 text-xs font-semibold",
                statusMeta.bgClass,
                statusMeta.borderClass,
                statusMeta.textClass,
              )}
            >
              <StatusIcon icon={statusMeta.icon} className="h-3.5 w-3.5" />
              <span className="break-words">{stretch(statusText)}</span>
            </div>
            {caller.intent ? (
              <p className="text-xs font-medium text-ink-secondary break-words">
                {stretch(tIntents(caller.intent))}
              </p>
            ) : null}
            {caller.country ? (
              <p className="text-xs text-ink-muted break-words">
                {tCloud("profileCard.countryLabel", {
                  country: tCloud.has(`countries.${caller.country}`)
                    ? tCloud(`countries.${caller.country}`)
                    : caller.country,
                })}
              </p>
            ) : null}
          </div>
        </div>

        {/* Languages */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-wide text-ink-secondary uppercase">
            {stretch(tCloud("profileCard.languagesHeading"))}
          </span>
          <div className="flex flex-wrap gap-2">
            {caller.languages.map((code) => (
              <Chip key={code} interactive={false} selected>
                {tLang.has(code) ? tLang(code) : code}
              </Chip>
            ))}
          </div>
        </div>

        {/* Interests */}
        {caller.interests.length > 0 ? (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-wide text-ink-secondary uppercase">
              {stretch(tCloud("profileCard.interestsHeading"))}
            </span>
            <div className="flex flex-wrap gap-2">
              {caller.interests.map((id) => (
                <Chip key={id} interactive={false}>
                  {stretch(tInterests.has(id) ? tInterests(id) : id)}
                </Chip>
              ))}
            </div>
          </div>
        ) : null}

        {/* Accept and silent Skip actions */}
        <div className="flex flex-col gap-2.5 border-t border-line pt-4 sm:flex-row">
          <Button
            variant="primary"
            fullWidth
            onClick={() => onAccept(request_id)}
          >
            {stretch(tCalls("incoming.acceptButton"))}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => onSkip(request_id)}
          >
            {stretch(tCalls("incoming.skipButton"))}
          </Button>
        </div>

        <p className="text-center text-xs text-ink-muted break-words">
          {stretch(tCalls("incoming.silentSkipNote"))}
        </p>
      </Card>
    </section>
  );
}
