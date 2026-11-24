"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { HelpControl } from "@/components/layout/help-control";
import { Avatar, Banner, Button, Card, Chip } from "@/components/ui";
import {
  isPriorityReportReason,
  REPORT_NOTE_MAX_LENGTH,
  REPORT_REASONS,
  type ReportRequestPayload,
  type SafetyAvatarId,
  type SafetyReportReason,
  validateReportNote,
} from "@/lib/safety";

export interface ReportScreenProps {
  readonly targetUserId: string;
  readonly targetDisplayName: string;
  readonly targetAvatarId: SafetyAvatarId;
  readonly callId?: string | null;
  readonly circleId?: string | null;
  readonly photoId?: string | null;
  readonly initialReason?: SafetyReportReason | null;
  readonly initialSubmitted?: boolean;
  readonly onSubmit?: (payload: ReportRequestPayload) => void;
  readonly onCancel?: () => void;
  readonly onBackToCloud?: () => void;
  readonly stretch?: (text: string) => string;
}

/**
 * Dedicated one-screen Report flow completed in two taps: pick a reason, then
 * submit (SAFE-3, SAFE-4, FR-CALL-8, API #28).
 *
 * Reporting also creates an instant block for the reporter and ends any active
 * call immediately.
 */
export function ReportScreen({
  targetUserId,
  targetDisplayName,
  targetAvatarId,
  callId = null,
  circleId = null,
  photoId = null,
  initialReason = null,
  initialSubmitted = false,
  onSubmit,
  onCancel,
  onBackToCloud,
  stretch = (v) => v,
}: ReportScreenProps) {
  const tSafety = useTranslations("safety");
  const tCommon = useTranslations("common");
  const tShell = useTranslations("shell");

  const [reason, setReason] = React.useState<SafetyReportReason | null>(
    initialReason,
  );
  const [note, setNote] = React.useState("");
  const [noteError, setNoteError] = React.useState<string | null>(null);
  const [submitted, setSubmitted] = React.useState(initialSubmitted);
  const noteId = React.useId();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!reason) return;
    const check = validateReportNote(note);
    if (!check.valid) {
      setNoteError(
        tSafety("report.noteTooLong", { max: REPORT_NOTE_MAX_LENGTH }),
      );
      return;
    }
    setNoteError(null);
    onSubmit?.({
      reported_user_id: targetUserId,
      reason,
      note: check.normalized,
      call_id: callId,
      circle_id: circleId,
      photo_id: photoId,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card elevated className="mx-auto flex w-full max-w-lg flex-col items-center gap-5 py-7 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-good/40 bg-good/10 text-good">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 10.5l3.5 3.5 7.5-8"
            />
          </svg>
        </div>

        <div className="flex flex-col gap-1.5">
          <h1
            role="status"
            aria-live="polite"
            className="text-xl font-bold text-ink break-words"
          >
            {stretch(tSafety("report.submittedTitle"))}
          </h1>
          <p className="text-sm text-ink-secondary break-words">
            {stretch(
              tSafety("report.submittedBody", { name: targetDisplayName }),
            )}
          </p>
        </div>

        <div className="flex w-full flex-col gap-2.5 border-t border-line pt-4">
          <Button variant="primary" fullWidth onClick={onBackToCloud}>
            {stretch(tSafety("backToCloud"))}
          </Button>
          <div className="flex justify-center pt-1">
            <HelpControl label={tShell("helpControl")} />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card elevated className="mx-auto flex w-full max-w-lg flex-col gap-5">
      <div className="flex items-center gap-3.5">
        <Avatar
          presetId={targetAvatarId}
          allowPhoto={false}
          size="md"
          label={targetDisplayName}
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-ink break-words">
            {stretch(tSafety("report.title", { name: targetDisplayName }))}
          </h1>
          <p className="text-xs text-ink-secondary break-words">
            {stretch(tSafety("report.subtitle"))}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-2.5">
          <legend className="text-sm font-semibold text-ink break-words">
            {stretch(tSafety("report.reasonLabel"))}
          </legend>
          <div className="flex flex-wrap gap-2">
            {REPORT_REASONS.map((item) => (
              <Chip
                key={item}
                selected={reason === item}
                onClick={() => setReason(item)}
              >
                {stretch(tSafety(`report.reasons.${item}`))}
              </Chip>
            ))}
          </div>
        </fieldset>

        {reason && isPriorityReportReason(reason) ? (
          <Banner
            tone="info"
            title={stretch(tSafety("report.priorityTitle"))}
            description={stretch(tSafety("report.priorityBody"))}
          />
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={noteId}
            className="text-sm font-medium text-ink break-words"
          >
            {stretch(tSafety("report.noteLabel"))}
          </label>
          <textarea
            id={noteId}
            rows={3}
            maxLength={REPORT_NOTE_MAX_LENGTH}
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              if (noteError) setNoteError(null);
            }}
            placeholder={tSafety("report.notePlaceholder")}
            className="min-h-[5.5rem] w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus-visible:border-accent"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
            <span>{stretch(tSafety("report.noteHint"))}</span>
            <span className="tabular-nums">
              {note.length}/{REPORT_NOTE_MAX_LENGTH}
            </span>
          </div>
          {noteError ? (
            <p role="alert" className="text-xs font-medium text-danger">
              {stretch(noteError)}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2.5 border-t border-line pt-4 sm:flex-row-reverse">
          <Button
            type="submit"
            variant="danger"
            fullWidth
            disabled={!reason}
          >
            {stretch(tSafety("report.submitButton"))}
          </Button>
          {onCancel ? (
            <Button
              type="button"
              variant="quiet"
              fullWidth
              onClick={onCancel}
            >
              {tCommon("cancel")}
            </Button>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
