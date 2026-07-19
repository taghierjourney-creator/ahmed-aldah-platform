import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import ContactForm from "@/components/ContactForm";
import OfficeNav from "@/components/office/OfficeNav";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/lib/locale";

type OfficePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: OfficePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Office.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function OfficePage({ params }: OfficePageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  setRequestLocale(typedLocale);

  const t = await getTranslations("Office");

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-12">
        <header className="space-y-6 rounded-[2rem] border border-emerald-700/15 bg-gradient-to-b from-emerald-50/80 to-background p-8 sm:p-12 dark:from-emerald-950/30 dark:to-background">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-400">
            {t("hero.eyebrow")}
          </p>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="max-w-2xl text-xl font-medium text-emerald-800/90 dark:text-emerald-300/90">
              {t("hero.subtitle")}
            </p>
            <p className="max-w-3xl text-base leading-8 text-foreground/75">
              {t("hero.description")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/office/services"
              className="inline-flex items-center rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-800"
            >
              {t("cta.exploreServices")}
            </Link>
            <Link
              href="/office/projects"
              className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium text-foreground ring-1 ring-foreground/15 transition hover:bg-foreground/5"
            >
              {t("cta.viewProjects")}
            </Link>
          </div>
        </header>

        <OfficeNav active="office" />

        <section className="rounded-[2rem] border border-foreground/10 bg-card p-8 sm:p-10">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("intro.title")}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-foreground/75">
            {t("intro.body")}
          </p>
        </section>

        <ContactForm />
      </section>
    </main>
  );
}
