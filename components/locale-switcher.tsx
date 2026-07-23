"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { locales, type Locale } from "@/lib/locale";

const localeLabels: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
  fr: "Français",
};

export function LocaleSwitcher() {
  const currentLocale = useLocale() as Locale;
  const pathname = usePathname() || "/";
  const t = useTranslations("LocaleSwitcher");

  const segments = pathname.split("/").filter(Boolean);
  const normalizedPath = segments.length && locales.includes(segments[0] as Locale) ? `/${segments.slice(1).join("/")}` : pathname;
  const suffix = "";

  return (
    <nav aria-label={t("label")} className="flex flex-wrap justify-center gap-2">
      {locales.map((locale) => {
        const isActive = locale === currentLocale;
        const href = `/${locale}${normalizedPath === "/" ? "" : normalizedPath}${suffix}`;

        return (
          <Link
            key={locale}
            href={href}
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
