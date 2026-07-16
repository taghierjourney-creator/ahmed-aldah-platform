export const locales = ["ar", "en", "fr"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function hasLocalePrefix(locale: Locale): boolean {
  return locale !== defaultLocale;
}

export function getLocalePathPrefix(locale: Locale): string {
  return hasLocalePrefix(locale) ? `/${locale}` : "";
}

export function resolveLocaleFromPathname(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];

  if (segment && isLocale(segment) && segment !== defaultLocale) {
    return segment;
  }

  return defaultLocale;
}

export function shouldDetectLocaleFromHeader(): boolean {
  return false;
}
