import { getTranslations, setRequestLocale } from "next-intl/server";

import { LocaleSwitcher } from "@/components/locale-switcher";
import type { Locale } from "@/lib/locale";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  setRequestLocale(typedLocale);

  const t = await getTranslations("Home");

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-8 py-16">
      <main className="w-full max-w-2xl space-y-8">
        <header className="space-y-2 text-center">
          <p className="text-sm text-foreground/60">
            {t("localeLabel", { locale: typedLocale })}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-lg text-foreground/70">{t("description")}</p>
        </header>
        <LocaleSwitcher />
      </main>
    </div>
  );
}
