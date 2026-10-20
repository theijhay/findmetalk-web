/**
 * App shell navigation tabs, surface rules and global connection banner states
 * (spec 7.7, 9.5, CR-5).
 *
 * Kept free of imports so the Node test runner can load it directly.
 */

export const NAV_TABS = ["cloud", "recents", "settings"] as const;
export type NavTab = (typeof NAV_TABS)[number];

export const SHELL_SURFACES = [
  "cloud",
  "recents",
  "settings",
  "call",
  "circle",
] as const;
export type ShellSurface = (typeof SHELL_SURFACES)[number];

export const SHELL_BANNER_STATES = [
  "normal",
  "offline",
  "reconnecting",
  "error",
] as const;
export type ShellBannerState = (typeof SHELL_BANNER_STATES)[number];

/**
 * Default call/session reconnect window in seconds when runtime config
 * (`calls.reconnect_window_seconds`) has not been loaded yet (spec 7.5).
 */
export const DEFAULT_RECONNECT_WINDOW_SECONDS = 15;

export interface NavItemConfig {
  readonly id: NavTab;
  readonly href: string;
  readonly messageKey: `nav.${NavTab}`;
}

export const NAV_ITEMS: readonly NavItemConfig[] = [
  { id: "cloud", href: "/cloud", messageKey: "nav.cloud" },
  { id: "recents", href: "/recents", messageKey: "nav.recents" },
  { id: "settings", href: "/settings", messageKey: "nav.settings" },
] as const;

/**
 * Resolves which primary navigation tab is active for a given pathname.
 */
export function resolveActiveNavTab(pathname: string): NavTab | null {
  const clean = (pathname.split("?")[0] ?? "").replace(/\/+$/, "") || "/";
  if (clean === "/cloud" || clean.startsWith("/cloud/")) return "cloud";
  if (clean === "/recents" || clean.startsWith("/recents/")) return "recents";
  if (clean === "/settings" || clean.startsWith("/settings/")) return "settings";
  return null;
}

/**
 * Primary navigation (Cloud, Recents, Settings) is shown on standard signed-in
 * surfaces and hidden during a live call or circle so call/circle safety
 * controls own the screen without competing navigation.
 */
export function shouldShowPrimaryNav(surface: ShellSurface): boolean {
  return surface === "cloud" || surface === "recents" || surface === "settings";
}

/**
 * Spec 7.7: "I need help" is reachable in at most one tap from every screen,
 * including during calls and circles, and is never hidden behind a menu.
 */
export function isHelpControlVisible(surface: ShellSurface): boolean {
  return SHELL_SURFACES.includes(surface);
}
