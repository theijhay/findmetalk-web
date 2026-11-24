"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { Avatar, Button, Card } from "@/components/ui";
import type { BlockRequestPayload, SafetyAvatarId } from "@/lib/safety";

export interface BlockConfirmViewProps {
  readonly targetUserId: string;
  readonly targetDisplayName: string;
  readonly targetAvatarId: SafetyAvatarId;
  readonly callId?: string | null;
  readonly circleId?: string | null;
  readonly initialBlocked?: boolean;
  readonly onConfirmBlock?: (payload: BlockRequestPayload) => void;
  readonly onCancel?: () => void;
  readonly onBackToCloud?: () => void;
  readonly stretch?: (text: string) => string;
}

/**
 * One-tap block with a gentle confirmation; once confirmed the person
 * disappears cleanly from the cloud and Recents (SAFE-2, FR-CALL-8, API #27).
 */
export function BlockConfirmView({
  targetUserId,
  targetDisplayName,
  targetAvatarId,
  callId = null,
  circleId = null,
  initialBlocked = false,
  onConfirmBlock,
  onCancel,
  onBackToCloud,
  stretch = (v) => v,
}: BlockConfirmViewProps) {
  const tSafety = useTranslations("safety");
  const tCommon = useTranslations("common");
  const [blocked, setBlocked] = React.useState(initialBlocked);

  const handleConfirm = () => {
    onConfirmBlock?.({
      user_id: targetUserId,
      call_id: callId,
      circle_id: circleId,
    });
    setBlocked(true);
  };

  if (blocked) {
    return (
      <Card elevated className="mx-auto flex w-full max-w-md flex-col items-center gap-4 py-7 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-surface-sunken text-ink-secondary">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="7" />
            <path strokeLinecap="round" d="M5.2 5.2l9.6 9.6" />
          </svg>
        </div>

        <div className="flex flex-col gap-1.5">
          <h1
            role="status"
            aria-live="polite"
            className="text-xl font-bold text-ink break-words"
          >
            {stretch(tSafety("block.doneTitle", { name: targetDisplayName }))}
          </h1>
          <p className="text-sm text-ink-secondary break-words">
            {stretch(tSafety("block.doneBody"))}
          </p>
        </div>

        <Button variant="primary" fullWidth onClick={onBackToCloud}>
          {stretch(tSafety("backToCloud"))}
        </Button>
      </Card>
    );
  }

  return (
    <Card elevated className="mx-auto flex w-full max-w-md flex-col gap-5">
      <div className="flex items-center gap-3.5">
        <Avatar
          presetId={targetAvatarId}
          allowPhoto={false}
          size="md"
          label={targetDisplayName}
        />
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-ink break-words">
            {stretch(tSafety("block.title", { name: targetDisplayName }))}
          </h1>
          <p className="text-xs text-ink-secondary break-words">
            {stretch(tSafety("block.subtitle"))}
          </p>
        </div>
      </div>

      <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-secondary">
        <li>{stretch(tSafety("block.effectPermanent"))}</li>
        <li>{stretch(tSafety("block.effectDisappear"))}</li>
        <li>{stretch(tSafety("block.effectSilent", { name: targetDisplayName }))}</li>
      </ul>

      <div className="flex flex-col gap-2.5 border-t border-line pt-4 sm:flex-row-reverse">
        <Button variant="danger" fullWidth onClick={handleConfirm}>
          {stretch(tSafety("block.confirmButton", { name: targetDisplayName }))}
        </Button>
        {onCancel ? (
          <Button variant="quiet" fullWidth onClick={onCancel}>
            {tCommon("cancel")}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
