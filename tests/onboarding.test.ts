import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  canSubmitConsent,
  detectBrowserFamily,
  formatResendTimer,
  getOnboardingStepProgress,
  isGetUserMediaSupported,
  MIC_TEST_DURATION_SECONDS,
  resolveNextOnboardingStep,
  validateEmailInput,
  validateOtpCode,
  validateProfileDraft,
} from "../src/lib/onboarding.ts";

const ROOT = path.resolve(import.meta.dirname, "..");

function lookupMessage(obj: Record<string, unknown>, dottedKey: string): unknown {
  return dottedKey
    .split(".")
    .reduce<unknown>(
      (acc, segment) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[segment]
          : undefined,
      obj,
    );
}

test("FR-AUTH-1: email and 6-digit OTP validation accept valid inputs and reject invalid ones", () => {
  assert.deepEqual(validateEmailInput("  Ada@Example.COM "), {
    valid: true,
    normalized: "ada@example.com",
  });
  assert.equal(validateEmailInput("not-an-email").valid, false);
  assert.equal(validateEmailInput("").valid, false);

  assert.equal(validateOtpCode("482913"), true);
  assert.equal(validateOtpCode("48291"), false);
  assert.equal(validateOtpCode("48291a"), false);
  assert.equal(validateOtpCode("4829137"), false);
});

test("FR-AUTH-2, SAFE-1, SAFE-8, REC-2: consent requires all three explicit confirmations and never skips consent", () => {
  assert.equal(
    canSubmitConsent({
      ageConfirmed: true,
      rulesAccepted: true,
      recordingAccepted: true,
    }),
    true,
  );
  assert.equal(
    canSubmitConsent({
      ageConfirmed: false,
      rulesAccepted: true,
      recordingAccepted: true,
    }),
    false,
  );
  assert.equal(
    canSubmitConsent({
      ageConfirmed: true,
      rulesAccepted: false,
      recordingAccepted: true,
    }),
    false,
  );
  assert.equal(
    canSubmitConsent({
      ageConfirmed: true,
      rulesAccepted: true,
      recordingAccepted: false,
    }),
    false,
  );

  assert.equal(
    resolveNextOnboardingStep({ needs_acceptance: true, has_profile: false }),
    "consent",
  );
  assert.equal(
    resolveNextOnboardingStep({ needs_acceptance: true, has_profile: true }),
    "consent",
  );
  assert.equal(
    resolveNextOnboardingStep({ needs_acceptance: false, has_profile: false }),
    "profile",
  );
  assert.equal(
    resolveNextOnboardingStep({ needs_acceptance: false, has_profile: true }),
    "mic",
  );
});

test("FR-PROF-1 to FR-PROF-5: validateProfileDraft enforces exact API #17 limits and field error codes", () => {
  assert.deepEqual(
    validateProfileDraft({
      display_name: "Ada",
      avatar_id: "avatar_02",
      languages: ["en", "yo"],
      interests: ["music", "books"],
      intent: "want_to_talk",
      country: "NG",
      ui_language: "en",
    }),
    [],
  );

  const errors = validateProfileDraft({
    display_name: "A",
    avatar_id: "avatar_99",
    languages: [],
    interests: ["music", "books", "football", "study", "late_night", "movies"],
    intent: null,
    country: "NGA",
    ui_language: "en",
  });

  const codes = errors.map((item) => item.code);
  assert.ok(codes.includes("profile.display_name_length"));
  assert.ok(codes.includes("profile.unknown_avatar"));
  assert.ok(codes.includes("profile.languages_count"));
  assert.ok(codes.includes("profile.interests_count"));
  assert.ok(codes.includes("profile.unknown_country"));
});

test("API #11, #12, #13, #17: every validation and auth error code has a translated message in messages/en.json", () => {
  const en = JSON.parse(
    readFileSync(path.join(ROOT, "messages/en.json"), "utf8"),
  ) as Record<string, unknown>;

  const requiredErrorCodes = [
    "validation_failed",
    "too_many_requests",
    "unauthorized",
    "auth.code_invalid",
    "auth.session_expired",
    "consent.required",
    "consent.version_outdated",
    "profile.not_created",
    "profile.display_name_length",
    "profile.unknown_avatar",
    "profile.languages_count",
    "profile.unknown_language",
    "profile.interests_count",
    "profile.unknown_interest",
    "profile.unknown_country",
    "text.profanity",
    "text.impersonation",
  ];

  for (const code of requiredErrorCodes) {
    const value = lookupMessage(en, `errors.${code}`);
    assert.equal(
      typeof value,
      "string",
      `Expected translated string for errors.${code}`,
    );
    assert.ok((value as string).length > 0);
  }
});

test("SAFE-1, SAFE-8, REC-2: consent, rules and recording notice keys are listed in messages/needs-review.json", () => {
  const needsReview = JSON.parse(
    readFileSync(path.join(ROOT, "messages/needs-review.json"), "utf8"),
  ) as Record<string, string>;

  assert.equal(needsReview["onboarding.consent.ageLabel"], "SAFE-1");
  assert.equal(needsReview["onboarding.consent.rulesSummary"], "SAFE-8");
  assert.equal(needsReview["onboarding.consent.recordingSummary"], "REC-2");
  assert.equal(needsReview["onboarding.consent.recordingCheckbox"], "REC-2");
});

test("Spec 7.1, 9.7: browser detection, resend timer, step progress and getUserMedia feature check", () => {
  assert.equal(MIC_TEST_DURATION_SECONDS, 20);
  assert.equal(
    detectBrowserFamily(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1",
    ),
    "safari_ios",
  );
  assert.equal(
    detectBrowserFamily(
      "Mozilla/5.0 (Linux; Android 11; Pixel 4) AppleWebKit/537.36 Chrome/111.0.0.0 Mobile Safari/537.36",
    ),
    "chrome_android",
  );
  assert.equal(
    detectBrowserFamily(
      "Mozilla/5.0 (Android 12; Mobile; rv:109.0) Gecko/109.0 Firefox/109.0",
    ),
    "firefox",
  );
  assert.equal(
    detectBrowserFamily("Mozilla/5.0 (X11; Linux x86_64) Chrome/120.0.0.0"),
    "desktop",
  );

  assert.equal(formatResendTimer(60), "1:00");
  assert.equal(formatResendTimer(7), "0:07");
  assert.equal(formatResendTimer(0), "0:00");

  assert.deepEqual(getOnboardingStepProgress("email"), { current: 1, total: 7 });
  assert.deepEqual(getOnboardingStepProgress("ready"), { current: 7, total: 7 });

  assert.equal(isGetUserMediaSupported(null), false);
  assert.equal(isGetUserMediaSupported({}), false);
  assert.equal(
    isGetUserMediaSupported({ mediaDevices: { getUserMedia: async () => ({}) } }),
    true,
  );
});

test("No-fake-people and security rules: SignInFlow and /sign-in page never import fixtures or use browser storage", () => {
  const flowSource = readFileSync(
    path.join(ROOT, "src/features/auth/components/sign-in-flow.tsx"),
    "utf8",
  );
  const pageSource = readFileSync(
    path.join(ROOT, "src/app/sign-in/page.tsx"),
    "utf8",
  );

  assert.doesNotMatch(flowSource, /from\s+["'][^"']*fixtures["']/);
  assert.doesNotMatch(pageSource, /from\s+["'][^"']*fixtures["']/);
  assert.doesNotMatch(flowSource, /localStorage|sessionStorage/);
});
