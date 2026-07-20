import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

import { getClientRequests } from "@/actions/portal";
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
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/60">
            {t("eyebrow")}
          </p>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("title")}
            </h1>
            <p className="max-w-3xl text-base leading-7 text-foreground/75">{t("description")}</p>
          </div>
        </header>

        {errorMessage ? (
          <section className="rounded-3xl border border-red-500/20 bg-card p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">{t("errors.title")}</h2>
            <p className="mt-4 text-base leading-7 text-foreground/75">{errorMessage}</p>
          </section>
        ) : requests.length === 0 ? (
          <section className="rounded-3xl border border-foreground/10 bg-card p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">{t("emptyTitle")}</h2>
            <p className="mt-4 text-base leading-7 text-foreground/75">{t("emptyDescription")}</p>
          </section>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            {requests.map((request) => (
              <Link
                key={request.id}
                href={`/${locale}/portal/requests/${request.id}`}
                className="block rounded-[2rem] border border-foreground/10 bg-card p-6 text-start transition hover:border-emerald-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground">
                      {request.title}
                    </h2>
                    <p className="text-sm leading-6 text-foreground/70">
                      {t("timestamps.updatedAt", {
                        date: new Intl.DateTimeFormat(typedLocale, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(request.updatedAt),
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
                    {t(`status.${request.status}`)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
