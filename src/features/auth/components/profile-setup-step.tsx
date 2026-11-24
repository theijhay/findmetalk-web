"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import {
  Avatar,
  Banner,
  Button,
  Card,
  Chip,
  Select,
  TextField,
} from "@/components/ui";
import {
  type ApiFieldValidationError,
  DISPLAY_NAME_MAX,
  DISPLAY_NAME_MIN,
  INTERESTS_MAX,
  LANGUAGES_MAX,
  LANGUAGES_MIN,
  ONBOARDING_AVATAR_IDS,
  ONBOARDING_COUNTRY_CODES,
  ONBOARDING_INTEREST_IDS,
  type OnboardingAvatarId,
  type OnboardingIntent,
  type OnboardingInterestId,
  type PhotoModerationState,
  type ProfileDraft,
  SUPPORTED_UI_LANGUAGES,
  type SupportedLanguageCode,
  validateProfileDraft,
} from "@/lib/onboarding";
import { cn } from "@/lib/utils";

export interface ProfileSetupStepProps {
  readonly initialDraft?: Partial<ProfileDraft>;
  readonly initialPhotoState?: PhotoModerationState;
  readonly apiFieldErrors?: readonly ApiFieldValidationError[];
  readonly onSave: (draft: ProfileDraft) => void;
  readonly stretch?: (text: string) => string;
}

const DEFAULT_DRAFT: ProfileDraft = {
  display_name: "",
  avatar_id: "avatar_02",
  languages: ["en"],
  interests: [],
  intent: null,
  country: null,
  ui_language: "en",
};

/**
 * Profile setup step (Spec 7.1, FR-PROF-1 to FR-PROF-5, FR-PROF-7, SAFE-10,
 * API #17).
 *
 * - Display name (2 to 24 chars), curated avatar picker, optional photo with
 *   automated moderation status, 1 to 3 spoken languages, 0 to 5 curated
 *   interests, optional intent and optional opted-in country.
 * - Maps every API #17 field error code to a visible translated message.
 */
export function ProfileSetupStep({
  initialDraft,
  initialPhotoState = "none",
  apiFieldErrors = [],
  onSave,
  stretch = (v) => v,
}: ProfileSetupStepProps) {
  const tOnb = useTranslations("onboarding");
  const tCloud = useTranslations("cloud");
  const tLang = useTranslations("languages");
  const tInterests = useTranslations("interests");
  const tIntents = useTranslations("intents");
  const tErrors = useTranslations("errors");

  const [displayName, setDisplayName] = React.useState(
    initialDraft?.display_name ?? DEFAULT_DRAFT.display_name,
  );
  const [avatarId, setAvatarId] = React.useState<OnboardingAvatarId>(
    (initialDraft?.avatar_id as OnboardingAvatarId) ?? "avatar_02",
  );
  const [languages, setLanguages] = React.useState<string[]>(
    initialDraft?.languages
      ? [...initialDraft.languages]
      : [...DEFAULT_DRAFT.languages],
  );
  const [interests, setInterests] = React.useState<string[]>(
    initialDraft?.interests ? [...initialDraft.interests] : [],
  );
  const [intent, setIntent] = React.useState<OnboardingIntent | null>(
    initialDraft?.intent ?? null,
  );
  const [country, setCountry] = React.useState<string | null>(
    initialDraft?.country ?? null,
  );
  const [uiLanguage] = React.useState<SupportedLanguageCode>(
    initialDraft?.ui_language ?? "en",
  );
  const [photoState, setPhotoState] =
    React.useState<PhotoModerationState>(initialPhotoState);
  const [localErrors, setLocalErrors] = React.useState<
    readonly ApiFieldValidationError[]
  >([]);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const combinedErrors = React.useMemo(() => {
    const map = new Map<string, string>();
    for (const err of apiFieldErrors) {
      map.set(err.field, err.code);
    }
    for (const err of localErrors) {
      map.set(err.field, err.code);
    }
    return map;
  }, [apiFieldErrors, localErrors]);

  const translateFieldError = React.useCallback(
    (field: string): string | undefined => {
      const code = combinedErrors.get(field);
      if (!code) return undefined;
      return tErrors.has(code) ? tErrors(code) : tErrors("validation_failed");
    },
    [combinedErrors, tErrors],
  );

  const toggleLanguage = (code: SupportedLanguageCode) => {
    setLocalErrors((prev) => prev.filter((item) => item.field !== "languages"));
    setLanguages((prev) => {
      if (prev.includes(code)) {
        return prev.filter((item) => item !== code);
      }
      if (prev.length >= LANGUAGES_MAX) return prev;
      return [...prev, code];
    });
  };

  const toggleInterest = (id: OnboardingInterestId) => {
    setLocalErrors((prev) => prev.filter((item) => item.field !== "interests"));
    setInterests((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= INTERESTS_MAX) return prev;
      return [...prev, id];
    });
  };

  const countryOptions = React.useMemo(
    () => [
      { value: "", label: tOnb("profile.countryHiddenOption") },
      ...ONBOARDING_COUNTRY_CODES.map((code) => ({
        value: code,
        label: tCloud(`countries.${code}`),
      })),
    ],
    [tOnb, tCloud],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const draft: ProfileDraft = {
      display_name: displayName.trim(),
      avatar_id: avatarId,
      languages,
      interests,
      intent,
      country,
      ui_language: uiLanguage,
    };
    const errors = validateProfileDraft(draft);
    if (errors.length > 0) {
      setLocalErrors(errors);
      return;
    }
    setLocalErrors([]);
    onSave(draft);
  };

  const displayNameError = translateFieldError("display_name");
  const avatarError = translateFieldError("avatar_id");
  const languagesError = translateFieldError("languages");
  const interestsError = translateFieldError("interests");
  const countryError = translateFieldError("country");

  return (
    <Card elevated className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-ink break-words">
          {stretch(tOnb("profile.title"))}
        </h1>
        <p className="text-sm text-ink-secondary break-words">
          {stretch(tOnb("profile.subtitle"))}
        </p>
      </div>

      {combinedErrors.size > 0 ? (
        <Banner
          tone="danger"
          title={stretch(tOnb("errorBannerTitle"))}
          description={stretch(tErrors("validation_failed"))}
        />
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        {/* Display name (FR-PROF-1: 2 to 24 chars) */}
        <TextField
          label={stretch(tOnb("profile.displayNameLabel"))}
          placeholder={tOnb("profile.displayNamePlaceholder")}
          hint={stretch(
            tOnb("profile.displayNameHint", {
              min: DISPLAY_NAME_MIN,
              max: DISPLAY_NAME_MAX,
            }),
          )}
          maxLength={DISPLAY_NAME_MAX}
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            setLocalErrors((prev) =>
              prev.filter((item) => item.field !== "display_name"),
            );
          }}
          error={displayNameError ? stretch(displayNameError) : undefined}
        />

        {/* Illustrated avatar preset picker (FR-PROF-2) */}
        <fieldset className="flex flex-col gap-2.5">
          <legend className="text-sm font-medium text-ink break-words">
            {stretch(tOnb("profile.avatarLabel"))}
          </legend>
          <p className="text-xs text-ink-secondary break-words">
            {stretch(tOnb("profile.avatarHint"))}
          </p>
          <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-8">
            {ONBOARDING_AVATAR_IDS.map((id, idx) => {
              const selected = avatarId === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={selected}
                  aria-label={tOnb("profile.avatarOptionAria", {
                    index: idx + 1,
                  })}
                  onClick={() => setAvatarId(id)}
                  className={cn(
                    "flex min-h-target min-w-target items-center justify-center rounded-[var(--radius-control)] border p-1.5 transition-colors duration-[var(--duration-fast)]",
                    selected
                      ? "border-accent bg-accent/10 ring-2 ring-accent"
                      : "border-line bg-surface hover:border-line-strong",
                  )}
                >
                  <Avatar
                    presetId={id}
                    allowPhoto={false}
                    size="sm"
                    label={tOnb("profile.avatarOptionAria", { index: idx + 1 })}
                  />
                </button>
              );
            })}
          </div>
          {avatarError ? (
            <p role="alert" className="text-xs font-medium text-danger">
              {stretch(avatarError)}
            </p>
          ) : null}
        </fieldset>

        {/* Optional photo with automated moderation status (FR-PROF-2, FR-PROF-7, SAFE-10) */}
        <div className="flex flex-col gap-3 rounded-[var(--radius-control)] border border-line bg-surface-sunken p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-ink break-words">
                {stretch(tOnb("profile.photoHeading"))}
              </h2>
              <p className="text-xs text-ink-secondary break-words">
                {stretch(tOnb("profile.photoHint"))}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                aria-label={tOnb("profile.photoChooseButton")}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setPhotoState("pending");
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                {stretch(tOnb("profile.photoChooseButton"))}
              </Button>
              {photoState !== "none" ? (
                <Button
                  type="button"
                  variant="quiet"
                  onClick={() => setPhotoState("none")}
                >
                  {stretch(tOnb("profile.photoRemoveButton"))}
                </Button>
              ) : null}
            </div>
          </div>

          {photoState === "pending" ? (
            <p
              role="status"
              className="rounded-[var(--radius-sm)] border border-caution/40 bg-caution/10 px-3 py-2 text-xs font-medium text-caution break-words"
            >
              {stretch(tOnb("profile.photoPendingStatus"))}
            </p>
          ) : null}
          {photoState === "approved" ? (
            <p
              role="status"
              className="rounded-[var(--radius-sm)] border border-good/40 bg-good/10 px-3 py-2 text-xs font-medium text-good break-words"
            >
              {stretch(tOnb("profile.photoApprovedStatus"))}
            </p>
          ) : null}
          {photoState === "rejected" ? (
            <p
              role="status"
              className="rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 py-2 text-xs font-medium text-ink-secondary break-words"
            >
              {stretch(tOnb("profile.photoRejectedStatus"))}
            </p>
          ) : null}
        </div>

        {/* Spoken languages (FR-PROF-3: 1 to 3 required) */}
        <fieldset className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <legend className="text-sm font-medium text-ink break-words">
              {stretch(tOnb("profile.languagesLabel"))}
            </legend>
            <span className="text-xs text-ink-muted">
              {tOnb("profile.selectionCount", {
                count: languages.length,
                max: LANGUAGES_MAX,
              })}
            </span>
          </div>
          <p className="text-xs text-ink-secondary break-words">
            {stretch(
              tOnb("profile.languagesHint", {
                min: LANGUAGES_MIN,
                max: LANGUAGES_MAX,
              }),
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {SUPPORTED_UI_LANGUAGES.map((code) => {
              const selected = languages.includes(code);
              const disabled = !selected && languages.length >= LANGUAGES_MAX;
              return (
                <Chip
                  key={code}
                  selected={selected}
                  disabled={disabled}
                  onClick={() => toggleLanguage(code)}
                >
                  {tLang(code)}
                </Chip>
              );
            })}
          </div>
          {languagesError ? (
            <p role="alert" className="text-xs font-medium text-danger">
              {stretch(languagesError)}
            </p>
          ) : null}
        </fieldset>

        {/* Curated interests (FR-PROF-3: 0 to 5 optional) */}
        <fieldset className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <legend className="text-sm font-medium text-ink break-words">
              {stretch(tOnb("profile.interestsLabel"))}
            </legend>
            <span className="text-xs text-ink-muted">
              {tOnb("profile.selectionCount", {
                count: interests.length,
                max: INTERESTS_MAX,
              })}
            </span>
          </div>
          <p className="text-xs text-ink-secondary break-words">
            {stretch(tOnb("profile.interestsHint", { max: INTERESTS_MAX }))}
          </p>
          <div className="flex flex-wrap gap-2">
            {ONBOARDING_INTEREST_IDS.map((id) => {
              const selected = interests.includes(id);
              const disabled = !selected && interests.length >= INTERESTS_MAX;
              return (
                <Chip
                  key={id}
                  selected={selected}
                  disabled={disabled}
                  onClick={() => toggleInterest(id)}
                >
                  {stretch(tInterests(id))}
                </Chip>
              );
            })}
          </div>
          {interestsError ? (
            <p role="alert" className="text-xs font-medium text-danger">
              {stretch(interestsError)}
            </p>
          ) : null}
        </fieldset>

        {/* Optional intent (FR-PROF-5) */}
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-ink break-words">
            {stretch(tOnb("profile.intentLabel"))}
          </legend>
          <div className="flex flex-wrap gap-2">
            <Chip selected={intent === null} onClick={() => setIntent(null)}>
              {stretch(tOnb("profile.intentNone"))}
            </Chip>
            <Chip
              selected={intent === "want_to_talk"}
              onClick={() => setIntent("want_to_talk")}
            >
              {stretch(tIntents("want_to_talk"))}
            </Chip>
            <Chip
              selected={intent === "happy_to_listen"}
              onClick={() => setIntent("happy_to_listen")}
            >
              {stretch(tIntents("happy_to_listen"))}
            </Chip>
          </div>
        </fieldset>

        {/* Optional country, hidden by default (FR-PROF-4) */}
        <Select
          label={stretch(tOnb("profile.countryLabel"))}
          hint={stretch(tOnb("profile.countryHint"))}
          options={countryOptions}
          value={country ?? ""}
          onChange={(e) => setCountry(e.target.value || null)}
          error={countryError ? stretch(countryError) : undefined}
        />

        <Button type="submit" variant="primary" fullWidth>
          {stretch(tOnb("profile.saveButton"))}
        </Button>
      </form>
    </Card>
  );
}
