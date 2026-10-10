export const LOCALES = ["en", "hi", "kn"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "locale";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Each language names itself, so a reader can find theirs without reading the current one. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
  kn: "ಕನ್ನಡ",
};

/** BCP 47 tags for Intl formatting. */
export const INTL_LOCALES: Record<Locale, string> = {
  en: "en-IN",
  hi: "hi-IN",
  kn: "kn-IN",
};

export function isLocale(value: unknown): value is Locale {
  return LOCALES.includes(value as Locale);
}

/** First supported language in an Accept-Language header, e.g. "kn-IN,kn;q=0.9,en;q=0.8". */
export function localeFromAcceptLanguage(header: string | null): Locale {
  for (const part of (header ?? "").split(",")) {
    const base = part.split(";")[0].trim().slice(0, 2).toLowerCase();
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

export function localeCookie(locale: Locale) {
  return `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}

/** Fills `{name}` placeholders: format("{count} schemes", { count: 3 }). */
export function format(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
