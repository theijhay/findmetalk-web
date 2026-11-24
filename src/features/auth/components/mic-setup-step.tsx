"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import * as React from "react";

import { Banner, Button, Card, Chip } from "@/components/ui";
import { ROUTES } from "@/config/routes";
import { SITE } from "@/config/site";
import {
  BROWSER_FAMILIES,
  type BrowserFamily,
  detectBrowserFamily,
  isGetUserMediaSupported,
  MIC_TEST_DURATION_SECONDS,
  type MicPermissionState,
} from "@/lib/onboarding";

interface WindowWithWebkitAudio {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

export interface MicSetupStepProps {
  readonly mode: "mic" | "mic_test" | "ready";
  readonly initialPermissionState?: MicPermissionState;
  readonly initialBrowserFamily?: BrowserFamily;
  readonly embedded?: boolean;
  readonly onPermissionGranted: () => void;
  readonly onSkipToReady: () => void;
  readonly onFinishToCloud?: () => void;
  readonly stretch?: (text: string) => string;
}

/**
 * Microphone permission explainer + per-browser denied recovery path,
 * optional 20-second microphone & speaker test, and final ready screen
 * landing in the cloud with Open to talk OFF by default (Spec 7.1, 9.7).
 */
export function MicSetupStep({
  mode,
  initialPermissionState = "prompt",
  initialBrowserFamily,
  embedded = false,
  onPermissionGranted,
  onSkipToReady,
  onFinishToCloud,
  stretch = (v) => v,
}: MicSetupStepProps) {
  const tOnb = useTranslations("onboarding");

  const [permissionState, setPermissionState] =
    React.useState<MicPermissionState>(initialPermissionState);
  const [browserFamily, setBrowserFamily] = React.useState<BrowserFamily>(
    () => {
      if (initialBrowserFamily) return initialBrowserFamily;
      if (typeof navigator !== "undefined") {
        return detectBrowserFamily(navigator.userAgent);
      }
      return "desktop";
    },
  );
  const [testRunning, setTestRunning] = React.useState(false);
  const [testSecondsLeft, setTestSecondsLeft] = React.useState(
    MIC_TEST_DURATION_SECONDS,
  );
  const [micLevel, setMicLevel] = React.useState(embedded ? 48 : 0);
  const [speakerChecked, setSpeakerChecked] = React.useState(false);

  const requestMicrophone = async () => {
    if (embedded) {
      setPermissionState("granted");
      onPermissionGranted();
      return;
    }
    if (
      typeof navigator === "undefined" ||
      !isGetUserMediaSupported(navigator)
    ) {
      setPermissionState("unsupported");
      return;
    }
    setPermissionState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setPermissionState("granted");
      onPermissionGranted();
    } catch {
      setPermissionState("denied");
    }
  };

  React.useEffect(() => {
    if (!testRunning) return;
    const timer = window.setInterval(() => {
      setTestSecondsLeft((prev) => {
        if (prev <= 1) {
          setTestRunning(false);
          return 0;
        }
        return prev - 1;
      });
      if (embedded) {
        setMicLevel((prev) => (prev > 60 ? 35 : 68));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [testRunning, embedded]);

  const handleToggleMicTest = async () => {
    if (testRunning) {
      setTestRunning(false);
      return;
    }
    setTestSecondsLeft(MIC_TEST_DURATION_SECONDS);
    setTestRunning(true);
    if (!embedded && typeof navigator !== "undefined" && isGetUserMediaSupported(navigator)) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicLevel(58);
        window.setTimeout(() => {
          stream.getTracks().forEach((track) => track.stop());
        }, MIC_TEST_DURATION_SECONDS * 1000);
      } catch {
        setMicLevel(0);
        setTestRunning(false);
      }
    }
  };

  const handleSpeakerTest = () => {
    setSpeakerChecked(true);
    if (embedded || typeof window === "undefined") return;
    const win = window as unknown as WindowWithWebkitAudio;
    const AudioCtx = win.AudioContext ?? win.webkitAudioContext;
    if (!AudioCtx) return;
    try {
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.04, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
      window.setTimeout(() => {
        void ctx.close().catch(() => {});
      }, 600);
    } catch {
      // Ignore autoplay blocks silently
    }
  };

  if (mode === "mic") {
    return (
      <Card elevated className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-ink break-words">
            {stretch(tOnb("mic.title"))}
          </h1>
          <p className="text-sm text-ink-secondary break-words">
            {stretch(tOnb("mic.subtitle", { appName: SITE.name }))}
          </p>
        </div>

        <div className="rounded-[var(--radius-control)] border border-line bg-surface-sunken p-4">
          <p className="text-xs leading-relaxed text-ink-secondary break-words">
            {stretch(tOnb("mic.privacyNote"))}
          </p>
        </div>

        {permissionState === "denied" || permissionState === "unsupported" ? (
          <div className="flex flex-col gap-4">
            <Banner
              tone="caution"
              title={stretch(tOnb("mic.deniedTitle"))}
              description={stretch(tOnb("mic.deniedBody"))}
            />

            <div className="flex flex-col gap-3 rounded-[var(--radius-control)] border border-line bg-surface-raised p-4">
              <span className="text-xs font-semibold text-ink-secondary">
                {stretch(tOnb("mic.browserPickerLabel"))}
              </span>
              <div className="flex flex-wrap gap-2">
                {BROWSER_FAMILIES.map((family) => (
                  <Chip
                    key={family}
                    selected={browserFamily === family}
                    onClick={() => setBrowserFamily(family)}
                  >
                    {stretch(tOnb(`mic.browsers.${family}.label`))}
                  </Chip>
                ))}
              </div>
              <ol className="list-decimal space-y-1.5 pl-5 text-xs leading-relaxed text-ink-secondary">
                <li>{stretch(tOnb(`mic.browsers.${browserFamily}.step1`))}</li>
                <li>{stretch(tOnb(`mic.browsers.${browserFamily}.step2`))}</li>
                <li>{stretch(tOnb(`mic.browsers.${browserFamily}.step3`))}</li>
              </ol>
            </div>

            <div className="flex flex-col gap-2.5">
              <Button
                variant="primary"
                fullWidth
                onClick={() => void requestMicrophone()}
              >
                {stretch(tOnb("mic.retryButton"))}
              </Button>
              <Button variant="quiet" fullWidth onClick={onSkipToReady}>
                {stretch(tOnb("mic.continueWithoutMic"))}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <Button
              variant="primary"
              fullWidth
              disabled={permissionState === "requesting"}
              onClick={() => void requestMicrophone()}
            >
              {stretch(
                permissionState === "requesting"
                  ? tOnb("mic.requestingButton")
                  : tOnb("mic.allowButton"),
              )}
            </Button>
            <Button variant="quiet" fullWidth onClick={onSkipToReady}>
              {stretch(tOnb("mic.skipForNowButton"))}
            </Button>
          </div>
        )}
      </Card>
    );
  }

  if (mode === "mic_test") {
    return (
      <Card elevated className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-ink break-words">
            {stretch(tOnb("micTest.title"))}
          </h1>
          <p className="text-sm text-ink-secondary break-words">
            {stretch(
              tOnb("micTest.subtitle", { seconds: MIC_TEST_DURATION_SECONDS }),
            )}
          </p>
        </div>

        {/* Microphone level check */}
        <div className="flex flex-col gap-3 rounded-[var(--radius-control)] border border-line bg-surface-sunken p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-ink break-words">
              {stretch(tOnb("micTest.micHeading"))}
            </span>
            <span className="text-xs font-medium text-ink-secondary tabular-nums">
              {tOnb("micTest.secondsLeft", { seconds: testSecondsLeft })}
            </span>
          </div>

          <div
            role="meter"
            aria-label={tOnb("micTest.meterAriaLabel")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={micLevel}
            className="h-3 w-full overflow-hidden rounded-[var(--radius-pill)] bg-surface"
          >
            <div
              style={{ width: `${micLevel}%` }}
              className="h-full rounded-[var(--radius-pill)] bg-good transition-[width] duration-[var(--duration-fast)]"
            />
          </div>

          <Button
            variant="secondary"
            onClick={() => void handleToggleMicTest()}
          >
            {stretch(
              testRunning
                ? tOnb("micTest.stopTestButton")
                : tOnb("micTest.startTestButton"),
            )}
          </Button>
        </div>

        {/* Speaker check */}
        <div className="flex flex-col gap-3 rounded-[var(--radius-control)] border border-line bg-surface-sunken p-4">
          <span className="text-sm font-semibold text-ink break-words">
            {stretch(tOnb("micTest.speakerHeading"))}
          </span>
          <p className="text-xs text-ink-secondary break-words">
            {stretch(
              speakerChecked
                ? tOnb("micTest.speakerPlayedNote")
                : tOnb("micTest.speakerHint"),
            )}
          </p>
          <div>
            <Button variant="secondary" onClick={handleSpeakerTest}>
              {stretch(tOnb("micTest.playChimeButton"))}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 border-t border-line pt-4">
          <Button variant="primary" fullWidth onClick={onSkipToReady}>
            {stretch(tOnb("micTest.continueButton"))}
          </Button>
          <Button variant="quiet" fullWidth onClick={onSkipToReady}>
            {stretch(tOnb("micTest.skipButton"))}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card elevated className="flex flex-col items-center gap-5 py-7 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-good/40 bg-good/10 text-good">
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 10.5l3.5 3.5 7.5-8"
          />
        </svg>
      </div>

      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-ink break-words">
          {stretch(tOnb("ready.title"))}
        </h1>
        <p className="max-w-md text-sm text-ink-secondary break-words">
          {stretch(tOnb("ready.subtitle"))}
        </p>
      </div>

      <div className="w-full rounded-[var(--radius-control)] border border-line bg-surface-sunken p-4 text-left">
        <p className="text-xs font-semibold text-ink break-words">
          {stretch(tOnb("ready.openOffHeading"))}
        </p>
        <p className="mt-1 text-xs text-ink-secondary break-words">
          {stretch(tOnb("ready.openOffBody"))}
        </p>
      </div>

      {onFinishToCloud ? (
        <Button variant="primary" fullWidth onClick={onFinishToCloud}>
          {stretch(tOnb("ready.enterCloudButton"))}
        </Button>
      ) : (
        <Link
          href={ROUTES.cloud}
          className="inline-flex min-h-target w-full items-center justify-center rounded-[var(--radius-control)] bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition-colors duration-[var(--duration-fast)] hover:bg-accent-hover"
        >
          {stretch(tOnb("ready.enterCloudButton"))}
        </Link>
      )}
    </Card>
  );
}
