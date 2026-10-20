"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import {
  Avatar,
  Button,
  Chip,
  Sheet,
  StatusIcon,
  Switch,
  TextField,
} from "@/components/ui";
import {
  type CloudStatusPresetId,
  CUSTOM_STATUS_MAX_LENGTH,
  type PresenceStatus,
  validateCustomStatus,
} from "@/lib/cloud";
import { getStatusMeta } from "@/lib/theme";
import { cn } from "@/lib/utils";

const SELECTABLE_PRESETS: readonly CloudStatusPresetId[] = [
  "just_chat",
  "rough_day",
  "happy_to_listen",
  "cant_sleep",
  "practicing_language",
  "bored_say_hi",
  "study_break",
];

export interface OwnOrbBarProps {
  readonly viewerName: string;
  readonly viewerAvatarId:
    | "avatar_01"
    | "avatar_02"
    | "avatar_03"
    | "avatar_04"
    | "avatar_05"
    | "avatar_06"
    | "avatar_07"
    | "avatar_08";
  readonly isOpen: boolean;
  readonly status: PresenceStatus;
  readonly onToggleOpen: (nextOpen: boolean) => void;
  readonly onChangeStatus: (nextStatus: PresenceStatus) => void;
  readonly statusPickerOpen?: boolean;
  readonly onStatusPickerOpenChange?: (open: boolean) => void;
  readonly inlineSheet?: boolean;
  readonly stretch?: (text: string) => string;
}

/**
 * User's own orb fixed at the bottom centre with the Open to talk switch
 * and status selector (Spec 9.2, 9.4, FR-CLOUD-1, API #20).
 *
 * - ON: glowing and gently pulsing (disabled under prefers-reduced-motion).
 * - OFF: dimmed.
 */
export function OwnOrbBar({
  viewerName,
  viewerAvatarId,
  isOpen,
  status,
  onToggleOpen,
  onChangeStatus,
  statusPickerOpen: controlledPickerOpen,
  onStatusPickerOpenChange,
  inlineSheet = false,
  stretch = (v) => v,
}: OwnOrbBarProps) {
  const tCloud = useTranslations("cloud");
  const tCommon = useTranslations("common");
  const tStatus = useTranslations("statusPresets");

  const [uncontrolledPickerOpen, setUncontrolledPickerOpen] =
    React.useState(false);
  const [customDraft, setCustomDraft] = React.useState(status.custom ?? "");
  const [customError, setCustomError] = React.useState<string | null>(null);

  const pickerOpen =
    controlledPickerOpen !== undefined
      ? controlledPickerOpen
      : uncontrolledPickerOpen;

  const setPickerOpen = React.useCallback(
    (next: boolean) => {
      if (onStatusPickerOpenChange) {
        onStatusPickerOpenChange(next);
      } else {
        setUncontrolledPickerOpen(next);
      }
    },
    [onStatusPickerOpenChange],
  );

  const presetKey = status.preset ?? "custom";
  const statusMeta = getStatusMeta(presetKey);
  const statusLabel =
    status.custom ??
    (status.preset ? tStatus(status.preset) : tStatus("just_chat"));

  const handleSaveCustom = () => {
    const check = validateCustomStatus(customDraft);
    if (!check.valid) {
      setCustomError(
        tCloud("ownOrb.customStatusError", { max: CUSTOM_STATUS_MAX_LENGTH }),
      );
      return;
    }
    setCustomError(null);
    onChangeStatus({ preset: null, custom: check.trimmed });
    setPickerOpen(false);
  };

  return (
    <>
      <div className="mx-auto w-full max-w-xl">
        <div
          className={cn(
            "flex flex-col gap-3 rounded-[var(--radius-card)] border bg-surface-raised/95 p-3.5 shadow-[var(--shadow-raised)] backdrop-blur-md transition-opacity duration-[var(--duration-normal)] sm:flex-row sm:items-center sm:justify-between",
            isOpen ? "border-accent" : "border-line opacity-90",
          )}
        >
          {/* Own orb + status button */}
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-[var(--radius-pill)] transition-opacity duration-[var(--duration-normal)]",
                isOpen
                  ? "own-orb-glow ring-4 ring-sky-glow/35"
                  : "opacity-60",
              )}
            >
              <Avatar
                presetId={viewerAvatarId}
                allowPhoto={false}
                size="md"
                statusPreset={presetKey}
                label={tCloud("ownOrb.avatarLabel", {
                  name: viewerName,
                  state: isOpen ? tCommon("on") : tCommon("off"),
                })}
              />
              <span
                className={cn(
                  "absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-[var(--radius-pill)] border bg-surface",
                  statusMeta.borderClass,
                  statusMeta.textClass,
                )}
                aria-hidden="true"
              >
                <StatusIcon icon={statusMeta.icon} className="h-3 w-3" />
              </span>
            </div>

            <div className="min-w-0 flex-1 flex flex-col items-start gap-1">
              <span className="text-xs font-semibold text-ink-secondary">
                {stretch(
                  isOpen
                    ? tCloud("ownOrb.stateOpen")
                    : tCloud("ownOrb.stateClosed"),
                )}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCustomDraft(status.custom ?? "");
                  setCustomError(null);
                  setPickerOpen(true);
                }}
                aria-label={tCloud("ownOrb.changeStatusAria", {
                  status: statusLabel,
                })}
                className={cn(
                  "inline-flex min-h-target items-center gap-1.5 rounded-[var(--radius-pill)] border px-3 py-1.5 text-left text-xs font-semibold transition-colors duration-[var(--duration-fast)] hover:opacity-90 whitespace-normal break-words",
                  statusMeta.bgClass,
                  statusMeta.borderClass,
                  statusMeta.textClass,
                )}
              >
                <StatusIcon icon={statusMeta.icon} className="h-3.5 w-3.5" />
                <span>{stretch(statusLabel)}</span>
              </button>
            </div>
          </div>

          {/* Open to talk switch */}
          <div className="border-t border-line pt-2.5 sm:border-t-0 sm:pt-0">
            <Switch
              checked={isOpen}
              onCheckedChange={onToggleOpen}
              label={stretch(tCloud("ownOrb.switchLabel"))}
              description={stretch(
                isOpen
                  ? tCloud("ownOrb.switchOpenHint")
                  : tCloud("ownOrb.switchClosedHint"),
              )}
              onLabel={tCommon("on")}
              offLabel={tCommon("off")}
            />
          </div>
        </div>
      </div>

      {/* Status preset & custom status selector sheet (Spec 9.4, API #20) */}
      <Sheet
        open={pickerOpen}
        inline={inlineSheet}
        onClose={() => setPickerOpen(false)}
        title={stretch(tCloud("ownOrb.statusSheetTitle"))}
        description={stretch(tCloud("ownOrb.statusSheetDescription"))}
        closeLabel={tCommon("close")}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {SELECTABLE_PRESETS.map((presetId) => {
              const meta = getStatusMeta(presetId);
              const isSelected =
                status.preset === presetId && status.custom === null;
              return (
                <Chip
                  key={presetId}
                  selected={isSelected}
                  onClick={() => {
                    onChangeStatus({ preset: presetId, custom: null });
                    setPickerOpen(false);
                  }}
                >
                  <StatusIcon icon={meta.icon} className="h-3.5 w-3.5" />
                  <span>{stretch(tStatus(presetId))}</span>
                </Chip>
              );
            })}
          </div>

          <div className="flex flex-col gap-2.5 border-t border-line pt-4">
            <TextField
              label={stretch(tCloud("ownOrb.customStatusLabel"))}
              placeholder={tCloud("ownOrb.customStatusPlaceholder")}
              hint={tCloud("ownOrb.customStatusHint", {
                max: CUSTOM_STATUS_MAX_LENGTH,
              })}
              error={customError ?? undefined}
              maxLength={CUSTOM_STATUS_MAX_LENGTH}
              value={customDraft}
              onChange={(e) => setCustomDraft(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="quiet" onClick={() => setPickerOpen(false)}>
                {tCommon("cancel")}
              </Button>
              <Button variant="primary" onClick={handleSaveCustom}>
                {stretch(tCloud("ownOrb.saveCustomStatus"))}
              </Button>
            </div>
          </div>
        </div>
      </Sheet>
    </>
  );
}
