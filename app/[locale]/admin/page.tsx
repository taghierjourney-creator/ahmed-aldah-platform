import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

import LogoutButton from "@/components/LogoutButton";
import type { Locale } from "@/lib/locale";

export const dynamic = "force-dynamic";

type AdminDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: AdminDashboardPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminDashboard.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  setRequestLocale(typedLocale);

  const t = await getTranslations("AdminDashboard");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_60%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row">
        <aside className="w-full lg:max-w-xs">
          <div className="rounded-[2rem] border border-foreground/10 bg-card/90 p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/60">
                {t("eyebrow")}
              </p>
              <h1 className="text-2xl font-semibold text-foreground">
                {t("title")}
              </h1>
            </div>
            <nav className="mt-8 space-y-2 text-sm text-foreground/70">
              <a href="#overview" className="block rounded-2xl px-3 py-2 transition hover:bg-foreground/10 hover:text-foreground">
                {t("navigation.overview")}
              </a>
              <a href="#stats" className="block rounded-2xl px-3 py-2 transition hover:bg-foreground/10 hover:text-foreground">
                {t("navigation.stats")}
              </a>
              <a href="#activity" className="block rounded-2xl px-3 py-2 transition hover:bg-foreground/10 hover:text-foreground">
                {t("navigation.activity")}
              </a>
            </nav>
            <div className="mt-8">
              <LogoutButton locale={typedLocale} className="w-full justify-center" />
            </div>
          </div>
        </aside>

        <section className="flex-1 space-y-8">
          <header className="rounded-[2rem] border border-foreground/10 bg-card/90 p-8 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/60">
                  {t("hero.eyebrow")}
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {t("hero.title")}
                </h2>
                <p className="max-w-2xl text-base leading-8 text-foreground/70">
                  {t("hero.description")}
                </p>
              </div>
              <Link
                href={`/${locale}/portal`}
                className="inline-flex items-center rounded-full border border-foreground/10 px-4 py-2 text-sm font-medium text-foreground/80 transition hover:border-foreground/30 hover:text-foreground"
              >
                {t("actions.openPortal")}
              </Link>
            </div>
          </header>

          <div id="overview" className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="rounded-[2rem] border border-foreground/10 bg-card/90 p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-foreground">{t("overview.title")}</h3>
              <p className="mt-3 text-base leading-8 text-foreground/70">{t("overview.description")}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-foreground/10 bg-background/70 p-4">
                  <p className="text-sm text-foreground/60">{t("overview.cards.requests")}</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">--</p>
                </div>
                <div className="rounded-2xl border border-foreground/10 bg-background/70 p-4">
                  <p className="text-sm text-foreground/60">{t("overview.cards.documents")}</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">--</p>
                </div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-foreground/10 bg-card/90 p-8 shadow-sm">
              <h3 className="text-xl font-semibold text-foreground">{t("summary.title")}</h3>
              <p className="mt-3 text-base leading-8 text-foreground/70">{t("summary.description")}</p>
            </div>
          </div>

          <div id="stats" className="rounded-[2rem] border border-foreground/10 bg-card/90 p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{t("stats.title")}</h3>
                <p className="mt-2 text-base leading-8 text-foreground/70">{t("stats.description")}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {["active", "pending", "resolved"].map((item) => (
                <div key={item} className="rounded-2xl border border-foreground/10 bg-background/70 p-4">
                  <p className="text-sm text-foreground/60">{t(`stats.items.${item}`)}</p>
                  <p className="mt-2 text-3xl font-semibold text-foreground">--</p>
                </div>
              ))}
            </div>
          </div>

          <div id="activity" className="rounded-[2rem] border border-foreground/10 bg-card/90 p-8 shadow-sm">
            <h3 className="text-xl font-semibold text-foreground">{t("activity.title")}</h3>
            <p className="mt-3 text-base leading-8 text-foreground/70">{t("activity.description")}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
