/**
 * Pure sign-in and onboarding logic: email and 6-digit OTP validation,
 * consent gating (18+, rules, recording notice), profile field validation
 * matching API #17 field error codes, next-step routing, browser detection for
 * microphone recovery, and resend timer formatting (Spec 7.1, 9.7, FR-AUTH-1,
 * FR-AUTH-2, FR-PROF-1, FR-PROF-2, FR-PROF-3, FR-PROF-4, REC-2).
 *
 * Kept free of imports so the Node test runner can load it directly.
 */

export const OTP_CODE_LENGTH = 6;
export const DEFAULT_OTP_RESEND_SECONDS = 60;
export const DEFAULT_OTP_EXPIRES_SECONDS = 600;
export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 24;
export const LANGUAGES_MIN = 1;
export const LANGUAGES_MAX = 3;
export const INTERESTS_MAX = 5;
export const MIC_TEST_DURATION_SECONDS = 20;

export const SUPPORTED_UI_LANGUAGES = [
  "en",
  "pcm",
  "yo",
  "ha",
  "ig",
  "fr",
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_UI_LANGUAGES)[number];

export const ONBOARDING_AVATAR_IDS = [
  "avatar_01",
  "avatar_02",
  "avatar_03",
  "avatar_04",
  "avatar_05",
  "avatar_06",
  "avatar_07",
  "avatar_08",
] as const;

export type OnboardingAvatarId = (typeof ONBOARDING_AVATAR_IDS)[number];

export const ONBOARDING_INTEREST_IDS = [
  "music",
  "books",
  "football",
  "study",
  "late_night",
  "movies",
  "tech",
  "cooking",
  "travel",
  "art",
  "languages",
  "campus_life",
] as const;

export type OnboardingInterestId = (typeof ONBOARDING_INTEREST_IDS)[number];

export const ONBOARDING_COUNTRY_CODES = ["NG", "GH", "FR", "GB", "US"] as const;

export type OnboardingIntent = "want_to_talk" | "happy_to_listen";

export type OnboardingStep =
  | "email"
  | "code"
  | "consent"
  | "profile"
  | "mic"
  | "mic_test"
  | "ready";

export const ONBOARDING_STEP_ORDER: readonly OnboardingStep[] = [
  "email",
  "code",
  "consent",
  "profile",
  "mic",
  "mic_test",
  "ready",
];

export interface OtpSendResponse {
  readonly expires_in_seconds: number;
  readonly resend_after_seconds: number;
}

export interface UserMeData {
  readonly id: string;
  readonly email: string;
  readonly status: "active" | "suspended" | "banned";
  readonly role: "user" | "moderator" | "owner";
  readonly age_confirmed_at: string | null;
  readonly rules_version_accepted: string | null;
  readonly recording_notice_version_accepted: string | null;
  readonly needs_acceptance: boolean;
  readonly has_profile: boolean;
  readonly created_at: string;
}

export interface ConsentRequirements {
  readonly minimum_age: number;
  readonly rules_version: string;
  readonly recording_notice_version: string;
}

export interface ProfileOptionsData {
  readonly avatars: readonly {
    readonly id: OnboardingAvatarId;
    readonly url: string;
  }[];
  readonly interests: readonly { readonly id: OnboardingInterestId }[];
  readonly languages: readonly { readonly code: SupportedLanguageCode }[];
  readonly intents: readonly OnboardingIntent[];
  readonly ui_languages: readonly SupportedLanguageCode[];
}

export type PhotoModerationState = "none" | "pending" | "approved" | "rejected";

export interface ProfileDraft {
  readonly display_name: string;
  readonly avatar_id: string;
  readonly languages: readonly string[];
  readonly interests: readonly string[];
  readonly intent: OnboardingIntent | null;
  readonly country: string | null;
  readonly ui_language: SupportedLanguageCode;
}

export interface ProfileMeData extends ProfileDraft {
  readonly user_id: string;
  readonly avatar_id: OnboardingAvatarId;
  readonly photo: string | null;
  readonly updated_at: string;
}

export interface ApiFieldValidationError {
  readonly field: string;
  readonly code: string;
}

export type MicPermissionState =
  | "prompt"
  | "requesting"
  | "granted"
  | "denied"
  | "unsupported";

export type BrowserFamily =
  | "safari_ios"
  | "chrome_android"
  | "firefox"
  | "desktop";

export const BROWSER_FAMILIES: readonly BrowserFamily[] = [
  "safari_ios",
  "chrome_android",
  "firefox",
  "desktop",
];

/**
 * Validates a user-entered email before requesting a one-time code (FR-AUTH-1).
 */
export function validateEmailInput(raw: string): {
  readonly valid: boolean;
  readonly normalized: string;
} {
  const normalized = raw.trim().toLowerCase();
  const valid =
    normalized.length >= 3 &&
    normalized.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  return { valid, normalized };
}

/**
 * Validates a 6-digit numeric email OTP code (API #11).
 */
export function validateOtpCode(raw: string): boolean {
  return /^\d{6}$/.test(raw.trim());
}

/**
 * FR-AUTH-2, SAFE-1, SAFE-8, REC-2: All three confirmations must be explicitly
 * checked before submitting consent.
 */
export function canSubmitConsent(state: {
  readonly ageConfirmed: boolean;
  readonly rulesAccepted: boolean;
  readonly recordingAccepted: boolean;
}): boolean {
  return (
    state.ageConfirmed && state.rulesAccepted && state.recordingAccepted
  );
}

/**
 * Validates a profile draft against the exact limits and field error codes in
 * findmetalk-api #17 (FR-PROF-1 to FR-PROF-5).
 */
export function validateProfileDraft(
  draft: ProfileDraft,
): ApiFieldValidationError[] {
  const errors: ApiFieldValidationError[] = [];
  const trimmedName = draft.display_name.trim();

  if (
    trimmedName.length < DISPLAY_NAME_MIN ||
    trimmedName.length > DISPLAY_NAME_MAX
  ) {
    errors.push({
      field: "display_name",
      code: "profile.display_name_length",
    });
  }

  if (
    !(ONBOARDING_AVATAR_IDS as readonly string[]).includes(draft.avatar_id)
  ) {
    errors.push({
      field: "avatar_id",
      code: "profile.unknown_avatar",
    });
  }

  if (
    draft.languages.length < LANGUAGES_MIN ||
    draft.languages.length > LANGUAGES_MAX
  ) {
    errors.push({
      field: "languages",
      code: "profile.languages_count",
    });
  } else if (
    draft.languages.some(
      (code) => !(SUPPORTED_UI_LANGUAGES as readonly string[]).includes(code),
    )
  ) {
    errors.push({
      field: "languages",
      code: "profile.unknown_language",
    });
  }

  if (draft.interests.length > INTERESTS_MAX) {
    errors.push({
      field: "interests",
      code: "profile.interests_count",
    });
  } else if (
    draft.interests.some(
      (id) => !(ONBOARDING_INTEREST_IDS as readonly string[]).includes(id),
    )
  ) {
    errors.push({
      field: "interests",
      code: "profile.unknown_interest",
    });
  }

  if (draft.country !== null && !/^[A-Z]{2}$/.test(draft.country)) {
    errors.push({
      field: "country",
      code: "profile.unknown_country",
    });
  }

  return errors;
}

/**
 * Determines which onboarding step a verified user must see next (Spec 7.1,
 * API #12, API #13). Never skips consent when `needs_acceptance` is true.
 */
export function resolveNextOnboardingStep(
  user: Pick<UserMeData, "needs_acceptance" | "has_profile">,
): "consent" | "profile" | "mic" {
  if (user.needs_acceptance) return "consent";
  if (!user.has_profile) return "profile";
  return "mic";
}

/**
 * Returns 1-based step index and total for calm progress indication.
 */
export function getOnboardingStepProgress(step: OnboardingStep): {
  readonly current: number;
  readonly total: number;
} {
  const index = ONBOARDING_STEP_ORDER.indexOf(step);
  return {
    current: index === -1 ? 1 : index + 1,
    total: ONBOARDING_STEP_ORDER.length,
  };
}

/**
 * Classifies browser family from a user-agent string to default the per-browser
 * microphone recovery instructions (Spec 9.7).
 */
export function detectBrowserFamily(userAgent: string): BrowserFamily {
  const ua = userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) {
    return "safari_ios";
  }
  if (/firefox/.test(ua)) {
    return "firefox";
  }
  if (/android/.test(ua)) {
    return "chrome_android";
  }
  return "desktop";
}

/**
 * Formats remaining OTP resend seconds as M:SS.
 */
export function formatResendTimer(remainingSeconds: number): string {
  const safe = Math.max(0, Math.floor(remainingSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Feature-detects MediaDevices.getUserMedia safely for older mobile browsers.
 */
export function isGetUserMediaSupported(
  nav:
    | { readonly mediaDevices?: { readonly getUserMedia?: unknown } }
    | null
    | undefined,
): boolean {
  return Boolean(
    nav &&
      nav.mediaDevices &&
      typeof nav.mediaDevices.getUserMedia === "function",
  );
}
