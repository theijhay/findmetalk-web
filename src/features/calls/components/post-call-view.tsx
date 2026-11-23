"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { Avatar, Banner, Button, Card } from "@/components/ui";
import {
  type CallFeedbackRating,
  type CallParticipant,
  formatCallDuration,
} from "@/lib/calls";

export interface PostCallViewProps {
  readonly mode: "post_call" | "network_ended";
  readonly peer: CallParticipant;
  readonly elapsedSeconds?: number;
  readonly feedback: CallFeedbackRating | null;
  readonly onSelectFeedback: (rating: CallFeedbackRating) => void;
  readonly savedToRecents: boolean;
  readonly onTalkAgain: () => void;
  readonly onTryAgain?: () => void;
  readonly onReport?: () => void;
  readonly onDone: () => void;
  readonly stretch?: (text: string) => string;
}

/**
 * Post-call and graceful network-ended screen (Spec 7.5, 7.6, API #30, #31).
 *
 * - Never reveals private end reasons (such as block or report).
 * - Optional private thumbs up / thumbs down rating (SAFE-5).
 * - "Talk again" adds the person to Recents; "Done" returns to the cloud.
 * - Network-ended variant offers "Try again" after the 15s reconnect window.
 */
export function PostCallView({
  mode,
  peer,
  elapsedSeconds,
  feedback,
  onSelectFeedback,
  savedToRecents,
  onTalkAgain,
  onTryAgain,
  onReport,
  onDone,
  stretch = (v) => v,
}: PostCallViewProps) {
  const tCalls = useTranslations("calls");

  const isNetworkEnded = mode === "network_ended";

  return (
    <section
      aria-label={tCalls("postCall.regionLabel")}
      className="mx-auto flex w-full max-w-lg flex-col gap-5"
    >
      {isNetworkEnded ? (
        <Banner
          tone="caution"
          title={stretch(tCalls("networkEnded.bannerTitle"))}
          description={stretch(tCalls("networkEnded.bannerBody"))}
        />
      ) : null}

      <Card elevated className="flex flex-col items-center gap-5 py-7 text-center">
        <Avatar
          presetId={peer.avatar_id}
          allowPhoto={false}
          size="xl"
          statusPreset="just_chat"
          label={peer.display_name}
        />

        <div className="flex flex-col items-center gap-1">
          <h1 className="text-2xl font-bold text-ink break-words">
            {stretch(
              isNetworkEnded
                ? tCalls("networkEnded.title")
                : tCalls("postCall.title", { name: peer.display_name }),
            )}
          </h1>
          {elapsedSeconds !== undefined && elapsedSeconds > 0 ? (
            <p className="text-sm text-ink-secondary tabular-nums">
              {tCalls("postCall.durationLabel", {
                duration: formatCallDuration(elapsedSeconds),
              })}
            </p>
          ) : null}
          <p className="max-w-md text-sm text-ink-secondary break-words">
            {stretch(
              isNetworkEnded
                ? tCalls("networkEnded.subtitle", { name: peer.display_name })
                : tCalls("postCall.subtitle"),
            )}
          </p>
        </div>

        {/* Private thumbs up / down feedback (Spec 7.6, API #31, SAFE-5) */}
        {!isNetworkEnded ? (
          <div className="flex w-full flex-col items-center gap-3 rounded-[var(--radius-control)] border border-line bg-surface-sunken p-4">
            <p className="text-sm font-semibold text-ink break-words">
              {stretch(tCalls("postCall.feedbackPrompt"))}
            </p>
            <div
              role="group"
              aria-label={tCalls("postCall.feedbackGroupLabel")}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <Button
                variant={feedback === "up" ? "primary" : "secondary"}
                aria-pressed={feedback === "up"}
                onClick={() => onSelectFeedback("up")}
              >
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
                    d="M6.5 9.5V16H4a1 1 0 01-1-1v-4.5a1 1 0 011-1h2.5zm0 0l2.8-5.3A1.4 1.4 0 0111.7 5v2.5h3.5a1.5 1.5 0 011.4 2l-1.3 5A1.5 1.5 0 0113.9 16H6.5"
                  />
                </svg>
                <span>{stretch(tCalls("postCall.thumbsUp"))}</span>
              </Button>
              <Button
                variant={feedback === "down" ? "primary" : "secondary"}
                aria-pressed={feedback === "down"}
                onClick={() => onSelectFeedback("down")}
              >
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
                    d="M6.5 10.5V4H4a1 1 0 00-1 1v4.5a1 1 0 001 1h2.5zm0 0l2.8 5.3a1.4 1.4 0 002.4-.8v-2.5h3.5a1.5 1.5 0 001.4-2l-1.3-5A1.5 1.5 0 0013.9 4H6.5"
                  />
                </svg>
                <span>{stretch(tCalls("postCall.thumbsDown"))}</span>
              </Button>
            </div>
            <p className="text-xs text-ink-muted break-words">
              {stretch(
                feedback
                  ? tCalls("postCall.feedbackSaved")
                  : tCalls("postCall.feedbackPrivateNote"),
              )}
            </p>
          </div>
        ) : null}

        {/* Actions: Try again (network ended) or Talk again (post call), Done, and optional Report */}
        <div className="flex w-full flex-col gap-2.5 border-t border-line pt-4">
          {isNetworkEnded ? (
            <Button variant="primary" fullWidth onClick={onTryAgain}>
              {stretch(tCalls("networkEnded.tryAgainButton"))}
            </Button>
          ) : (
            <Button variant="primary" fullWidth onClick={onDone}>
              {stretch(tCalls("postCall.doneButton"))}
            </Button>
          )}

          {isNetworkEnded ? (
            <Button variant="secondary" fullWidth onClick={onDone}>
              {stretch(tCalls("postCall.doneButton"))}
            </Button>
          ) : (
            <Button
              variant="secondary"
              fullWidth
              disabled={savedToRecents}
              onClick={onTalkAgain}
            >
              {stretch(
                savedToRecents
                  ? tCalls("postCall.talkAgainSaved")
                  : tCalls("postCall.talkAgainButton"),
              )}
            </Button>
          )}

          {onReport ? (
            <Button variant="quiet" fullWidth onClick={onReport}>
              {stretch(tCalls("postCall.reportButton"))}
            </Button>
          ) : null}
        </div>
      </Card>
    </section>
  );
}
