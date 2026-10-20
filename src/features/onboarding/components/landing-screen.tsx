"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { HelpControl } from "@/components/layout/help-control";
import { Button, Card, Dialog } from "@/components/ui";
import { SITE } from "@/config/site";
import {
  LANDING_LEGAL_DOC_IDS,
  type LandingLegalDocId,
} from "@/features/onboarding/landing-meta";
import { cn } from "@/lib/utils";

export interface LandingScreenProps {
  readonly onEnter?: () => void;
  readonly activeDoc?: LandingLegalDocId | null;
  readonly onActiveDocChange?: (doc: LandingLegalDocId | null) => void;
  readonly longCopy?: boolean;
  readonly embedded?: boolean;
  readonly className?: string;
}

export function LandingScreen({
  onEnter,
  activeDoc: controlledDoc,
  onActiveDocChange,
  longCopy = false,
  embedded = false,
  className,
}: LandingScreenProps) {
  const tHome = useTranslations("home");
  const tShell = useTranslations("shell");
  const tCommon = useTranslations("common");

  const [uncontrolledDoc, setUncontrolledDoc] =
    React.useState<LandingLegalDocId | null>(null);

  const activeDoc =
    controlledDoc !== undefined ? controlledDoc : uncontrolledDoc;
  const setActiveDoc = React.useCallback(
    (doc: LandingLegalDocId | null) => {
      if (onActiveDocChange) {
        onActiveDocChange(doc);
      } else {
        setUncontrolledDoc(doc);
      }
    },
    [onActiveDocChange],
  );

  const expand = React.useCallback(
    (value: string) =>
      longCopy
        ? `${value} (${value.slice(0, Math.ceil(value.length * 0.4))})`
        : value,
    [longCopy],
  );

  const mainId = embedded ? "landing-preview-main" : "main-content";

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden bg-gradient-to-b from-sky-top to-sky-bottom text-ink",
        embedded
          ? "min-h-[38rem] rounded-[var(--radius-card)] border border-line"
          : "min-h-dvh",
        className,
      )}
    >
      {!embedded ? (
        <a
          href={`#${mainId}`}
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:inline-flex focus:min-h-target focus:items-center focus:rounded-[var(--radius-control)] focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-on-accent"
        >
          {tShell("skipToContent")}
        </a>
      ) : null}

      {/* Decorative living sky ambient glow (never represents fake people, disabled under reduced motion) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-16 left-1/4 h-56 w-56 rounded-full bg-sky-glow/15 blur-3xl transition-opacity duration-[var(--duration-calm)]" />
        <div className="absolute right-1/5 bottom-12 h-64 w-64 rounded-full bg-accent/10 blur-3xl transition-opacity duration-[var(--duration-calm)]" />
      </div>

      {/* Top bar with brand and always-reachable "I need help" control (Spec 7.7) */}
      <header className="relative z-10 border-b border-line bg-surface-raised/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="inline-block h-3.5 w-3.5 rounded-full bg-sky-glow ring-4 ring-sky-glow/20"
            />
            <span className="text-base font-semibold tracking-tight text-ink">
              {SITE.name}
            </span>
          </div>

          <HelpControl label={expand(tShell("helpControl"))} />
        </div>
      </header>

      {/* Main hero: one-sentence promise + one primary button (Spec 7.1 step 1, P7) */}
      <main
        id={mainId}
        tabIndex={-1}
        className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-16"
      >
        <div className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-line bg-surface-raised px-3.5 py-1.5 text-xs font-medium text-ink-secondary">
          <span
            aria-hidden="true"
            className="h-2 w-2 rounded-full bg-status-chat"
          />
          <span>{expand(tHome("eyebrow"))}</span>
        </div>

        <h1 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-5xl sm:leading-tight break-words">
          {expand(tHome("title"))}
        </h1>

        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-secondary sm:text-lg break-words">
          {expand(tHome("promise", { appName: SITE.name }))}
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            variant="primary"
            onClick={onEnter}
            className="min-w-[13rem] px-6 py-3 text-base"
          >
            {expand(tHome("enter"))}
          </Button>
        </div>

        {/* Calm principles summary (P1, P3, P4) */}
        <ul
          aria-label={tHome("pillarsLabel")}
          className="mt-10 grid w-full gap-3 text-left sm:grid-cols-3"
        >
          <li className="rounded-[var(--radius-card)] border border-line bg-surface-raised p-4">
            <p className="text-sm font-semibold text-ink break-words">
              {expand(tHome("pillars.voiceTitle"))}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary break-words">
              {expand(tHome("pillars.voiceBody"))}
            </p>
          </li>
          <li className="rounded-[var(--radius-card)] border border-line bg-surface-raised p-4">
            <p className="text-sm font-semibold text-ink break-words">
              {expand(tHome("pillars.inviteTitle"))}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary break-words">
              {expand(tHome("pillars.inviteBody"))}
            </p>
          </li>
          <li className="rounded-[var(--radius-card)] border border-line bg-surface-raised p-4">
            <p className="text-sm font-semibold text-ink break-words">
              {expand(tHome("pillars.safetyTitle"))}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-secondary break-words">
              {expand(tHome("pillars.safetyBody"))}
            </p>
          </li>
        </ul>

        {/* Companion positioning and non-crisis notice (CR-5) */}
        <Card className="mt-8 w-full max-w-2xl bg-surface-raised p-4 text-left">
          <p className="text-xs leading-relaxed text-ink-secondary break-words">
            {expand(tHome("crisisDisclaimer", { appName: SITE.name }))}
          </p>
        </Card>
      </main>

      {/* Footer with accessible links to rules, privacy and terms (Spec 7.1, Spec 11.5) */}
      <footer className="relative z-10 border-t border-line bg-surface-raised/90 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 text-xs text-ink-secondary sm:flex-row">
          <p className="break-words">
            {expand(tHome("entityNote", { appName: SITE.name }))}
          </p>

          <nav
            aria-label={tHome("legalNavLabel")}
            className="flex flex-wrap items-center justify-center gap-1 sm:gap-2"
          >
            {LANDING_LEGAL_DOC_IDS.map((docId) => (
              <button
                key={docId}
                type="button"
                onClick={() => setActiveDoc(docId)}
                className="inline-flex min-h-target items-center rounded-[var(--radius-control)] px-3 py-2 text-xs font-medium text-ink-secondary underline decoration-line-strong underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:bg-surface-sunken hover:text-ink"
              >
                {expand(tHome(`links.${docId}`))}
              </button>
            ))}
          </nav>
        </div>
      </footer>

      {/* Legal / Rules summary dialog (SAFE-8, REC-2, Spec 11.5) */}
      {activeDoc ? (
        <Dialog
          open
          inline={embedded}
          onClose={() => setActiveDoc(null)}
          title={tHome(`legal.${activeDoc}Title`, { appName: SITE.name })}
          closeLabel={tCommon("close")}
          footer={
            <Button variant="secondary" onClick={() => setActiveDoc(null)}>
              {tCommon("close")}
            </Button>
          }
        >
          <p className="text-sm leading-relaxed text-ink-secondary">
            {tHome(`legal.${activeDoc}Body`, { appName: SITE.name })}
          </p>
        </Dialog>
      ) : null}
    </div>
  );
}
