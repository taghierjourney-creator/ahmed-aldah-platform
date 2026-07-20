import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

import { getClientRequests } from "@/actions/portal";
import LogoutButton from "@/components/LogoutButton";
import type { Locale } from "@/lib/locale";

export const dynamic = "force-dynamic";

type ClientPortalPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ClientPortalPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Portal.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ClientPortalPage({ params }: ClientPortalPageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  setRequestLocale(typedLocale);

  const t = await getTranslations("Portal");

  let requests: Awaited<ReturnType<typeof getClientRequests>> = [];
  let errorMessage: string | null = null;

  try {
    requests = await getClientRequests();
  } catch {
    errorMessage = t("errors.unauthorized");
  }

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
                {t("sidebar.title")}
              </h1>
            </div>
            <nav className="mt-8 space-y-2 text-sm text-foreground/70">
              <a href="#requests" className="block rounded-2xl px-3 py-2 transition hover:bg-foreground/10 hover:text-foreground">
                {t("sidebar.links.requests")}
              </a>
              <a href="#documents" className="block rounded-2xl px-3 py-2 transition hover:bg-foreground/10 hover:text-foreground">
                {t("sidebar.links.documents")}
              </a>
              <a href="#profile" className="block rounded-2xl px-3 py-2 transition hover:bg-foreground/10 hover:text-foreground">
                {t("sidebar.links.profile")}
              </a>
            </nav>
            <div className="mt-8">
              <LogoutButton locale={typedLocale} className="w-full justify-center" />
            </div>
          </div>
        </aside>

        <section className="flex-1 space-y-8">
          <header className="rounded-[2rem] border border-foreground/10 bg-card/90 p-8 shadow-sm">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/60">
                {t("hero.eyebrow")}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {t("hero.title")}
              </h2>
              <p className="max-w-3xl text-base leading-8 text-foreground/70">
                {t("hero.description")}
              </p>
            </div>
          </header>

          {errorMessage ? (
            <section className="rounded-[2rem] border border-red-500/20 bg-card/90 p-8 text-center shadow-sm">
              <h3 className="text-2xl font-semibold tracking-tight text-foreground">{t("errors.title")}</h3>
              <p className="mt-4 text-base leading-8 text-foreground/70">{errorMessage}</p>
            </section>
          ) : (
            <>
              <div id="requests" className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                <div className="rounded-[2rem] border border-foreground/10 bg-card/90 p-8 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{t("requests.title")}</h3>
                      <p className="mt-2 text-base leading-8 text-foreground/70">{t("requests.description")}</p>
                    </div>
                  </div>

                  {requests.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-foreground/10 bg-background/70 p-6 text-center">
                      <h4 className="text-lg font-semibold text-foreground">{t("emptyTitle")}</h4>
                      <p className="mt-3 text-base leading-8 text-foreground/70">{t("emptyDescription")}</p>
                    </div>
                  ) : (
                    <div className="mt-6 grid gap-4">
                      {requests.map((request) => (
                        <Link
                          key={request.id}
                          href={`/${locale}/portal/requests/${request.id}`}
                          className="rounded-2xl border border-foreground/10 bg-background/70 p-4 transition hover:border-emerald-500/30"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold text-foreground">{request.title}</p>
                              <p className="mt-2 text-sm leading-7 text-foreground/70">
                                {t("timestamps.updatedAt", {
                                  date: new Intl.DateTimeFormat(typedLocale, {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  }).format(request.updatedAt),
                                })}
                              </p>
                            </div>
                            <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-foreground/80">
                              {t(`status.${request.status}`)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div id="profile" className="rounded-[2rem] border border-foreground/10 bg-card/90 p-8 shadow-sm">
                  <h3 className="text-xl font-semibold text-foreground">{t("profile.title")}</h3>
                  <p className="mt-2 text-base leading-8 text-foreground/70">{t("profile.description")}</p>
                  <div className="mt-6 rounded-2xl border border-foreground/10 bg-background/70 p-5">
                    <p className="text-sm text-foreground/60">{t("profile.summary")}</p>
                    <p className="mt-3 text-lg font-semibold text-foreground">{t("profile.value")}</p>
                  </div>
                </div>
              </div>

              <div id="documents" className="rounded-[2rem] border border-foreground/10 bg-card/90 p-8 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{t("documents.title")}</h3>
                    <p className="mt-2 text-base leading-8 text-foreground/70">{t("documents.description")}</p>
                  </div>
                </div>
                <div className="mt-6 rounded-2xl border border-dashed border-foreground/15 bg-background/70 p-8 text-center">
                  <p className="text-base leading-8 text-foreground/70">{t("documents.placeholder")}</p>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
