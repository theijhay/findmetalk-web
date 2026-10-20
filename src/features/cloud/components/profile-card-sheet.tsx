"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import {
  Avatar,
  Button,
  Chip,
  Sheet,
  StatusIcon,
} from "@/components/ui";
import {
  canCallFromCloud,
  type PresenceStateValue,
  type ProfileCardData,
} from "@/lib/cloud";
import { getStatusMeta } from "@/lib/theme";
import { cn } from "@/lib/utils";

export interface ProfileCardSheetProps {
  readonly profile: ProfileCardData | null;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly presenceState: PresenceStateValue;
  readonly onCall?: (userId: string) => void;
  readonly onRequestOpenToTalk?: () => void;
  readonly inline?: boolean;
  readonly stretch?: (text: string) => string;
}

/**
 * Profile card opened when an orb or list row is selected (Spec 9.2, FR-PROF-6, FR-CLOUD-7).
 *
 * - Displays name, avatar or approved photo (allowPhoto={true}), status preset
 *   with icon + text, spoken languages, curated interests, optional intent and
 *   optional country.
 * - Provides one primary Call button; disables Call with a clear explanation
 *   when the viewer's own Open to talk switch is off (FR-CLOUD-7).
 */
export function ProfileCardSheet({
  profile,
  open,
  onClose,
  presenceState,
  onCall,
  onRequestOpenToTalk,
  inline = false,
  stretch = (v) => v,
}: ProfileCardSheetProps) {
  const tCloud = useTranslations("cloud");
  const tCommon = useTranslations("common");
  const tLang = useTranslations("languages");
  const tInterests = useTranslations("interests");
  const tIntents = useTranslations("intents");
  const tStatus = useTranslations("statusPresets");

  if (!profile) return null;

  const presetKey = profile.status?.preset ?? "custom";
  const statusMeta = getStatusMeta(presetKey);
  const statusText =
    profile.status?.custom ??
    (profile.status?.preset
      ? tStatus(profile.status.preset)
      : tStatus("just_chat"));

  const callGate = canCallFromCloud(presenceState);

  return (
    <Sheet
      open={open}
      inline={inline}
      onClose={onClose}
      title={profile.display_name}
      description={stretch(statusText)}
      closeLabel={tCommon("close")}
    >
      <div className="flex flex-col gap-5">
        {/* Header row with avatar/photo and status pill */}
        <div className="flex flex-wrap items-center gap-4">
          <Avatar
            presetId={profile.avatar_id}
            photoUrl={profile.photo_url}
            allowPhoto={true}
            size="xl"
            statusPreset={presetKey}
            label={tCloud("profileCard.avatarLabel", {
              name: profile.display_name,
            })}
          />
          <div className="min-w-0 flex-1 flex flex-col gap-2">
            <div
              className={cn(
                "inline-flex w-fit items-center gap-2 rounded-[var(--radius-pill)] border px-3 py-1 text-xs font-semibold",
                statusMeta.bgClass,
                statusMeta.borderClass,
                statusMeta.textClass,
              )}
            >
              <StatusIcon icon={statusMeta.icon} className="h-4 w-4" />
              <span className="break-words">{stretch(statusText)}</span>
            </div>

            {profile.intent ? (
              <p className="text-xs font-medium text-ink-secondary break-words">
                {stretch(tIntents(profile.intent))}
              </p>
            ) : null}

            {profile.country ? (
              <p className="text-xs text-ink-muted">
                {tCloud("profileCard.countryLabel", {
                  country: tCloud(`countries.${profile.country}`),
                })}
              </p>
            ) : null}
          </div>
        </div>

        {/* Spoken languages */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold tracking-wide text-ink-secondary uppercase">
            {stretch(tCloud("profileCard.languagesHeading"))}
          </span>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((code) => (
              <Chip key={code} interactive={false} selected>
                {tLang(code)}
              </Chip>
            ))}
          </div>
        </div>

        {/* Curated interests */}
        {profile.interests.length > 0 ? (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold tracking-wide text-ink-secondary uppercase">
              {stretch(tCloud("profileCard.interestsHeading"))}
            </span>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((id) => (
                <Chip key={id} interactive={false}>
                  {stretch(tInterests(id))}
                </Chip>
              ))}
            </div>
          </div>
        ) : null}

        {/* Single primary Call button + clear disabled reason when closed (FR-CLOUD-7) */}
        <div className="flex flex-col gap-2.5 border-t border-line pt-4">
          <Button
            variant="primary"
            fullWidth
            disabled={!callGate.allowed}
            onClick={() => onCall?.(profile.user_id)}
          >
            {stretch(
              tCloud("profileCard.callButton", {
                name: profile.display_name,
              }),
            )}
          </Button>

          {!callGate.allowed ? (
            <div className="flex flex-col gap-2 rounded-[var(--radius-control)] border border-line bg-surface-sunken p-3 text-xs text-ink-secondary">
              <p className="break-words">
                {stretch(
                  callGate.reasonKey === "cloud.callDisabledClosed"
                    ? tCloud("callDisabledClosed")
                    : tCloud("callDisabledBusy"),
                )}
              </p>
              {presenceState === "closed" && onRequestOpenToTalk ? (
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={onRequestOpenToTalk}
                >
                  {stretch(tCloud("turnOnOpenToTalk"))}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </Sheet>
  );
}
