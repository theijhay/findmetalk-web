"use client";

import * as React from "react";

import { ConsentStep } from "@/features/auth/components/consent-step";
import { EmailCodeStep } from "@/features/auth/components/email-code-step";
import { MicSetupStep } from "@/features/auth/components/mic-setup-step";
import { OnboardingChrome } from "@/features/auth/components/onboarding-chrome";
import { ProfileSetupStep } from "@/features/auth/components/profile-setup-step";
import {
  type ApiFieldValidationError,
  type BrowserFamily,
  type ConsentRequirements,
  DEFAULT_OTP_RESEND_SECONDS,
  type MicPermissionState,
  type OnboardingStep,
  type PhotoModerationState,
  type ProfileDraft,
} from "@/lib/onboarding";

const DEFAULT_CONSENT_REQUIREMENTS: ConsentRequirements = {
  minimum_age: 18,
  rules_version: "1",
  recording_notice_version: "1",
};

export interface SignInFlowProps {
  readonly initialStep?: OnboardingStep;
  readonly initialEmail?: string;
  readonly initialCode?: string;
  readonly initialResendSeconds?: number;
  readonly consentRequirements?: ConsentRequirements;
  readonly initialProfileDraft?: Partial<ProfileDraft>;
  readonly initialPhotoState?: PhotoModerationState;
  readonly initialMicPermission?: MicPermissionState;
  readonly initialBrowserFamily?: BrowserFamily;
  readonly apiErrorCode?: string | null;
  readonly profileFieldErrors?: readonly ApiFieldValidationError[];
  readonly longCopy?: boolean;
  readonly embedded?: boolean;
  readonly onFinishToCloud?: () => void;
}

/**
 * Presentational orchestrator for sign-in and onboarding (Spec 7.1, FR-AUTH-1,
 * FR-AUTH-2, FR-PROF-1 to FR-PROF-5, REC-2).
 *
 * Accepts initial state and error codes via props so `/preview` can render
 * every step and error state without fixture imports in production code.
 */
export function SignInFlow({
  initialStep = "email",
  initialEmail = "",
  initialCode = "",
  initialResendSeconds = DEFAULT_OTP_RESEND_SECONDS,
  consentRequirements = DEFAULT_CONSENT_REQUIREMENTS,
  initialProfileDraft,
  initialPhotoState = "none",
  initialMicPermission = "prompt",
  initialBrowserFamily,
  apiErrorCode = null,
  profileFieldErrors = [],
  longCopy = false,
  embedded = false,
  onFinishToCloud,
}: SignInFlowProps) {
  const [step, setStep] = React.useState<OnboardingStep>(initialStep);
  const [email, setEmail] = React.useState(initialEmail);
  const [code, setCode] = React.useState(initialCode);
  const [resendSeconds, setResendSeconds] = React.useState(
    initialResendSeconds,
  );
  const [activeErrorCode, setActiveErrorCode] = React.useState<string | null>(
    apiErrorCode,
  );

  const stretch = React.useCallback(
    (text: string) => {
      if (!longCopy) return text;
      const pad = text.slice(0, Math.max(6, Math.ceil(text.length * 0.4)));
      return `${text} (${pad})`;
    },
    [longCopy],
  );

  React.useEffect(() => {
    if (embedded || step !== "code" || resendSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setResendSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [embedded, step, resendSeconds]);

  return (
    <OnboardingChrome step={step} embedded={embedded} stretch={stretch}>
      {step === "email" || step === "code" ? (
        <EmailCodeStep
          mode={step}
          email={email}
          onEmailChange={setEmail}
          code={code}
          onCodeChange={setCode}
          resendSeconds={resendSeconds}
          apiErrorCode={activeErrorCode}
          onSendCode={(normalized) => {
            setEmail(normalized);
            setActiveErrorCode(null);
            setResendSeconds(DEFAULT_OTP_RESEND_SECONDS);
            setStep("code");
          }}
          onVerifyCode={() => {
            setActiveErrorCode(null);
            setStep("consent");
          }}
          onResendCode={() => {
            setActiveErrorCode(null);
            setResendSeconds(DEFAULT_OTP_RESEND_SECONDS);
          }}
          onChangeEmail={() => {
            setActiveErrorCode(null);
            setCode("");
            setStep("email");
          }}
          stretch={stretch}
        />
      ) : null}

      {step === "consent" ? (
        <ConsentStep
          requirements={consentRequirements}
          apiErrorCode={activeErrorCode}
          onContinue={() => {
            setActiveErrorCode(null);
            setStep("profile");
          }}
          stretch={stretch}
        />
      ) : null}

      {step === "profile" ? (
        <ProfileSetupStep
          initialDraft={initialProfileDraft}
          initialPhotoState={initialPhotoState}
          apiFieldErrors={profileFieldErrors}
          onSave={() => setStep("mic")}
          stretch={stretch}
        />
      ) : null}

      {step === "mic" || step === "mic_test" || step === "ready" ? (
        <MicSetupStep
          mode={step}
          initialPermissionState={initialMicPermission}
          initialBrowserFamily={initialBrowserFamily}
          embedded={embedded}
          onPermissionGranted={() => setStep("mic_test")}
          onSkipToReady={() => setStep("ready")}
          onFinishToCloud={onFinishToCloud}
          stretch={stretch}
        />
      ) : null}
    </OnboardingChrome>
  );
}
