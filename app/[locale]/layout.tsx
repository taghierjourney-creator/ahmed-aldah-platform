import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { routing } from "@/i18n/routing";
import { arabicFont, latinFont } from "@/lib/fonts";
import { getDirection, type Locale } from "@/lib/locale";

import "../globals.css";

export const metadata: Metadata = {
  title: "Ahmed Al-Dah Platform",
  description: "Knowledge hub and research platform",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const typedLocale = locale as Locale;
  const direction = getDirection(typedLocale);
  const fontClass = typedLocale === "ar" ? "font-arabic" : "font-latin";

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${arabicFont.variable} ${latinFont.variable} h-full antialiased`}
    >
      <body className={`min-h-full flex flex-col ${fontClass}`}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
