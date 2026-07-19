"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { locales, type Locale } from "@/lib/locale";

const localeLabels: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
  fr: "Français",
};

export function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale;
  const t = useTranslations("LocaleSwitcher");

  return (
    <nav
      aria-label={t("label")}
      className="flex flex-wrap justify-center gap-2"
    >
      {locales.map((locale) => {
        const isActive = locale === currentLocale;

        return (
          <Link
            key={locale}
            href="/"
            locale={locale}
            className={
              isActive
                ? "rounded-md bg-foreground px-3 py-1.5 text-sm text-background"
                : "rounded-md px-3 py-1.5 text-sm text-foreground ring-1 ring-foreground/20 transition-colors hover:bg-foreground/5"
            }
          >
            {localeLabels[locale]}
          </Link>
        );
      })}
    </nav>
  );
}
