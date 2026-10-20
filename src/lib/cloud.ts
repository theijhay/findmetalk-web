/**
 * Pure cloud logic: sky orb layout and animation caps, language ring segments,
 * filtering, quick-match candidate ranking, and presence call gating
 * (Spec 7.2, 7.3, 9.1, 9.2, 9.3, 9.4, FR-CLOUD-3, FR-CLOUD-4, FR-CLOUD-6,
 * FR-CLOUD-7, FR-PROF-6).
 *
 * Kept free of imports so the Node test runner can load it directly.
 */

export const CURATED_INTEREST_IDS = [
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

export type CuratedInterestId = (typeof CURATED_INTEREST_IDS)[number];

export const USER_INTENTS = ["want_to_talk", "happy_to_listen"] as const;
export type UserIntent = (typeof USER_INTENTS)[number];

export type CloudStatusPresetId =
  | "just_chat"
  | "rough_day"
  | "happy_to_listen"
  | "cant_sleep"
  | "practicing_language"
  | "bored_say_hi"
  | "study_break";

export interface PresenceStatus {
  readonly preset: CloudStatusPresetId | null;
  readonly custom: string | null;
}

export type PresenceStateValue = "closed" | "open" | "in_call" | "in_circle";

export interface PresenceState {
  readonly state: PresenceStateValue;
  readonly status: PresenceStatus | null;
  readonly opened_at: string | null;
  readonly heartbeat_interval_seconds: number;
  readonly ttl_seconds: number;
}

export interface CloudEntry {
  readonly user_id: string;
  readonly display_name: string;
  readonly avatar_id:
    | "avatar_01"
    | "avatar_02"
    | "avatar_03"
    | "avatar_04"
    | "avatar_05"
    | "avatar_06"
    | "avatar_07"
    | "avatar_08";
  readonly languages: readonly string[];
  readonly interests: readonly CuratedInterestId[];
  readonly intent: UserIntent | null;
  readonly country: string | null;
  readonly status: PresenceStatus | null;
}

export interface ProfileCardData extends CloudEntry {
  readonly photo_url: string | null;
}

export interface CloudFilters {
  readonly language: string | null;
  readonly country: string | null;
  readonly interests: readonly CuratedInterestId[];
  readonly intent: UserIntent | null;
}

export const EMPTY_CLOUD_FILTERS: CloudFilters = {
  language: null,
  country: null,
  interests: [],
  intent: null,
};

export type CloudViewMode = "sky" | "list";

/**
 * Maximum number of orbs rendered in a single sky page so the DOM stays small
 * even when hundreds of people are open (Spec 9.1, FR-CLOUD-6).
 */
export const MAX_SKY_ORBS = 24;

/**
 * Maximum number of orbs simultaneously running a CSS drift animation so a
 * 4x CPU-throttled mobile device stays smooth at 60 fps (Spec 9.1).
 */
export const MAX_ANIMATED_ORBS = 12;

/**
 * Page size for the accessible list view when hundreds of people are open.
 */
export const MAX_LIST_PAGE_SIZE = 24;

/**
 * Maximum character length for a custom status line (Spec 9.4, API #20).
 */
export const CUSTOM_STATUS_MAX_LENGTH = 60;

export interface OrbPlacement {
  readonly entry: CloudEntry;
  readonly xPercent: number;
  readonly yPercent: number;
  readonly animated: boolean;
  readonly driftDelaySeconds: number;
  readonly driftDurationSeconds: number;
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Computes deterministic sky positions for open people, avoiding the bottom-centre
 * dock where the user's own orb and Open to talk switch sit, and capping both
 * rendered and animated orbs for low-end mobile performance (Spec 9.1, 9.2).
 */
export function layoutSkyOrbs(
  entries: readonly CloudEntry[],
  options: {
    readonly reducedMotion?: boolean;
    readonly maxOrbs?: number;
    readonly maxAnimated?: number;
  } = {},
): OrbPlacement[] {
  const reducedMotion = options.reducedMotion ?? false;
  const maxOrbs = options.maxOrbs ?? MAX_SKY_ORBS;
  const maxAnimated = options.maxAnimated ?? MAX_ANIMATED_ORBS;

  const visible = entries.slice(0, Math.max(0, maxOrbs));
  const cols = 6;
  const rows = 4;

  return visible.map((entry, idx) => {
    const hash = hashString(entry.user_id);
    const col = idx % cols;
    const row = Math.floor(idx / cols) % rows;

    const jitterX = ((hash & 0xff) / 255 - 0.5) * 6;
    const jitterY = (((hash >> 8) & 0xff) / 255 - 0.5) * 5;

    let xPercent = 13 + col * (74 / (cols - 1)) + jitterX;
    let yPercent = 16 + row * (52 / (rows - 1)) + jitterY;

    // Keep the bottom-centre dock (x: 34..66, y >= 64) clear for the user's own orb.
    if (yPercent > 62 && xPercent > 34 && xPercent < 66) {
      xPercent = xPercent < 50 ? 28 : 72;
    }

    xPercent = Math.round(Math.min(88, Math.max(12, xPercent)) * 10) / 10;
    yPercent = Math.round(Math.min(70, Math.max(14, yPercent)) * 10) / 10;

    const animated = !reducedMotion && idx < maxAnimated;
    const driftDelaySeconds = Math.round(((hash % 50) / 10) * 10) / 10;
    const driftDurationSeconds = 6 + (hash % 4);

    return {
      entry,
      xPercent,
      yPercent,
      animated,
      driftDelaySeconds,
      driftDurationSeconds,
    };
  });
}

export interface LanguageRingSegment {
  readonly code: string;
  readonly strokeDasharray: string;
  readonly strokeDashoffset: string;
}

/**
 * Computes SVG stroke-dasharray / stroke-dashoffset values for the thin
 * segmented language ring around a sky orb (Spec 9.2).
 */
export function computeLanguageRingSegments(
  languages: readonly string[],
  circumference = 175.93,
): LanguageRingSegment[] {
  const codes = languages.slice(0, 3);
  if (codes.length === 0) return [];

  if (codes.length === 1) {
    return [
      {
        code: codes[0]!,
        strokeDasharray: `${circumference.toFixed(2)} 0`,
        strokeDashoffset: "0",
      },
    ];
  }

  const gap = 8;
  const segmentLength = Math.max(
    12,
    (circumference - gap * codes.length) / codes.length,
  );
  const remainder = circumference - segmentLength;

  return codes.map((code, index) => {
    const offset = -(index * (segmentLength + gap));
    return {
      code,
      strokeDasharray: `${segmentLength.toFixed(2)} ${remainder.toFixed(2)}`,
      strokeDashoffset: offset.toFixed(2),
    };
  });
}

/**
 * Filters cloud entries by language, country (opted-in users only), interests
 * and intent (FR-CLOUD-4, API #21).
 */
export function filterCloudEntries(
  entries: readonly CloudEntry[],
  filters: CloudFilters,
): CloudEntry[] {
  return entries.filter((entry) => {
    if (filters.language && !entry.languages.includes(filters.language)) {
      return false;
    }
    if (filters.country) {
      if (!entry.country || entry.country !== filters.country) {
        return false;
      }
    }
    if (filters.intent && entry.intent !== filters.intent) {
      return false;
    }
    if (filters.interests.length > 0) {
      const hasSharedInterest = filters.interests.some((interest) =>
        entry.interests.includes(interest),
      );
      if (!hasSharedInterest) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Spec 9.3: List view is the default when prefers-reduced-motion or a screen
 * reader is active.
 */
export function resolveDefaultCloudView(options: {
  readonly prefersReducedMotion: boolean;
  readonly screenReaderHint?: boolean;
}): CloudViewMode {
  if (options.prefersReducedMotion || options.screenReaderHint) {
    return "list";
  }
  return "sky";
}

/**
 * FR-CLOUD-7: Browsing the cloud is allowed while the viewer's own switch is
 * off, but calling is disabled with a clear reason until Open to talk is on.
 */
export function canCallFromCloud(presenceState: PresenceStateValue): {
  readonly allowed: boolean;
  readonly reasonKey:
    | "cloud.callDisabledClosed"
    | "cloud.callDisabledBusy"
    | null;
} {
  if (presenceState === "open") {
    return { allowed: true, reasonKey: null };
  }
  if (presenceState === "closed") {
    return { allowed: false, reasonKey: "cloud.callDisabledClosed" };
  }
  return { allowed: false, reasonKey: "cloud.callDisabledBusy" };
}

/**
 * Ranks quick-match ("Find someone") candidates per Spec 7.3 and API #24:
 * shared spoken language first, then shared interests, then country when filtered.
 */
export function rankQuickMatchCandidates(
  entries: readonly CloudEntry[],
  viewer: {
    readonly languages: readonly string[];
    readonly interests: readonly CuratedInterestId[];
    readonly filterLanguage?: string | null;
    readonly filterCountry?: string | null;
  },
): CloudEntry[] {
  const candidates = entries.filter((entry) => {
    if (
      viewer.filterLanguage &&
      !entry.languages.includes(viewer.filterLanguage)
    ) {
      return false;
    }
    if (viewer.filterCountry) {
      if (!entry.country || entry.country !== viewer.filterCountry) {
        return false;
      }
    }
    return true;
  });

  return [...candidates].sort((a, b) => {
    const sharedLangA = a.languages.filter((lang) =>
      viewer.languages.includes(lang),
    ).length;
    const sharedLangB = b.languages.filter((lang) =>
      viewer.languages.includes(lang),
    ).length;
    if (sharedLangB !== sharedLangA) {
      return sharedLangB - sharedLangA;
    }

    const sharedIntA = a.interests.filter((id) =>
      viewer.interests.includes(id),
    ).length;
    const sharedIntB = b.interests.filter((id) =>
      viewer.interests.includes(id),
    ).length;
    if (sharedIntB !== sharedIntA) {
      return sharedIntB - sharedIntA;
    }

    const countryMatchA =
      viewer.filterCountry && a.country === viewer.filterCountry ? 1 : 0;
    const countryMatchB =
      viewer.filterCountry && b.country === viewer.filterCountry ? 1 : 0;
    return countryMatchB - countryMatchA;
  });
}

/**
 * Validates a custom status string (Spec 9.4, API #20: 1 to 60 characters).
 */
export function validateCustomStatus(raw: string): {
  readonly valid: boolean;
  readonly trimmed: string;
} {
  const trimmed = raw.trim();
  return {
    valid: trimmed.length >= 1 && trimmed.length <= CUSTOM_STATUS_MAX_LENGTH,
    trimmed,
  };
}

