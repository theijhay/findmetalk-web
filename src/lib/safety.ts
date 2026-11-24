/**
 * Pure safety, crisis-help and appeals logic (SAFE-2, SAFE-3, SAFE-4, CR-1,
 * CR-2, CR-3, CR-4, CR-5, Spec 11.3 Appeals, OPEN-25, API #27, #28, #44).
 *
 * Kept free of imports so the Node test runner can load it directly.
 */

export const REPORT_REASONS = [
  "harassment",
  "sexual_content",
  "hate",
  "scam",
  "underage",
  "self_harm_concern",
  "other",
] as const;

export type SafetyReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_NOTE_MAX_LENGTH = 1000;
export const APPEAL_MESSAGE_MIN_LENGTH = 1;
export const APPEAL_MESSAGE_MAX_LENGTH = 2000;

export type SafetyAvatarId =
  | "avatar_01"
  | "avatar_02"
  | "avatar_03"
  | "avatar_04"
  | "avatar_05"
  | "avatar_06"
  | "avatar_07"
  | "avatar_08";

export interface ReportRequestPayload {
  readonly reported_user_id: string;
  readonly reason: SafetyReportReason;
  readonly note: string | null;
  readonly call_id: string | null;
  readonly circle_id: string | null;
  readonly photo_id: string | null;
}

export interface ReportCreatedResponse {
  readonly id: string;
  readonly created_at: string;
}

export interface BlockRequestPayload {
  readonly user_id: string;
  readonly call_id: string | null;
  readonly circle_id: string | null;
}

export interface BlockedUserItem {
  readonly user_id: string;
  readonly display_name: string;
  readonly avatar_id: SafetyAvatarId;
  readonly created_at: string;
}

export type AccountStandingStatus = "active" | "suspended" | "banned";
export type ModerationActionKind = "suspend" | "ban";
export type AppealState = "open" | "reviewing" | "upheld" | "overturned";

export interface ModerationActionSummary {
  readonly id: string;
  readonly action: ModerationActionKind;
  readonly reason: string;
  readonly ends_at: string | null;
}

export interface AppealSummary {
  readonly id: string;
  readonly state: AppealState;
  readonly created_at: string;
  readonly resolved_at?: string | null;
}

export interface AccountStandingData {
  readonly status: AccountStandingStatus;
  readonly action: ModerationActionSummary | null;
  readonly appeal: AppealSummary | null;
  readonly can_appeal: boolean;
}

export const HELP_COUNTRY_CODES = [
  "NG",
  "GH",
  "KE",
  "ZA",
  "GB",
  "US",
  "CA",
  "FR",
  "DE",
  "IN",
  "AU",
] as const;

export type HelpCountryCode = (typeof HELP_COUNTRY_CODES)[number];

export interface CrisisDirectoryLink {
  readonly providerId: string;
  readonly mode: "link";
  readonly url: string;
  readonly countryCode: HelpCountryCode | null;
}

/**
 * Swappable crisis directory abstraction (CR-1, CR-2, CR-4, OPEN-25).
 * No hotline numbers are ever hardcoded in the codebase.
 */
export interface CrisisDirectoryProvider {
  readonly providerId: string;
  getDirectoryLink(countryCode: HelpCountryCode | null): CrisisDirectoryLink;
}

export const FIND_A_HELPLINE_PROVIDER: CrisisDirectoryProvider = {
  providerId: "find_a_helpline",
  getDirectoryLink(countryCode: HelpCountryCode | null): CrisisDirectoryLink {
    if (countryCode && (HELP_COUNTRY_CODES as readonly string[]).includes(countryCode)) {
      return {
        providerId: "find_a_helpline",
        mode: "link",
        url: `https://findahelpline.com/countries/${countryCode.toLowerCase()}`,
        countryCode,
      };
    }
    return {
      providerId: "find_a_helpline",
      mode: "link",
      url: "https://findahelpline.com/",
      countryCode: null,
    };
  },
};

/**
 * CR-3: Pre-fills country from browser locale tags only (never IP).
 * Returns null if no supported region subtag is present so the user picks
 * explicitly.
 */
export function inferCountryFromLocale(
  locales: readonly string[] | string | null | undefined,
): HelpCountryCode | null {
  if (!locales) return null;
  const list = typeof locales === "string" ? [locales] : locales;
  for (const tag of list) {
    if (typeof tag !== "string") continue;
    const parts = tag.trim().split(/[-_]/);
    for (let i = 1; i < parts.length; i += 1) {
      const candidate = parts[i]?.toUpperCase();
      if (
        candidate &&
        (HELP_COUNTRY_CODES as readonly string[]).includes(candidate)
      ) {
        return candidate as HelpCountryCode;
      }
    }
  }
  return null;
}

/**
 * SAFE-4 / API #28: Underage and self-harm concern reports receive priority
 * human moderation review.
 */
export function isPriorityReportReason(reason: SafetyReportReason): boolean {
  return reason === "underage" || reason === "self_harm_concern";
}

/**
 * API #28: Optional report note up to 1000 characters.
 */
export function validateReportNote(raw: string): {
  readonly valid: boolean;
  readonly normalized: string | null;
} {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { valid: true, normalized: null };
  }
  return {
    valid: trimmed.length <= REPORT_NOTE_MAX_LENGTH,
    normalized: trimmed,
  };
}

/**
 * API #44: Appeal message must be 1 to 2000 trimmed characters.
 */
export function validateAppealMessage(raw: string): {
  readonly valid: boolean;
  readonly trimmed: string;
} {
  const trimmed = raw.trim();
  return {
    valid:
      trimmed.length >= APPEAL_MESSAGE_MIN_LENGTH &&
      trimmed.length <= APPEAL_MESSAGE_MAX_LENGTH,
    trimmed,
  };
}

/**
 * API #44: One appeal per moderation action when `can_appeal` is true.
 */
export function canSubmitAppeal(
  standing: Pick<AccountStandingData, "action" | "appeal" | "can_appeal">,
): boolean {
  return Boolean(standing.can_appeal && standing.action && !standing.appeal);
}
