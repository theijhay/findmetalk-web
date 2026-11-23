/**
 * Pure 1:1 call logic: caller-side state normalization, always-visible safety
 * controls, recording indicator gating, reconnect countdown, duration
 * formatting, connection quality metadata, and iOS 15-safe Wake Lock detection
 * (Spec 7.4, 7.5, 7.6, 9.6, FR-CALL-4, FR-CALL-8, FR-CALL-9, REC-2, P4, P5).
 *
 * Kept free of imports so the Node test runner can load it directly.
 */

export const CALL_RING_TIMEOUT_SECONDS = 20;
export const CALL_RECONNECT_WINDOW_SECONDS = 15;

export type CallRequestSource = "browse" | "recents";

export type CallRequestCalleeState =
  | "ringing"
  | "accepted"
  | "skipped"
  | "expired"
  | "cancelled";

export type CallRequestCallerState =
  | "ringing"
  | "accepted"
  | "cancelled"
  | "unavailable";

export type CallRequestRawState =
  | CallRequestCalleeState
  | "failed"
  | "unavailable";

export type CallAvatarId =
  | "avatar_01"
  | "avatar_02"
  | "avatar_03"
  | "avatar_04"
  | "avatar_05"
  | "avatar_06"
  | "avatar_07"
  | "avatar_08";

export type CallStatusPresetId =
  | "just_chat"
  | "rough_day"
  | "happy_to_listen"
  | "cant_sleep"
  | "practicing_language"
  | "bored_say_hi"
  | "study_break";

export interface CallStatus {
  readonly preset: CallStatusPresetId | null;
  readonly custom: string | null;
}

export interface CallCallerCard {
  readonly user_id: string;
  readonly display_name: string;
  readonly avatar_id: CallAvatarId;
  readonly photo_url: string | null;
  readonly languages: readonly string[];
  readonly interests: readonly string[];
  readonly intent: "want_to_talk" | "happy_to_listen" | null;
  readonly country: string | null;
  readonly status: CallStatus | null;
}

export interface CallRequestData {
  readonly id: string;
  readonly state: CallRequestCallerState | CallRequestCalleeState;
  readonly source: CallRequestSource;
  readonly caller_id: string;
  readonly callee_id: string;
  readonly created_at: string;
  readonly expires_at: string;
}

export interface IncomingCallEventData {
  readonly request_id: string;
  readonly caller: CallCallerCard;
  readonly expires_at: string;
}

export interface CallParticipant {
  readonly user_id: string;
  readonly display_name: string;
  readonly avatar_id: CallAvatarId;
}

export interface CallData {
  readonly id: string;
  readonly request_id: string;
  readonly participants: readonly CallParticipant[];
  readonly started_at: string;
  readonly ended_at: string | null;
  readonly recorded: boolean;
}

export interface RecentEntryData {
  readonly user_id: string;
  readonly display_name: string;
  readonly avatar_id: CallAvatarId;
  readonly last_call_at: string;
  readonly is_open: boolean;
}

export interface CallSuggestion {
  readonly user_id: string;
  readonly display_name: string;
  readonly avatar_id: CallAvatarId;
  readonly languages: readonly string[];
  readonly status: CallStatus | null;
}

export type CallFeedbackRating = "up" | "down";

export type CallConnectionQuality = "good" | "fair" | "poor" | "reconnecting";

export type CallScreenPhase =
  | "incoming"
  | "ringing"
  | "unavailable"
  | "in_call"
  | "reconnecting"
  | "network_ended"
  | "post_call";

export const IN_CALL_SAFETY_CONTROLS = [
  "mute",
  "end",
  "report",
  "block",
] as const;

export type CallSafetyControlId = (typeof IN_CALL_SAFETY_CONTROLS)[number];

export const CALL_REPORT_REASONS = [
  "harassment",
  "sexual_content",
  "hate",
  "scam",
  "underage",
  "self_harm",
  "other",
] as const;

export type CallReportReason = (typeof CALL_REPORT_REASONS)[number];

/**
 * FR-CALL-4 / Spec 7.4: Skip, timeout and failure are completely
 * indistinguishable to the caller. All map to "unavailable".
 */
export function normalizeCallerRequestState(
  rawState: CallRequestRawState,
): CallRequestCallerState {
  if (rawState === "ringing" || rawState === "accepted" || rawState === "cancelled") {
    return rawState;
  }
  return "unavailable";
}

/**
 * Spec 7.5 / P4 / P5: End, Mute, Report and Block must remain on screen in
 * every active in-call state (including poor connection and reconnecting).
 */
export function getAlwaysVisibleCallControls(
  phase: CallScreenPhase,
): readonly CallSafetyControlId[] {
  if (phase === "in_call" || phase === "reconnecting") {
    return IN_CALL_SAFETY_CONTROLS;
  }
  return [];
}

/**
 * REC-2: A visible "recorded for safety" indicator must stay on screen for the
 * entire duration of any call where the API reports recorded: true.
 */
export function shouldShowRecordingIndicator(
  call: Pick<CallData, "recorded"> | null | undefined,
): boolean {
  return Boolean(call?.recorded);
}

/**
 * Spec 9.6: Keep the screen awake while ringing, receiving a call, or in call.
 */
export function shouldKeepScreenAwake(phase: CallScreenPhase): boolean {
  return (
    phase === "incoming" ||
    phase === "ringing" ||
    phase === "in_call" ||
    phase === "reconnecting"
  );
}

/**
 * FR-CALL-9: Calm elapsed duration display with no time limits or countdowns.
 */
export function formatCallDuration(elapsedSeconds: number): string {
  const safe = Math.max(0, Math.floor(elapsedSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Spec 7.5 / API #26: Reconnecting window runs up to 15 seconds, then ends
 * gracefully with a "Try again" option.
 */
export function computeReconnectCountdown(
  elapsedReconnectSeconds: number,
  windowSeconds: number = CALL_RECONNECT_WINDOW_SECONDS,
): {
  readonly remainingSeconds: number;
  readonly timedOut: boolean;
} {
  const safeWindow = Math.max(1, Math.floor(windowSeconds));
  const safeElapsed = Math.max(0, Math.floor(elapsedReconnectSeconds));
  const remainingSeconds = Math.max(0, safeWindow - safeElapsed);
  return {
    remainingSeconds,
    timedOut: remainingSeconds === 0,
  };
}

export interface ConnectionQualityMeta {
  readonly quality: CallConnectionQuality;
  readonly icon: "signal_good" | "signal_fair" | "signal_poor" | "reconnecting";
  readonly bgClass: string;
  readonly borderClass: string;
  readonly textClass: string;
}

const CONNECTION_QUALITY_META: Readonly<
  Record<CallConnectionQuality, ConnectionQualityMeta>
> = {
  good: {
    quality: "good",
    icon: "signal_good",
    bgClass: "bg-good/10",
    borderClass: "border-good/35",
    textClass: "text-good",
  },
  fair: {
    quality: "fair",
    icon: "signal_fair",
    bgClass: "bg-caution/10",
    borderClass: "border-caution/35",
    textClass: "text-caution",
  },
  poor: {
    quality: "poor",
    icon: "signal_poor",
    bgClass: "bg-danger/10",
    borderClass: "border-danger/35",
    textClass: "text-danger",
  },
  reconnecting: {
    quality: "reconnecting",
    icon: "reconnecting",
    bgClass: "bg-caution/15",
    borderClass: "border-caution/45",
    textClass: "text-caution",
  },
};

export function getConnectionQualityMeta(
  quality: CallConnectionQuality,
): ConnectionQualityMeta {
  return CONNECTION_QUALITY_META[quality];
}

export function getOtherCallParticipant(
  call: Pick<CallData, "participants">,
  viewerUserId: string,
): CallParticipant | null {
  const other = call.participants.find(
    (participant) => participant.user_id !== viewerUserId,
  );
  return other ?? call.participants[0] ?? null;
}

/**
 * Spec 9.6 / Browser floor (iOS 15.4): Feature-detect Screen Wake Lock API so
 * older Safari/Android browsers degrade cleanly with no runtime error.
 */
export function isWakeLockSupported(
  nav: { readonly wakeLock?: { readonly request?: unknown } } | null | undefined,
): boolean {
  return Boolean(
    nav &&
      "wakeLock" in nav &&
      nav.wakeLock &&
      typeof nav.wakeLock.request === "function",
  );
}
