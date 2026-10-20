/**
 * Ambient time-of-day sky periods, theme resolution, status preset token
 * mappings and WCAG 2.2 contrast calculation.
 *
 * Kept free of imports so the Node test runner can load it directly.
 */

export const SKY_PERIODS = ["dawn", "day", "dusk", "night"] as const;
export type SkyPeriod = (typeof SKY_PERIODS)[number];

export const THEME_MODES = ["light", "dark"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export const THEME_PREFERENCES = ["auto", "light", "dark"] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export const STATUS_PRESET_IDS = [
  "just_chat",
  "rough_day",
  "happy_to_listen",
  "cant_sleep",
  "practicing_language",
  "bored_say_hi",
  "study_break",
] as const;
export type StatusPresetId = (typeof STATUS_PRESET_IDS)[number];

export type StatusTokenId = StatusPresetId | "custom";

export type StatusIconId =
  | "spark"
  | "cloud_rain"
  | "ear"
  | "moon"
  | "globe"
  | "wave"
  | "book"
  | "message";

export interface StatusMeta {
  readonly id: StatusTokenId;
  readonly colorToken: string;
  readonly bgClass: string;
  readonly textClass: string;
  readonly borderClass: string;
  readonly icon: StatusIconId;
  readonly messageKey: string;
}

export const STATUS_META: Readonly<Record<StatusTokenId, StatusMeta>> = {
  just_chat: {
    id: "just_chat",
    colorToken: "--color-status-chat",
    bgClass: "bg-status-chat/15",
    textClass: "text-status-chat",
    borderClass: "border-status-chat/40",
    icon: "spark",
    messageKey: "statusPresets.just_chat",
  },
  rough_day: {
    id: "rough_day",
    colorToken: "--color-status-rough-day",
    bgClass: "bg-status-rough-day/15",
    textClass: "text-status-rough-day",
    borderClass: "border-status-rough-day/40",
    icon: "cloud_rain",
    messageKey: "statusPresets.rough_day",
  },
  happy_to_listen: {
    id: "happy_to_listen",
    colorToken: "--color-status-listen",
    bgClass: "bg-status-listen/15",
    textClass: "text-status-listen",
    borderClass: "border-status-listen/40",
    icon: "ear",
    messageKey: "statusPresets.happy_to_listen",
  },
  cant_sleep: {
    id: "cant_sleep",
    colorToken: "--color-status-sleep",
    bgClass: "bg-status-sleep/15",
    textClass: "text-status-sleep",
    borderClass: "border-status-sleep/40",
    icon: "moon",
    messageKey: "statusPresets.cant_sleep",
  },
  practicing_language: {
    id: "practicing_language",
    colorToken: "--color-status-language",
    bgClass: "bg-status-language/15",
    textClass: "text-status-language",
    borderClass: "border-status-language/40",
    icon: "globe",
    messageKey: "statusPresets.practicing_language",
  },
  bored_say_hi: {
    id: "bored_say_hi",
    colorToken: "--color-status-hi",
    bgClass: "bg-status-hi/15",
    textClass: "text-status-hi",
    borderClass: "border-status-hi/40",
    icon: "wave",
    messageKey: "statusPresets.bored_say_hi",
  },
  study_break: {
    id: "study_break",
    colorToken: "--color-status-study",
    bgClass: "bg-status-study/15",
    textClass: "text-status-study",
    borderClass: "border-status-study/40",
    icon: "book",
    messageKey: "statusPresets.study_break",
  },
  custom: {
    id: "custom",
    colorToken: "--color-status-custom",
    bgClass: "bg-status-custom/15",
    textClass: "text-status-custom",
    borderClass: "border-status-custom/40",
    icon: "message",
    messageKey: "statusPresets.custom",
  },
};

export const AVATAR_PRESET_IDS = [
  "avatar_01",
  "avatar_02",
  "avatar_03",
  "avatar_04",
  "avatar_05",
  "avatar_06",
  "avatar_07",
  "avatar_08",
] as const;
export type AvatarPresetId = (typeof AVATAR_PRESET_IDS)[number];

/**
 * Maps a local hour (0 to 23) to the ambient sky period (spec 9.2):
 * - dawn: 05:00 to 07:59
 * - day: 08:00 to 16:59
 * - dusk: 17:00 to 19:59
 * - night: 20:00 to 04:59
 */
export function getSkyPeriod(localHour: number): SkyPeriod {
  const hour = ((Math.floor(localHour) % 24) + 24) % 24;
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

/**
 * Default theme from local time (spec 9.6): light during dawn and day,
 * dark during dusk and night.
 */
export function getDefaultThemeForPeriod(period: SkyPeriod): ThemeMode {
  return period === "dawn" || period === "day" ? "light" : "dark";
}

/**
 * Resolves the active theme mode and sky palette given the user's preference
 * and local hour. When the user overrides the theme to light during night/dusk,
 * the surface palette shifts to day while preserving a consistent pair; when
 * overridden to dark during dawn/day, it shifts to night.
 */
export function resolveAppearance(
  preference: ThemePreference,
  localHour: number,
  forcedPeriod?: SkyPeriod,
): { theme: ThemeMode; sky: SkyPeriod } {
  const naturalSky = forcedPeriod ?? getSkyPeriod(localHour);
  if (preference === "auto") {
    return {
      theme: getDefaultThemeForPeriod(naturalSky),
      sky: naturalSky,
    };
  }
  if (preference === "light") {
    return {
      theme: "light",
      sky: naturalSky === "dawn" || naturalSky === "day" ? naturalSky : "day",
    };
  }
  return {
    theme: "dark",
    sky: naturalSky === "dusk" || naturalSky === "night" ? naturalSky : "night",
  };
}

export function isThemePreference(value: string | null | undefined): value is ThemePreference {
  return value === "auto" || value === "light" || value === "dark";
}

export function getStatusMeta(preset: string | null | undefined): StatusMeta {
  if (preset && Object.prototype.hasOwnProperty.call(STATUS_META, preset)) {
    return STATUS_META[preset as StatusTokenId];
  }
  return STATUS_META.custom;
}

/**
 * Relative luminance of a 6-digit hex colour per WCAG 2.2.
 */
export function relativeLuminance(hex: string): number {
  const match = hex.trim().toLowerCase().match(/^#([0-9a-f]{6})$/);
  if (!match || !match[1]) {
    throw new Error(`Expected 6-digit hex colour, got: ${hex}`);
  }
  const raw = match[1];
  const channels = [0, 2, 4].map((offset) => {
    const srgb = Number.parseInt(raw.slice(offset, offset + 2), 16) / 255;
    return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * (channels[0] ?? 0) + 0.7152 * (channels[1] ?? 0) + 0.0722 * (channels[2] ?? 0);
}

/**
 * WCAG 2.2 contrast ratio between two 6-digit hex colours (1 to 21).
 */
export function contrastRatio(hexA: string, hexB: string): number {
  const lumA = relativeLuminance(hexA);
  const lumB = relativeLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}
