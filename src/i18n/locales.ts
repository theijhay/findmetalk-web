/**
 * UI languages (spec decision log #3, 9.6). English is the source; every other
 * file holds reviewed human translations only and falls back to English for
 * any key it does not have yet.
 *
 * Kept free of imports so the node test runner can load it directly.
 */
export const LOCALES = ["en", "pcm", "yo", "ha", "ig", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** Set when the user picks a language in settings. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * The language to render: the saved choice, else the first supported language
 * the browser asks for, else English. Never derived from IP (spec FR-PROF-4).
 */
export function pickLocale(saved: string | undefined, acceptLanguage: string | null): Locale {
  if (isLocale(saved)) return saved;
  const requested = (acceptLanguage ?? "")
    .split(",")
    .map((part) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.toLowerCase(), q: q ? Number(q.trim().slice(2)) : 1 };
    })
    .filter((entry) => entry.tag && !Number.isNaN(entry.q) && entry.q > 0)
    .sort((a, b) => b.q - a.q);
  for (const { tag } of requested) {
    const primary = tag.split("-")[0];
    if (isLocale(primary)) return primary;
  }
  return DEFAULT_LOCALE;
}

type Messages = { [key: string]: string | Messages };

/** English with the locale's own strings laid over it, key by key. */
export function mergeMessages(base: Messages, override: Messages): Messages {
  const out: Messages = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const current = out[key];
    out[key] =
      typeof value === "object" && typeof current === "object" ? mergeMessages(current, value) : value;
  }
  return out;
}
