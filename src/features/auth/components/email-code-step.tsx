"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { Banner, Button, Card, CodeInput, TextField } from "@/components/ui";
import { SITE } from "@/config/site";
import {
  DEFAULT_OTP_RESEND_SECONDS,
  formatResendTimer,
  OTP_CODE_LENGTH,
  validateEmailInput,
  validateOtpCode,
} from "@/lib/onboarding";

export interface EmailCodeStepProps {
  readonly mode: "email" | "code";
  readonly email: string;
  readonly onEmailChange: (email: string) => void;
  readonly code: string;
  readonly onCodeChange: (code: string) => void;
  readonly resendSeconds: number;
  readonly apiErrorCode?: string | null;
  readonly onSendCode: (normalizedEmail: string) => void;
  readonly onVerifyCode: (email: string, code: string) => void;
  readonly onResendCode: () => void;
  readonly onChangeEmail: () => void;
  readonly stretch?: (text: string) => string;
}

/**
 * Email entry and 6-digit one-time code verification (Spec 7.1, FR-AUTH-1,
 * API #11). Identical calm messaging whether or not the email has an account.
 */
export function EmailCodeStep({
  mode,
  email,
  onEmailChange,
  code,
  onCodeChange,
  resendSeconds = DEFAULT_OTP_RESEND_SECONDS,
  apiErrorCode = null,
  onSendCode,
  onVerifyCode,
  onResendCode,
  onChangeEmail,
  stretch = (v) => v,
}: EmailCodeStepProps) {
  const tOnb = useTranslations("onboarding");
  const tErrors = useTranslations("errors");
  const [localError, setLocalError] = React.useState<string | null>(null);

  const translatedApiError = React.useMemo(() => {
    if (!apiErrorCode) return null;
    if (tErrors.has(apiErrorCode)) {
      return tErrors(apiErrorCode, { appName: SITE.name });
    }
    return tErrors("unknown");
  }, [apiErrorCode, tErrors]);

  const handleEmailSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const check = validateEmailInput(email);
    if (!check.valid) {
      setLocalError(tOnb("email.invalidError"));
      return;
    }
    setLocalError(null);
    onSendCode(check.normalized);
  };

  const handleCodeSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateOtpCode(code)) {
      setLocalError(tOnb("code.incompleteError", { length: OTP_CODE_LENGTH }));
      return;
    }
    setLocalError(null);
    onVerifyCode(email, code.trim());
  };

  if (mode === "email") {
    return (
      <Card elevated className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-ink break-words">
            {stretch(tOnb("email.title"))}
          </h1>
          <p className="text-sm text-ink-secondary break-words">
            {stretch(tOnb("email.subtitle", { appName: SITE.name }))}
          </p>
        </div>

        {translatedApiError ? (
          <Banner
            tone="danger"
            title={stretch(tOnb("errorBannerTitle"))}
            description={stretch(translatedApiError)}
          />
        ) : null}

        <form onSubmit={handleEmailSubmit} noValidate className="flex flex-col gap-4">
          <TextField
            type="email"
            inputMode="email"
            autoComplete="email"
            label={stretch(tOnb("email.inputLabel"))}
            placeholder={tOnb("email.inputPlaceholder")}
            hint={stretch(tOnb("email.inputHint"))}
            value={email}
            onChange={(e) => {
              onEmailChange(e.target.value);
              if (localError) setLocalError(null);
            }}
            error={localError ? stretch(localError) : undefined}
          />

          <Button type="submit" variant="primary" fullWidth>
            {stretch(tOnb("email.submitButton"))}
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <Card elevated className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-ink break-words">
          {stretch(tOnb("code.title"))}
        </h1>
        <p className="text-sm text-ink-secondary break-words">
          {stretch(
            tOnb("code.subtitle", {
              email: email || tOnb("code.fallbackEmail"),
            }),
          )}
        </p>
      </div>

      {translatedApiError ? (
        <Banner
          tone="danger"
          title={stretch(tOnb("errorBannerTitle"))}
          description={stretch(translatedApiError)}
        />
      ) : null}

      <form onSubmit={handleCodeSubmit} noValidate className="flex flex-col gap-5">
        <CodeInput
          label={stretch(tOnb("code.inputLabel"))}
          hint={stretch(tOnb("code.inputHint"))}
          value={code}
          onChange={(next) => {
            onCodeChange(next);
            if (localError) setLocalError(null);
          }}
          error={localError ? stretch(localError) : undefined}
          digitLabelTemplate={(index, total) =>
            tOnb("code.digitAriaLabel", { index, total })
          }
        />

        <Button type="submit" variant="primary" fullWidth>
          {stretch(tOnb("code.submitButton"))}
        </Button>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4">
          <Button
            type="button"
            variant="secondary"
            disabled={resendSeconds > 0}
            onClick={onResendCode}
          >
            {stretch(
              resendSeconds > 0
                ? tOnb("code.resendCountdown", {
                    time: formatResendTimer(resendSeconds),
                  })
                : tOnb("code.resendButton"),
            )}
          </Button>

          <Button type="button" variant="quiet" onClick={onChangeEmail}>
            {stretch(tOnb("code.changeEmailButton"))}
          </Button>
        </div>
      </form>
    </Card>
  );
}
