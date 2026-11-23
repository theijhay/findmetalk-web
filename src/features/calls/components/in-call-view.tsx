"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import {
  Avatar,
  Banner,
  Button,
  Card,
  Chip,
  Dialog,
  Sheet,
  TextField,
} from "@/components/ui";
import { RecordingIndicator } from "@/features/calls/components/recording-indicator";
import {
  CALL_RECONNECT_WINDOW_SECONDS,
  CALL_REPORT_REASONS,
  type CallConnectionQuality,
  type CallData,
  type CallParticipant,
  type CallReportReason,
  formatCallDuration,
  getConnectionQualityMeta,
  shouldShowRecordingIndicator,
} from "@/lib/calls";
import { cn } from "@/lib/utils";

export interface InCallViewProps {
  readonly call: CallData;
  readonly peer: CallParticipant;
  readonly muted: boolean;
  readonly onToggleMute: () => void;
  readonly onEndCall: () => void;
  readonly onConfirmBlock?: (peerUserId: string) => void;
  readonly onSubmitReport?: (payload: {
    readonly peerUserId: string;
    readonly callId: string;
    readonly reason: CallReportReason;
    readonly note: string;
  }) => void;
  readonly elapsedSeconds: number;
  readonly connectionQuality: CallConnectionQuality;
  readonly reconnecting?: boolean;
  readonly reconnectRemainingSeconds?: number;
  readonly initialReportOpen?: boolean;
  readonly initialBlockOpen?: boolean;
  readonly inlineModals?: boolean;
  readonly stretch?: (text: string) => string;
}

function ConnectionQualityIcon({
  icon,
}: {
  readonly icon: "signal_good" | "signal_fair" | "signal_poor" | "reconnecting";
}) {
  if (icon === "reconnecting") {
    return (
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
          d="M4 10a6 6 0 0110.2-4.2L16 7.5M16 10a6 6 0 01-10.2 4.2L4 12.5"
        />
      </svg>
    );
  }
  const activeBars = icon === "signal_good" ? 3 : icon === "signal_fair" ? 2 : 1;
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 shrink-0"
      aria-hidden="true"
    >
      <rect x="3" y="12" width="3" height="5" rx="1" />
      <rect
        x="8.5"
        y="8"
        width="3"
        height="9"
        rx="1"
        opacity={activeBars >= 2 ? 1 : 0.3}
      />
      <rect
        x="14"
        y="4"
        width="3"
        height="13"
        rx="1"
        opacity={activeBars >= 3 ? 1 : 0.3}
      />
    </svg>
  );
}

/**
 * Active 1:1 voice call screen (Spec 7.5, FR-CALL-8, FR-CALL-9, REC-2, P4, P5).
 *
 * - Audio only; zero text chat or messaging controls.
 * - End, Mute, Report and Block are ALWAYS visible on screen in every active
 *   state (connected, poor connection, reconnecting).
 * - Calm "recorded for safety" indicator remains visible for the entire call
 *   whenever `call.recorded` is true.
 */
export function InCallView({
  call,
  peer,
  muted,
  onToggleMute,
  onEndCall,
  onConfirmBlock,
  onSubmitReport,
  elapsedSeconds,
  connectionQuality,
  reconnecting = false,
  reconnectRemainingSeconds = CALL_RECONNECT_WINDOW_SECONDS,
  initialReportOpen = false,
  initialBlockOpen = false,
  inlineModals = false,
  stretch = (v) => v,
}: InCallViewProps) {
  const tCalls = useTranslations("calls");
  const tCommon = useTranslations("common");

  const [reportOpen, setReportOpen] = React.useState(initialReportOpen);
  const [blockOpen, setBlockOpen] = React.useState(initialBlockOpen);
  const [selectedReason, setSelectedReason] =
    React.useState<CallReportReason>("harassment");
  const [reportNote, setReportNote] = React.useState("");

  const effectiveQuality: CallConnectionQuality = reconnecting
    ? "reconnecting"
    : connectionQuality;
  const qualityMeta = getConnectionQualityMeta(effectiveQuality);
  const isRecorded = shouldShowRecordingIndicator(call);
  const formattedDuration = formatCallDuration(elapsedSeconds);

  const handleConfirmBlock = () => {
    setBlockOpen(false);
    onConfirmBlock?.(peer.user_id);
  };

  const handleSubmitReport = () => {
    setReportOpen(false);
    onSubmitReport?.({
      peerUserId: peer.user_id,
      callId: call.id,
      reason: selectedReason,
      note: reportNote.trim(),
    });
  };

  return (
    <section
      aria-label={tCalls("inCall.regionLabel")}
      className="mx-auto flex w-full max-w-xl flex-col gap-5"
    >
      {/* Top status bar: persistent recording indicator + connection quality */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <RecordingIndicator recorded={isRecorded} stretch={stretch} />

        <div
          role="status"
          aria-live="polite"
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 py-1.5 text-xs font-semibold",
            qualityMeta.bgClass,
            qualityMeta.borderClass,
            qualityMeta.textClass,
          )}
        >
          <ConnectionQualityIcon icon={qualityMeta.icon} />
          <span className="break-words">
            {stretch(tCalls(`quality.${effectiveQuality}`))}
          </span>
        </div>
      </div>

      {/* Reconnecting banner (Spec 7.5: up to 15 seconds) */}
      {reconnecting ? (
        <Banner
          tone="caution"
          title={stretch(tCalls("reconnecting.title"))}
          description={stretch(
            tCalls("reconnecting.body", {
              seconds: reconnectRemainingSeconds,
            }),
          )}
        />
      ) : null}

      {/* Poor connection notice */}
      {!reconnecting && connectionQuality === "poor" ? (
        <Banner
          tone="caution"
          title={stretch(tCalls("poorConnection.title"))}
          description={stretch(tCalls("poorConnection.body"))}
        />
      ) : null}

      {/* Calm voice call centre stage */}
      <Card elevated className="flex flex-col items-center gap-5 py-8 text-center">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 rounded-full border-2",
              reconnecting
                ? "border-caution/50 bg-caution/10"
                : "own-orb-glow border-good/40 bg-good/10",
            )}
          />
          <Avatar
            presetId={peer.avatar_id}
            allowPhoto={false}
            size="xl"
            statusPreset="happy_to_listen"
            label={peer.display_name}
          />
        </div>

        <div className="flex flex-col items-center gap-1">
          <h1 className="text-2xl font-bold text-ink break-words">
            {peer.display_name}
          </h1>
          <p className="text-sm font-medium text-ink-secondary tabular-nums">
            {reconnecting
              ? stretch(tCalls("inCall.reconnectingStatus"))
              : tCalls("inCall.elapsedLabel", { duration: formattedDuration })}
          </p>
          <p className="text-xs text-ink-muted break-words">
            {stretch(
              muted
                ? tCalls("inCall.micMutedStatus")
                : tCalls("inCall.micLiveStatus"),
            )}
          </p>
        </div>

        {isRecorded ? (
          <p className="max-w-md rounded-[var(--radius-control)] border border-line bg-surface-sunken px-3.5 py-2 text-xs text-ink-secondary break-words">
            {stretch(tCalls("recording.notice"))}
          </p>
        ) : null}

        {/* Always-visible primary call & safety controls (Spec 7.5, P4, P5) */}
        <div
          role="group"
          aria-label={tCalls("inCall.controlsLabel")}
          className="grid w-full grid-cols-2 gap-3 border-t border-line pt-5 sm:grid-cols-4"
        >
          {/* Mute / Unmute */}
          <Button
            variant={muted ? "primary" : "secondary"}
            aria-pressed={muted}
            onClick={onToggleMute}
            className="flex-col gap-1 py-3"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="h-5 w-5 shrink-0"
              aria-hidden="true"
            >
              <rect x="7" y="3" width="6" height="9" rx="3" />
              <path
                strokeLinecap="round"
                d="M4.5 9.5a5.5 5.5 0 0011 0M10 15v2.5M7 17.5h6"
              />
              {muted ? <path strokeLinecap="round" d="M3 3l14 14" /> : null}
            </svg>
            <span>
              {stretch(
                muted
                  ? tCalls("inCall.unmuteButton")
                  : tCalls("inCall.muteButton"),
              )}
            </span>
          </Button>

          {/* End call */}
          <Button
            variant="danger"
            onClick={onEndCall}
            className="flex-col gap-1 py-3"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="h-5 w-5 shrink-0"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12.5c3.5-3.2 10.5-3.2 14 0l-1.8 2.2a1.2 1.2 0 01-1.5.2l-2-1.2a1 1 0 01-.5-.9V11a9 9 0 00-2.4 0v1.8a1 1 0 01-.5.9l-2 1.2a1.2 1.2 0 01-1.5-.2L3 12.5z"
              />
            </svg>
            <span>{stretch(tCalls("inCall.endButton"))}</span>
          </Button>

          {/* Report */}
          <Button
            variant="secondary"
            onClick={() => setReportOpen(true)}
            className="flex-col gap-1 py-3"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="h-5 w-5 shrink-0"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 3.5v13M4.5 4.5h9.5l-1.5 3.5 1.5 3.5H4.5"
              />
            </svg>
            <span>{stretch(tCalls("inCall.reportButton"))}</span>
          </Button>

          {/* Block */}
          <Button
            variant="secondary"
            onClick={() => setBlockOpen(true)}
            className="flex-col gap-1 py-3"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              className="h-5 w-5 shrink-0"
              aria-hidden="true"
            >
              <circle cx="10" cy="10" r="7" />
              <path strokeLinecap="round" d="M5.2 5.2l9.6 9.6" />
            </svg>
            <span>{stretch(tCalls("inCall.blockButton"))}</span>
          </Button>
        </div>
      </Card>

      {/* Instant Block confirmation dialog (SAFE-2, FR-CALL-8) */}
      <Dialog
        open={blockOpen}
        inline={inlineModals}
        onClose={() => setBlockOpen(false)}
        title={stretch(tCalls("blockDialog.title", { name: peer.display_name }))}
        description={stretch(tCalls("blockDialog.description"))}
        closeLabel={tCommon("close")}
        footer={
          <>
            <Button variant="quiet" onClick={() => setBlockOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button variant="danger" onClick={handleConfirmBlock}>
              {stretch(tCalls("blockDialog.confirmButton"))}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-secondary break-words">
          {stretch(tCalls("blockDialog.body", { name: peer.display_name }))}
        </p>
      </Dialog>

      {/* Instant Report sheet (SAFE-3, FR-CALL-8) */}
      <Sheet
        open={reportOpen}
        inline={inlineModals}
        onClose={() => setReportOpen(false)}
        title={stretch(tCalls("reportSheet.title", { name: peer.display_name }))}
        description={stretch(tCalls("reportSheet.description"))}
        closeLabel={tCommon("close")}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-ink-secondary">
              {stretch(tCalls("reportSheet.reasonLabel"))}
            </span>
            <div className="flex flex-wrap gap-2">
              {CALL_REPORT_REASONS.map((reason) => (
                <Chip
                  key={reason}
                  selected={selectedReason === reason}
                  onClick={() => setSelectedReason(reason)}
                >
                  {stretch(tCalls(`reportReasons.${reason}`))}
                </Chip>
              ))}
            </div>
          </div>

          <TextField
            label={stretch(tCalls("reportSheet.noteLabel"))}
            placeholder={tCalls("reportSheet.notePlaceholder")}
            hint={stretch(tCalls("reportSheet.noteHint"))}
            maxLength={500}
            value={reportNote}
            onChange={(e) => setReportNote(e.target.value)}
          />

          <div className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
            <Button variant="quiet" onClick={() => setReportOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button variant="danger" onClick={handleSubmitReport}>
              {stretch(tCalls("reportSheet.submitButton"))}
            </Button>
          </div>
        </div>
      </Sheet>
    </section>
  );
}
