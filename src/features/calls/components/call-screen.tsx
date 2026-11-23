"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import * as React from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Button, EmptyState } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { InCallView } from "@/features/calls/components/in-call-view";
import { IncomingCallView } from "@/features/calls/components/incoming-call-view";
import { PostCallView } from "@/features/calls/components/post-call-view";
import { RingingCallView } from "@/features/calls/components/ringing-call-view";
import { useSoftRing } from "@/features/calls/use-soft-ring";
import { useWakeLock } from "@/features/calls/use-wake-lock";
import {
  CALL_RECONNECT_WINDOW_SECONDS,
  type CallAvatarId,
  type CallCallerCard,
  type CallConnectionQuality,
  type CallData,
  type CallFeedbackRating,
  type CallReportReason,
  type CallScreenPhase,
  type CallSuggestion,
  getOtherCallParticipant,
  type IncomingCallEventData,
  shouldKeepScreenAwake,
} from "@/lib/calls";

export interface CallScreenProps {
  readonly phase?: CallScreenPhase | "idle";
  readonly viewerUserId?: string;
  readonly viewerAvatarId?: CallAvatarId;
  readonly incoming?: IncomingCallEventData | null;
  readonly callee?: CallCallerCard | null;
  readonly suggestions?: readonly CallSuggestion[];
  readonly call?: CallData | null;
  readonly elapsedSeconds?: number;
  readonly connectionQuality?: CallConnectionQuality;
  readonly reconnectRemainingSeconds?: number;
  readonly initialMuted?: boolean;
  readonly initialRingMuted?: boolean;
  readonly initialFeedback?: CallFeedbackRating | null;
  readonly initialSavedToRecents?: boolean;
  readonly initialReportOpen?: boolean;
  readonly initialBlockOpen?: boolean;
  readonly enableAudioEffects?: boolean;
  readonly longCopy?: boolean;
  readonly embedded?: boolean;
  readonly onAccept?: (requestId: string) => void;
  readonly onSkip?: (requestId: string) => void;
  readonly onCancelOutgoing?: () => void;
  readonly onSelectSuggestion?: (userId: string) => void;
  readonly onEndCall?: () => void;
  readonly onBlockPeer?: (peerUserId: string) => void;
  readonly onReportPeer?: (payload: {
    readonly peerUserId: string;
    readonly callId: string;
    readonly reason: CallReportReason;
    readonly note: string;
  }) => void;
  readonly onSubmitFeedback?: (rating: CallFeedbackRating) => void;
  readonly onTalkAgain?: () => void;
  readonly onTryAgain?: () => void;
  readonly onBackToCloud?: () => void;
}

/**
 * Presentational orchestrator for every 1:1 voice call state (Spec 7.4 to 7.6,
 * FR-CALL-4, REC-2, P4, P5).
 *
 * Renders inside AppShell with `surface="call"` so primary navigation is hidden
 * while the "I need help" control stays reachable at all times. Requests screen
 * wake lock where supported during active call phases.
 */
export function CallScreen({
  phase: controlledPhase = "idle",
  viewerUserId = "",
  viewerAvatarId = "avatar_02",
  incoming = null,
  callee = null,
  suggestions = [],
  call = null,
  elapsedSeconds = 0,
  connectionQuality = "good",
  reconnectRemainingSeconds = CALL_RECONNECT_WINDOW_SECONDS,
  initialMuted = false,
  initialRingMuted = false,
  initialFeedback = null,
  initialSavedToRecents = false,
  initialReportOpen = false,
  initialBlockOpen = false,
  enableAudioEffects = true,
  longCopy = false,
  embedded = false,
  onAccept,
  onSkip,
  onCancelOutgoing,
  onSelectSuggestion,
  onEndCall,
  onBlockPeer,
  onReportPeer,
  onSubmitFeedback,
  onTalkAgain,
  onTryAgain,
  onBackToCloud,
}: CallScreenProps) {
  const tCalls = useTranslations("calls");

  const [muted, setMuted] = React.useState(initialMuted);
  const [ringMuted, setRingMuted] = React.useState(initialRingMuted);
  const [feedback, setFeedback] = React.useState<CallFeedbackRating | null>(
    initialFeedback,
  );
  const [savedToRecents, setSavedToRecents] = React.useState(
    initialSavedToRecents,
  );

  const stretch = React.useCallback(
    (text: string) => {
      if (!longCopy) return text;
      const pad = text.slice(0, Math.max(6, Math.ceil(text.length * 0.4)));
      return `${text} (${pad})`;
    },
    [longCopy],
  );

  const keepAwake =
    controlledPhase !== "idle" &&
    !embedded &&
    shouldKeepScreenAwake(controlledPhase);
  useWakeLock(keepAwake);

  useSoftRing({
    active: controlledPhase === "incoming",
    muted: ringMuted,
    enabled: enableAudioEffects && !embedded,
  });

  const peer = React.useMemo(() => {
    if (call) {
      return getOtherCallParticipant(call, viewerUserId);
    }
    if (callee) {
      return {
        user_id: callee.user_id,
        display_name: callee.display_name,
        avatar_id: callee.avatar_id,
      };
    }
    if (incoming) {
      return {
        user_id: incoming.caller.user_id,
        display_name: incoming.caller.display_name,
        avatar_id: incoming.caller.avatar_id,
      };
    }
    return null;
  }, [call, callee, incoming, viewerUserId]);

  const handleFeedback = (rating: CallFeedbackRating) => {
    setFeedback(rating);
    onSubmitFeedback?.(rating);
  };

  const handleTalkAgain = () => {
    setSavedToRecents(true);
    onTalkAgain?.();
  };

  return (
    <AppShell
      inlinePreview={embedded}
      surface="call"
      bannerState="normal"
      reconnectWindowSeconds={reconnectRemainingSeconds}
    >
      {controlledPhase === "incoming" && incoming ? (
        <IncomingCallView
          incoming={incoming}
          viewerAvatarId={viewerAvatarId}
          ringMuted={ringMuted}
          onToggleRingMuted={() => setRingMuted((prev) => !prev)}
          onAccept={(id) => onAccept?.(id)}
          onSkip={(id) => onSkip?.(id)}
          stretch={stretch}
        />
      ) : controlledPhase === "ringing" && callee ? (
        <RingingCallView
          mode="ringing"
          callee={callee}
          onCancel={onCancelOutgoing}
          stretch={stretch}
        />
      ) : controlledPhase === "unavailable" && callee ? (
        <RingingCallView
          mode="unavailable"
          callee={callee}
          suggestions={suggestions}
          onSelectSuggestion={onSelectSuggestion}
          onBackToCloud={onBackToCloud}
          stretch={stretch}
        />
      ) : (controlledPhase === "in_call" ||
          controlledPhase === "reconnecting") &&
        call &&
        peer ? (
        <InCallView
          call={call}
          peer={peer}
          muted={muted}
          onToggleMute={() => setMuted((prev) => !prev)}
          onEndCall={() => onEndCall?.()}
          onConfirmBlock={onBlockPeer}
          onSubmitReport={onReportPeer}
          elapsedSeconds={elapsedSeconds}
          connectionQuality={connectionQuality}
          reconnecting={controlledPhase === "reconnecting"}
          reconnectRemainingSeconds={reconnectRemainingSeconds}
          initialReportOpen={initialReportOpen}
          initialBlockOpen={initialBlockOpen}
          inlineModals={embedded}
          stretch={stretch}
        />
      ) : (controlledPhase === "post_call" ||
          controlledPhase === "network_ended") &&
        peer ? (
        <PostCallView
          mode={controlledPhase}
          peer={peer}
          elapsedSeconds={elapsedSeconds}
          feedback={feedback}
          onSelectFeedback={handleFeedback}
          savedToRecents={savedToRecents}
          onTalkAgain={handleTalkAgain}
          onTryAgain={onTryAgain}
          onReport={
            controlledPhase === "post_call"
              ? () =>
                  onReportPeer?.({
                    peerUserId: peer.user_id,
                    callId: call?.id ?? "",
                    reason: "other",
                    note: "",
                  })
              : undefined
          }
          onDone={() => onBackToCloud?.()}
          stretch={stretch}
        />
      ) : (
        <EmptyState
          title={stretch(tCalls("idle.title"))}
          body={stretch(tCalls("idle.body"))}
          action={
            onBackToCloud ? (
              <Button variant="primary" onClick={onBackToCloud}>
                {stretch(tCalls("idle.backToCloud"))}
              </Button>
            ) : (
              <Link
                href={ROUTES.cloud}
                className="inline-flex min-h-target items-center justify-center rounded-[var(--radius-control)] bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-colors duration-[var(--duration-fast)] hover:bg-accent-hover"
              >
                {stretch(tCalls("idle.backToCloud"))}
              </Link>
            )
          }
        />
      )}
    </AppShell>
  );
}
