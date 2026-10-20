"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { useAppearance } from "@/components/providers";
import {
  Avatar,
  Banner,
  Button,
  Card,
  Chip,
  CodeInput,
  Dialog,
  EmptyState,
  IconButton,
  Select,
  Sheet,
  Skeleton,
  StatusIcon,
  Switch,
  TextField,
  Toast,
} from "@/components/ui";
import {
  LANGUAGE_SPECIMENS,
  PREVIEW_AVATAR_PRESETS,
  PREVIEW_PROFILE_FIXTURES,
  PREVIEW_SKY_PALETTES,
  PREVIEW_STATUS_LIST,
} from "@/components/ui/fixtures";
import { SITE } from "@/config/site";
import { cn } from "@/lib/utils";

function stretch(text: string, enabled: boolean): string {
  if (!enabled) return text;
  const pad = text.slice(0, Math.max(6, Math.ceil(text.length * 0.42)));
  return `${text} (${pad})`;
}

export function DesignSystemPreview() {
  const t = useTranslations("preview");
  const tCommon = useTranslations("common");
  const tLang = useTranslations("languages");
  const tInterests = useTranslations("interests");
  const tIntents = useTranslations("intents");
  const tStatus = useTranslations("statusPresets");

  const { preference, theme, sky, localHour, setPreference, setSimulatedHour } =
    useAppearance();

  const [longCopy, setLongCopy] = React.useState(false);
  const [openSwitch, setOpenSwitch] = React.useState(true);
  const [closedSwitch, setClosedSwitch] = React.useState(false);
  const [nameValue, setNameValue] = React.useState("Tolu");
  const [codeValue, setCodeValue] = React.useState("482910");
  const [errorCodeValue, setErrorCodeValue] = React.useState("12");
  const [selectedLang, setSelectedLang] = React.useState("yo");
  const [selectedChips, setSelectedChips] = React.useState<Record<string, boolean>>({
    music: true,
    books: false,
    football: false,
    study: true,
    late_night: false,
  });
  const [modalDialogOpen, setModalDialogOpen] = React.useState(false);
  const [modalSheetOpen, setModalSheetOpen] = React.useState(false);

  const languageOptions = React.useMemo(
    () => [
      { value: "en", label: tLang("en") },
      { value: "pcm", label: tLang("pcm") },
      { value: "yo", label: tLang("yo") },
      { value: "ha", label: tLang("ha") },
      { value: "ig", label: tLang("ig") },
      { value: "fr", label: tLang("fr") },
    ],
    [tLang],
  );

  const toggleChip = (id: string) => {
    setSelectedChips((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-2 border-b border-line pb-6">
        <h1 className="text-2xl font-bold text-ink sm:text-3xl break-words">
          {stretch(t("title", { appName: SITE.name }), longCopy)}
        </h1>
        <p className="max-w-3xl text-base text-ink-secondary break-words">
          {stretch(t("subtitle"), longCopy)}
        </p>
      </header>

      {/* Appearance & Stress Controls */}
      <section aria-labelledby="preview-controls-heading" className="flex flex-col gap-4">
        <h2 id="preview-controls-heading" className="text-lg font-semibold text-ink">
          {t("controls.heading")}
        </h2>
        <Card className="flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">
                {t("controls.themeLabel")} ({theme} · {sky} · {String(localHour).padStart(2, "0")}:00)
              </span>
              <div className="flex flex-wrap gap-2">
                <Chip
                  selected={preference === "auto"}
                  onClick={() => setPreference("auto")}
                >
                  {t("controls.themeAuto")}
                </Chip>
                <Chip
                  selected={preference === "light"}
                  onClick={() => setPreference("light")}
                >
                  {t("controls.themeLight")}
                </Chip>
                <Chip
                  selected={preference === "dark"}
                  onClick={() => setPreference("dark")}
                >
                  {t("controls.themeDark")}
                </Chip>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">{t("controls.timeLabel")}</span>
              <div className="flex flex-wrap gap-2">
                <Chip selected={false} onClick={() => setSimulatedHour(null)}>
                  {t("controls.timeLive")}
                </Chip>
                <Chip
                  selected={localHour === 6}
                  onClick={() => {
                    setPreference("auto");
                    setSimulatedHour(6);
                  }}
                >
                  {t("controls.timeDawn")}
                </Chip>
                <Chip
                  selected={localHour === 13}
                  onClick={() => {
                    setPreference("auto");
                    setSimulatedHour(13);
                  }}
                >
                  {t("controls.timeDay")}
                </Chip>
                <Chip
                  selected={localHour === 18}
                  onClick={() => {
                    setPreference("auto");
                    setSimulatedHour(18);
                  }}
                >
                  {t("controls.timeDusk")}
                </Chip>
                <Chip
                  selected={localHour === 23}
                  onClick={() => {
                    setPreference("auto");
                    setSimulatedHour(23);
                  }}
                >
                  {t("controls.timeNight")}
                </Chip>
              </div>
            </div>
          </div>

          <div className="border-t border-line pt-4">
            <Switch
              checked={longCopy}
              onCheckedChange={setLongCopy}
              label={t("controls.longCopyLabel")}
              description={t("controls.longCopyDescription")}
              onLabel={tCommon("on")}
              offLabel={tCommon("off")}
            />
          </div>
        </Card>
      </section>

      {/* Ambient Time-of-Day Palettes */}
      <section aria-labelledby="preview-palettes-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="preview-palettes-heading" className="text-lg font-semibold text-ink">
            {t("palettes.heading")}
          </h2>
          <p className="mt-1 text-sm text-ink-secondary">{t("palettes.description")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PREVIEW_SKY_PALETTES.map(({ period }) => (
            <div
              key={period}
              data-palette={period}
              className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-gradient-to-b from-sky-top to-sky-bottom p-4 text-ink shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink">{t(`palettes.${period}`)}</span>
                <span
                  className="h-6 w-6 rounded-[var(--radius-pill)] border border-surface bg-sky-glow shadow-[var(--shadow-card)]"
                  aria-hidden="true"
                />
              </div>
              <p className="text-xs text-ink-secondary">{t("palettes.skyPreview")}</p>
              <div className="rounded-[var(--radius-control)] border border-line bg-surface p-3">
                <p className="text-sm font-medium text-ink">
                  {stretch(t("palettes.surfacePreview"), longCopy)}
                </p>
                <p className="mt-1 text-xs text-ink-secondary">
                  {stretch(t("palettes.secondarySample"), longCopy)}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-[var(--radius-sm)] bg-accent px-2 py-0.5 text-xs font-medium text-on-accent">
                    accent
                  </span>
                  <span className="rounded-[var(--radius-sm)] bg-good px-2 py-0.5 text-xs font-medium text-on-good">
                    good
                  </span>
                  <span className="rounded-[var(--radius-sm)] bg-caution px-2 py-0.5 text-xs font-medium text-on-caution">
                    caution
                  </span>
                  <span className="rounded-[var(--radius-sm)] bg-danger px-2 py-0.5 text-xs font-medium text-on-danger">
                    danger
                  </span>
                  <span className="rounded-[var(--radius-sm)] bg-help px-2 py-0.5 text-xs font-medium text-on-help">
                    help
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Status Presets (colour + icon + text) */}
      <section aria-labelledby="preview-statuses-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="preview-statuses-heading" className="text-lg font-semibold text-ink">
            {t("statuses.heading")}
          </h2>
          <p className="mt-1 text-sm text-ink-secondary">{t("statuses.description")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PREVIEW_STATUS_LIST.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-card)] border bg-surface p-3.5 shadow-[var(--shadow-card)]",
                item.borderClass,
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-pill)]",
                  item.bgClass,
                  item.textClass,
                )}
              >
                <StatusIcon icon={item.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-semibold break-words", item.textClass)}>
                  {stretch(tStatus(item.id), longCopy)}
                </p>
                <p className="text-xs text-ink-muted">{item.id}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Self-hosted Typeface & Six-Language Diacritics */}
      <section aria-labelledby="preview-typeface-heading" className="flex flex-col gap-4">
        <div>
          <h2 id="preview-typeface-heading" className="text-lg font-semibold text-ink">
            {t("typography.heading")}
          </h2>
          <p className="mt-1 text-sm text-ink-secondary">{t("typography.description")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {LANGUAGE_SPECIMENS.map((spec) => (
            <Card key={spec.code} lang={spec.code} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-ink">{tLang(spec.code)}</h3>
                <span className="rounded-[var(--radius-sm)] bg-surface-sunken px-2 py-0.5 text-xs font-medium text-ink-secondary uppercase">
                  {spec.code}
                </span>
              </div>
              <p className="text-xs font-medium text-ink-muted">{t("typography.requiredGlyphs")}</p>
              <p className="rounded-[var(--radius-sm)] bg-surface-sunken px-3 py-2 text-base font-semibold tracking-wide text-ink break-words">
                {spec.characters}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-ink-secondary break-words">
                {spec.sample}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Button & IconButton */}
      <section aria-labelledby="preview-buttons-heading" className="flex flex-col gap-4">
        <h2 id="preview-buttons-heading" className="text-lg font-semibold text-ink">
          {t("buttons.heading")}
        </h2>
        <Card className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">
              {stretch(t("buttons.primary"), longCopy)}
            </Button>
            <Button variant="secondary">
              {stretch(t("buttons.secondary"), longCopy)}
            </Button>
            <Button variant="quiet">
              {stretch(t("buttons.quiet"), longCopy)}
            </Button>
            <Button variant="danger">
              {stretch(t("buttons.danger"), longCopy)}
            </Button>
            <Button variant="primary" disabled>
              {stretch(t("buttons.disabled"), longCopy)}
            </Button>
          </div>
          <div className="max-w-sm">
            <Button variant="primary" fullWidth>
              {t("buttons.longPrimary")}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
            <IconButton variant="primary" aria-label={t("buttons.iconMute")}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden="true">
                <rect x="7" y="3" width="6" height="9" rx="3" />
                <path strokeLinecap="round" d="M4.5 9.5a5.5 5.5 0 0011 0M10 15v2.5M7 17.5h6" />
              </svg>
            </IconButton>
            <IconButton variant="secondary" aria-label={t("buttons.iconSettings")}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden="true">
                <circle cx="10" cy="10" r="3" />
                <path strokeLinecap="round" d="M10 2.5v2M10 15.5v2M2.5 10h2M15.5 10h2M4.7 4.7l1.4 1.4M13.9 13.9l1.4 1.4M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4" />
              </svg>
            </IconButton>
            <IconButton variant="quiet" aria-label={t("buttons.iconHelp")}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 16.5s-6-3.8-6-8.2A3.5 3.5 0 0110 5.7a3.5 3.5 0 016 2.6c0 4.4-6 8.2-6 8.2z" />
              </svg>
            </IconButton>
            <IconButton variant="danger" aria-label={t("buttons.iconEnd")}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12.5c3.5-3.2 10.5-3.2 14 0l-1.8 2.2a1.2 1.2 0 01-1.5.2l-2-1.2a1 1 0 01-.5-.9V11a9 9 0 00-2.4 0v1.8a1 1 0 01-.5.9l-2 1.2a1.2 1.2 0 01-1.5-.2L3 12.5z" />
              </svg>
            </IconButton>
            <IconButton variant="secondary" disabled aria-label={t("buttons.iconMute")}>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5" aria-hidden="true">
                <rect x="7" y="3" width="6" height="9" rx="3" />
                <path strokeLinecap="round" d="M3 3l14 14" />
              </svg>
            </IconButton>
          </div>
        </Card>
      </section>

      {/* Switch */}
      <section aria-labelledby="preview-switches-heading" className="flex flex-col gap-4">
        <h2 id="preview-switches-heading" className="text-lg font-semibold text-ink">
          {t("switches.heading")}
        </h2>
        <Card className="flex flex-col gap-5">
          <Switch
            checked={openSwitch}
            onCheckedChange={setOpenSwitch}
            label={stretch(t("switches.openLabel"), longCopy)}
            description={stretch(t("switches.openDescription"), longCopy)}
            onLabel={tCommon("on")}
            offLabel={tCommon("off")}
          />
          <div className="border-t border-line pt-4">
            <Switch
              checked={closedSwitch}
              onCheckedChange={setClosedSwitch}
              label={stretch(t("switches.closedLabel"), longCopy)}
              description={stretch(t("switches.closedDescription"), longCopy)}
              onLabel={tCommon("on")}
              offLabel={tCommon("off")}
            />
          </div>
          <div className="border-t border-line pt-4">
            <Switch
              checked={false}
              disabled
              label={stretch(t("switches.disabledLabel"), longCopy)}
              onLabel={tCommon("on")}
              offLabel={tCommon("off")}
            />
          </div>
        </Card>
      </section>

      {/* TextField, Select and CodeInput */}
      <section aria-labelledby="preview-inputs-heading" className="flex flex-col gap-4">
        <h2 id="preview-inputs-heading" className="text-lg font-semibold text-ink">
          {t("inputs.heading")}
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="flex flex-col gap-5">
            <TextField
              label={stretch(t("inputs.nameLabel"), longCopy)}
              placeholder={t("inputs.namePlaceholder")}
              hint={stretch(t("inputs.nameHint"), longCopy)}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
            />
            <TextField
              label={stretch(t("inputs.nameErrorLabel"), longCopy)}
              defaultValue="A"
              error={stretch(t("inputs.nameError"), longCopy)}
            />
            <TextField
              label={stretch(t("inputs.nameDisabledLabel"), longCopy)}
              value="ada@example.com"
              disabled
            />
            <Select
              label={stretch(t("inputs.languageLabel"), longCopy)}
              hint={stretch(t("inputs.languageHint"), longCopy)}
              options={languageOptions}
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
            />
            <Select
              label={stretch(t("inputs.languageErrorLabel"), longCopy)}
              options={languageOptions}
              defaultValue="en"
              error={stretch(t("inputs.languageError"), longCopy)}
            />
            <Select
              label={stretch(t("inputs.languageLabel"), longCopy)}
              options={languageOptions}
              defaultValue="en"
              disabled
            />
          </Card>

          <Card className="flex flex-col gap-6">
            <CodeInput
              label={stretch(t("inputs.codeLabel"), longCopy)}
              hint={stretch(t("inputs.codeHint"), longCopy)}
              value={codeValue}
              onChange={setCodeValue}
              digitLabelTemplate={(index, total) => t("inputs.codeDigit", { index, total })}
            />
            <CodeInput
              label={stretch(t("inputs.codeErrorLabel"), longCopy)}
              error={stretch(t("inputs.codeError"), longCopy)}
              value={errorCodeValue}
              onChange={setErrorCodeValue}
              digitLabelTemplate={(index, total) => t("inputs.codeDigit", { index, total })}
            />
            <CodeInput
              label={stretch(t("inputs.codeLabel"), longCopy)}
              value="904215"
              onChange={() => {}}
              disabled
              digitLabelTemplate={(index, total) => t("inputs.codeDigit", { index, total })}
            />
          </Card>
        </div>
      </section>

      {/* Chip & Avatar */}
      <section aria-labelledby="preview-chips-avatars-heading" className="flex flex-col gap-4">
        <h2 id="preview-chips-avatars-heading" className="text-lg font-semibold text-ink">
          {t("chipsAndAvatars.heading")}
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-ink">{t("chipsAndAvatars.chipsLabel")}</h3>
            <div className="flex flex-wrap gap-2.5">
              {(["music", "books", "football", "study", "late_night"] as const).map((id) => (
                <Chip
                  key={id}
                  selected={Boolean(selectedChips[id])}
                  onClick={() => toggleChip(id)}
                >
                  {stretch(tInterests(id), longCopy)}
                </Chip>
              ))}
              <Chip selected={false} disabled>
                {tInterests("music")}
              </Chip>
              <Chip interactive={false} selected>
                {tIntents("happy_to_listen")}
              </Chip>
            </div>
          </Card>

          <Card className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-ink">{t("chipsAndAvatars.avatarsLabel")}</h3>
            <div className="flex flex-wrap items-center gap-3">
              {PREVIEW_AVATAR_PRESETS.map((presetId, idx) => (
                <Avatar
                  key={presetId}
                  presetId={presetId}
                  label={t("chipsAndAvatars.avatarPresetLabel", { id: idx + 1 })}
                  size="md"
                  statusPreset={PREVIEW_STATUS_LIST[idx]?.id ?? null}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-6 border-t border-line pt-4">
              {PREVIEW_PROFILE_FIXTURES[1] ? (
                <>
                  <div className="flex items-center gap-3">
                    <Avatar
                      presetId={PREVIEW_PROFILE_FIXTURES[1].avatar_id}
                      photoUrl={PREVIEW_PROFILE_FIXTURES[1].photo_url}
                      allowPhoto={true}
                      size="lg"
                      statusPreset="just_chat"
                      label={t("chipsAndAvatars.photoCardLabel", {
                        name: PREVIEW_PROFILE_FIXTURES[1].display_name,
                      })}
                    />
                    <span className="max-w-[11rem] text-xs text-ink-secondary">
                      {t("chipsAndAvatars.photoCardLabel", {
                        name: PREVIEW_PROFILE_FIXTURES[1].display_name,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar
                      presetId={PREVIEW_PROFILE_FIXTURES[1].avatar_id}
                      photoUrl={PREVIEW_PROFILE_FIXTURES[1].photo_url}
                      allowPhoto={false}
                      size="lg"
                      statusPreset="just_chat"
                      label={t("chipsAndAvatars.photoOrbLabel", {
                        name: PREVIEW_PROFILE_FIXTURES[1].display_name,
                      })}
                    />
                    <span className="max-w-[11rem] text-xs text-ink-secondary">
                      {t("chipsAndAvatars.photoOrbLabel", {
                        name: PREVIEW_PROFILE_FIXTURES[1].display_name,
                      })}
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          </Card>
        </div>
      </section>

      {/* Card, Skeleton & EmptyState */}
      <section aria-labelledby="preview-cards-states-heading" className="flex flex-col gap-4">
        <h2 id="preview-cards-states-heading" className="text-lg font-semibold text-ink">
          {t("cardsAndStates.heading")}
        </h2>
        <div className="grid gap-6 lg:grid-cols-3">
          {PREVIEW_PROFILE_FIXTURES[0] ? (
            <Card className="flex flex-col justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <Avatar
                  presetId={PREVIEW_PROFILE_FIXTURES[0].avatar_id}
                  photoUrl={PREVIEW_PROFILE_FIXTURES[0].photo_url}
                  size="lg"
                  statusPreset={PREVIEW_PROFILE_FIXTURES[0].status?.preset}
                  label={PREVIEW_PROFILE_FIXTURES[0].display_name}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-ink">
                    {PREVIEW_PROFILE_FIXTURES[0].display_name}
                  </h3>
                  <p className="mt-0.5 text-sm text-ink-secondary">
                    {stretch(t("cardsAndStates.cardStandardBody"), longCopy)}
                  </p>
                </div>
              </div>
              <Button variant="primary" fullWidth>
                {t("cardsAndStates.callAction", {
                  name: PREVIEW_PROFILE_FIXTURES[0].display_name,
                })}
              </Button>
            </Card>
          ) : null}

          <Card elevated className="flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-ink">
                {stretch(t("cardsAndStates.cardElevatedTitle"), longCopy)}
              </h3>
              <p className="mt-1 text-sm text-ink-secondary">
                {stretch(t("cardsAndStates.cardElevatedBody"), longCopy)}
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <Skeleton label={t("cardsAndStates.skeletonCardLabel")} className="h-12 w-full" />
              <Skeleton label={t("cardsAndStates.skeletonRowLabel")} className="h-8 w-3/4" />
            </div>
          </Card>

          <EmptyState
            title={stretch(t("cardsAndStates.emptyTitle"), longCopy)}
            body={stretch(t("cardsAndStates.emptyBody"), longCopy)}
            action={
              <Button variant="primary">
                {stretch(t("cardsAndStates.emptyAction"), longCopy)}
              </Button>
            }
          />
        </div>
      </section>

      {/* Banner, Toast, Dialog & Sheet */}
      <section aria-labelledby="preview-feedback-heading" className="flex flex-col gap-4">
        <h2 id="preview-feedback-heading" className="text-lg font-semibold text-ink">
          {t("feedback.heading")}
        </h2>

        <div className="flex flex-col gap-3">
          <Banner
            tone="info"
            title={stretch(t("feedback.bannerInfoTitle"), longCopy)}
            description={stretch(t("feedback.bannerInfoBody"), longCopy)}
          />
          <Banner
            tone="good"
            title={stretch(t("feedback.bannerGoodTitle"), longCopy)}
            description={stretch(t("feedback.bannerGoodBody"), longCopy)}
          />
          <Banner
            tone="caution"
            title={stretch(t("feedback.bannerCautionTitle"), longCopy)}
            description={stretch(t("feedback.bannerCautionBody"), longCopy)}
          />
          <Banner
            tone="danger"
            title={stretch(t("feedback.bannerDangerTitle", { appName: SITE.name }), longCopy)}
            description={stretch(t("feedback.bannerDangerBody"), longCopy)}
            action={<Button variant="secondary">{tCommon("retry")}</Button>}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Toast
            tone="neutral"
            title={stretch(t("feedback.toastNeutralTitle"), longCopy)}
            description={stretch(t("feedback.toastNeutralBody"), longCopy)}
            dismissLabel={t("feedback.dismissToast")}
            onDismiss={() => {}}
          />
          <Toast
            tone="good"
            title={stretch(t("feedback.toastGoodTitle"), longCopy)}
            description={stretch(t("feedback.toastGoodBody"), longCopy)}
            dismissLabel={t("feedback.dismissToast")}
            onDismiss={() => {}}
          />
          <Toast
            tone="caution"
            title={stretch(t("feedback.toastCautionTitle"), longCopy)}
            description={stretch(t("feedback.toastCautionBody"), longCopy)}
            dismissLabel={t("feedback.dismissToast")}
            onDismiss={() => {}}
          />
          <Toast
            tone="danger"
            title={stretch(t("feedback.toastDangerTitle"), longCopy)}
            description={stretch(t("feedback.toastDangerBody"), longCopy)}
            dismissLabel={t("feedback.dismissToast")}
            onDismiss={() => {}}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div>
              <Button variant="secondary" onClick={() => setModalDialogOpen(true)}>
                {t("feedback.openDialogButton")}
              </Button>
            </div>
            <Dialog
              open={true}
              inline
              onClose={() => {}}
              title={stretch(t("feedback.dialogTitle"), longCopy)}
              description={stretch(t("feedback.dialogDescription"), longCopy)}
              closeLabel={tCommon("close")}
              footer={
                <>
                  <Button variant="quiet">{tCommon("cancel")}</Button>
                  <Button variant="primary">{tCommon("confirm")}</Button>
                </>
              }
            >
              <p>{stretch(t("feedback.dialogBody"), longCopy)}</p>
            </Dialog>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <Button variant="secondary" onClick={() => setModalSheetOpen(true)}>
                {t("feedback.openSheetButton")}
              </Button>
            </div>
            <Sheet
              open={true}
              inline
              onClose={() => {}}
              title={t("feedback.sheetTitle")}
              description={stretch(t("feedback.sheetDescription"), longCopy)}
              closeLabel={tCommon("close")}
            >
              <div className="flex flex-col gap-4">
                <p className="text-sm text-ink-secondary">
                  {stretch(t("feedback.sheetBody"), longCopy)}
                </p>
                <Button variant="primary" fullWidth>
                  {t("cardsAndStates.callAction", { name: t("feedback.sheetTitle") })}
                </Button>
              </div>
            </Sheet>
          </div>
        </div>

        <Dialog
          open={modalDialogOpen}
          onClose={() => setModalDialogOpen(false)}
          title={t("feedback.dialogTitle")}
          description={t("feedback.dialogDescription")}
          closeLabel={tCommon("close")}
          footer={
            <>
              <Button variant="quiet" onClick={() => setModalDialogOpen(false)}>
                {tCommon("cancel")}
              </Button>
              <Button variant="primary" onClick={() => setModalDialogOpen(false)}>
                {tCommon("confirm")}
              </Button>
            </>
          }
        >
          <p>{t("feedback.dialogBody")}</p>
        </Dialog>

        <Sheet
          open={modalSheetOpen}
          onClose={() => setModalSheetOpen(false)}
          title={t("feedback.sheetTitle")}
          description={t("feedback.sheetDescription")}
          closeLabel={tCommon("close")}
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-ink-secondary">{t("feedback.sheetBody")}</p>
            <Button variant="primary" fullWidth onClick={() => setModalSheetOpen(false)}>
              {t("cardsAndStates.callAction", { name: t("feedback.sheetTitle") })}
            </Button>
          </div>
        </Sheet>
      </section>
    </main>
  );
}
