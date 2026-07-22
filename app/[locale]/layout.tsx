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

  const analyticsDomain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN || "plausible.example.com";

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${arabicFont.variable} ${latinFont.variable} h-full antialiased`}
    >
      <body className={`min-h-full flex flex-col ${fontClass}`}>
        <NextIntlClientProvider messages={messages}>
          {/* Privacy-first cookieless analytics (Plausible). Uses external initializer to comply with CSP. */}
          <script async defer data-domain={analyticsDomain} src="/analytics-init.js"></script>
          <script async defer data-domain={analyticsDomain} src={`https://plausible.io/js/plausible.js`} />

          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
