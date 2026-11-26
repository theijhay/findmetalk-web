import type { HelpCountryCode } from "@/lib/safety";

/**
 * Fixtures for `/preview` only for the "I need help" crisis directory screen.
 * Never import this file into production pages or HelpScreen.
 */

export const HELP_PREVIEW_LOCALE_NG: readonly string[] = ["en-NG", "en"];
export const HELP_PREVIEW_LOCALE_NONE: readonly string[] = ["en"];
export const HELP_PREVIEW_COUNTRY_DEFAULT: HelpCountryCode = "NG";
