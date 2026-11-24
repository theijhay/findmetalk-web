import {
  type ApiFieldValidationError,
  type ConsentRequirements,
  ONBOARDING_AVATAR_IDS,
  ONBOARDING_INTEREST_IDS,
  type OtpSendResponse,
  type ProfileMeData,
  type ProfileOptionsData,
  SUPPORTED_UI_LANGUAGES,
  type UserMeData,
} from "@/lib/onboarding";

/**
 * Fixtures for `/preview` only, shaped exactly like the schemas and error codes
 * in findmetalk-api #11 (Email OTP), #12 (Sessions / UserMe), #13 (Consent)
 * and #17 (Profile setup and editing).
 *
 * Never import this file into production sign-in pages or SignInFlow.
 */

export const OTP_SEND_FIXTURE: OtpSendResponse = {
  expires_in_seconds: 600,
  resend_after_seconds: 60,
};

export const CONSENT_REQUIREMENTS_FIXTURE: ConsentRequirements = {
  minimum_age: 18,
  rules_version: "1",
  recording_notice_version: "1",
};

export const NEW_USER_ME_FIXTURE: UserMeData = {
  id: "8b6e0c1a-4f2d-4e7b-9c3a-1d5f7e9b2c40",
  email: "ada@example.com",
  status: "active",
  role: "user",
  age_confirmed_at: null,
  rules_version_accepted: null,
  recording_notice_version_accepted: null,
  needs_acceptance: true,
  has_profile: false,
  created_at: "2026-10-19T21:04:05Z",
};

export const CONSENTED_USER_ME_FIXTURE: UserMeData = {
  ...NEW_USER_ME_FIXTURE,
  age_confirmed_at: "2026-10-19T21:04:55Z",
  rules_version_accepted: "1",
  recording_notice_version_accepted: "1",
  needs_acceptance: false,
};

export const PROFILE_OPTIONS_FIXTURE: ProfileOptionsData = {
  avatars: ONBOARDING_AVATAR_IDS.map((id) => ({
    id,
    url: `/static/avatars/${id}.svg`,
  })),
  interests: ONBOARDING_INTEREST_IDS.map((id) => ({ id })),
  languages: SUPPORTED_UI_LANGUAGES.map((code) => ({ code })),
  intents: ["want_to_talk", "happy_to_listen"],
  ui_languages: [...SUPPORTED_UI_LANGUAGES],
};

export const PROFILE_ME_FIXTURE: ProfileMeData = {
  user_id: NEW_USER_ME_FIXTURE.id,
  display_name: "Ada",
  avatar_id: "avatar_02",
  photo: null,
  languages: ["en", "yo"],
  interests: ["music", "books", "late_night"],
  intent: "want_to_talk",
  country: "NG",
  ui_language: "en",
  updated_at: "2026-10-19T21:06:10Z",
};

export const PROFILE_VALIDATION_ERRORS_FIXTURE: readonly ApiFieldValidationError[] =
  [
    { field: "display_name", code: "text.profanity" },
    { field: "languages", code: "profile.languages_count" },
    { field: "interests", code: "profile.interests_count" },
  ];
