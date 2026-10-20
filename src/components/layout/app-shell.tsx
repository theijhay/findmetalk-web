"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import * as React from "react";

import { HelpControl } from "@/components/layout/help-control";
import { Banner, Button } from "@/components/ui";
import { SITE } from "@/config/site";
import {
  isHelpControlVisible,
  NAV_ITEMS,
  type NavTab,
  type ShellBannerState,
  type ShellSurface,
  shouldShowPrimaryNav,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

export interface AppShellProps {
  surface?: ShellSurface;
  activeTab?: NavTab | null;
  bannerState?: ShellBannerState;
  onSelectTab?: (tab: NavTab) => void;
  onRetry?: () => void;
  onHelpActivate?: () => void;
  inlinePreview?: boolean;
  children: React.ReactNode;
  className?: string;
}

function NavIcon({ tab, active }: { tab: NavTab; active: boolean }) {
  const cls = cn("h-5 w-5 shrink-0", active ? "text-on-accent md:text-accent" : "text-ink-secondary");
  switch (tab) {
    case "cloud":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 14.5a3.5 3.5 0 01-.4-6.97A4.5 4.5 0 0114 8.5a3 3 0 01.5 5.96H5.5z" />
        </svg>
      );
    case "recents":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls} aria-hidden="true">
          <circle cx="10" cy="10" r="6.75" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6.5v3.75l2.5 1.5" />
        </svg>
      );
    case "settings":
      return (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className={cls} aria-hidden="true">
          <circle cx="10" cy="10" r="2.75" />
          <path strokeLinecap="round" d="M10 2.75v2M10 15.25v2M2.75 10h2M15.25 10h2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4M15.1 4.9l-1.4 1.4M6.3 13.7l-1.4 1.4" />
        </svg>
      );
  }
}

/**
 * Signed-in application shell (spec 7.7, 9.5, CR-5).
 * Provides mobile-first safe-area layout, navigation between Cloud, Recents
 * and Settings, global connection banners, and the persistent one-tap
 * "I need help" control on every surface (including calls and circles).
 */
export function AppShell({
  surface = "cloud",
  activeTab = surface === "cloud" || surface === "recents" || surface === "settings" ? surface : null,
  bannerState = "normal",
  onSelectTab,
  onRetry,
  onHelpActivate,
  inlinePreview = false,
  children,
  className,
}: AppShellProps) {
  const t = useTranslations("shell");
  const tCommon = useTranslations("common");
  const mainId = React.useId();

  const showNav = shouldShowPrimaryNav(surface);
  const showHelp = isHelpControlVisible(surface);

  const renderNavItem = (item: (typeof NAV_ITEMS)[number], layout: "desktop" | "mobile") => {
    const isActive = activeTab === item.id;
    const label = t(item.messageKey);

    const desktopClasses = cn(
      "inline-flex min-h-target min-w-target items-center justify-center gap-2 rounded-[var(--radius-pill)] px-4 py-2 text-sm font-medium transition-colors duration-[var(--duration-fast)] ease-[var(--ease-calm)] whitespace-normal break-words",
      isActive
        ? "border border-accent bg-accent/15 font-semibold text-ink"
        : "border border-transparent text-ink-secondary hover:bg-surface-sunken hover:text-ink",
    );

    const mobileClasses = cn(
      "flex min-h-target min-w-target flex-1 flex-col items-center justify-center gap-1 rounded-[var(--radius-control)] px-2 py-1.5 text-center text-xs font-medium transition-colors duration-[var(--duration-fast)] ease-[var(--ease-calm)] whitespace-normal break-words",
      isActive
        ? "bg-accent text-on-accent font-semibold shadow-[var(--shadow-card)]"
        : "text-ink-secondary hover:bg-surface-sunken hover:text-ink",
    );

    const classes = layout === "desktop" ? desktopClasses : mobileClasses;

    if (onSelectTab) {
      return (
        <button
          key={item.id}
          type="button"
          aria-current={isActive ? "page" : undefined}
          onClick={() => onSelectTab(item.id)}
          className={classes}
        >
          <NavIcon tab={item.id} active={isActive} />
          <span>{label}</span>
        </button>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={classes}
      >
        <NavIcon tab={item.id} active={isActive} />
        <span>{label}</span>
      </Link>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col bg-page text-ink",
        inlinePreview ? "min-h-[34rem] rounded-[var(--radius-card)] border border-line overflow-hidden shadow-[var(--shadow-card)]" : "min-h-dvh",
        className,
      )}
    >
      {!inlinePreview ? (
        <a
          href={`#${mainId}`}
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:inline-flex focus:min-h-target focus:items-center focus:rounded-[var(--radius-control)] focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-accent"
        >
          {t("skipToContent")}
        </a>
      ) : null}

      {/* Top header with safe-area top inset and always-reachable "I need help" control */}
      <header
        className={cn(
          "border-b border-line bg-surface/95 backdrop-blur-sm",
          !inlinePreview && "sticky top-0 z-30 pt-[env(safe-area-inset-top,0px)]",
        )}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold tracking-tight text-ink sm:text-lg">
              {SITE.name}
            </span>
            {!showNav ? (
              <span className="rounded-[var(--radius-pill)] border border-line bg-surface-sunken px-2.5 py-0.5 text-xs font-medium text-ink-secondary">
                {surface === "call" ? t("surfaceCall") : t("surfaceCircle")}
              </span>
            ) : null}
          </div>

          {showNav ? (
            <nav
              aria-label={t("primaryNavLabel")}
              className="hidden items-center gap-1.5 md:flex"
            >
              {NAV_ITEMS.map((item) => renderNavItem(item, "desktop"))}
            </nav>
          ) : null}

          {showHelp ? (
            <HelpControl
              label={t("helpControl")}
              onActivate={onHelpActivate}
            />
          ) : null}
        </div>
      </header>

      {/* Global connection and error banners (spec 7.5, 9.7) */}
      {bannerState !== "normal" ? (
        <div className="mx-auto w-full max-w-5xl px-4 pt-3 sm:px-6">
          {bannerState === "offline" ? (
            <Banner
              tone="caution"
              title={t("banners.offlineTitle")}
              description={t("banners.offlineBody", { appName: SITE.name })}
              action={
                <Button variant="secondary" onClick={onRetry}>
                  {tCommon("retry")}
                </Button>
              }
            />
          ) : null}
          {bannerState === "reconnecting" ? (
            <Banner
              tone="caution"
              title={t("banners.reconnectingTitle")}
              description={t("banners.reconnectingBody")}
            />
          ) : null}
          {bannerState === "error" ? (
            <Banner
              tone="danger"
              title={t("banners.errorTitle")}
              description={t("banners.errorBody", { appName: SITE.name })}
              action={
                <Button variant="secondary" onClick={onRetry}>
                  {tCommon("retry")}
                </Button>
              }
            />
          ) : null}
        </div>
      ) : null}

      {/* Main screen content area: keeps one primary action per screen */}
      <main
        id={mainId}
        tabIndex={-1}
        className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-6 sm:px-6"
      >
        {children}
      </main>

      {/* Mobile bottom navigation bar with safe-area bottom inset */}
      {showNav ? (
        <nav
          aria-label={t("primaryNavLabel")}
          className={cn(
            "border-t border-line bg-surface px-3 py-2 md:hidden",
            !inlinePreview && "sticky bottom-0 z-30 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]",
          )}
        >
          <div className="mx-auto flex max-w-md items-stretch justify-around gap-2">
            {NAV_ITEMS.map((item) => renderNavItem(item, "mobile"))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
