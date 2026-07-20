import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

import FileUpload from "@/components/FileUpload";
import { getClientRequestById } from "@/actions/portal";
import type { Locale } from "@/lib/locale";

export const dynamic = "force-dynamic";

type ClientRequestPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({
  params,
}: ClientRequestPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PortalRequest.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ClientRequestPage({ params }: ClientRequestPageProps) {
  const { locale, id } = await params;
  const typedLocale = locale as Locale;

  setRequestLocale(typedLocale);

  const t = await getTranslations("PortalRequest");

  let request: Awaited<ReturnType<typeof getClientRequestById>> | null = null;
  let errorMessage: string | null = null;

  try {
    request = await getClientRequestById(id);
  } catch {
    errorMessage = t("errors.unavailable");
  }

  if (!request) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-red-500/20 bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("errors.title")}</h1>
          <p className="mt-4 text-base leading-7 text-foreground/75">{errorMessage}</p>
          <div className="mt-8">
            <Link
              href={`/${locale}/portal`}
              className="inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:bg-foreground/90"
            >
              {t("actions.backToPortal")}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/60">
              {t("eyebrow")}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {request.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/75">
              {t("statusLabel")}: {t(`status.${request.status}`)}
            </p>
          </div>
          <Link
            href={`/${locale}/portal`}
            className="inline-flex rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition hover:bg-foreground/90"
          >
            {t("actions.backToPortal")}
          </Link>
        </div>

        <div className="rounded-[2rem] border border-foreground/10 bg-card p-8 shadow-sm">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{t("fields.description")}</h2>
              <p className="mt-3 text-base leading-7 text-foreground/75">{request.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-foreground/10 bg-background p-5">
                <p className="text-sm font-semibold text-foreground/70">{t("fields.createdAt")}</p>
                <p className="mt-2 text-base text-foreground">
                  {new Intl.DateTimeFormat(typedLocale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(request.createdAt)}
                </p>
              </div>
              <div className="rounded-3xl border border-foreground/10 bg-background p-5">
                <p className="text-sm font-semibold text-foreground/70">{t("fields.updatedAt")}</p>
                <p className="mt-2 text-base text-foreground">
                  {new Intl.DateTimeFormat(typedLocale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(request.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-4 rounded-[2rem] border border-foreground/10 bg-card p-8 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{t("documents.title")}</h2>
              <p className="mt-2 text-sm leading-6 text-foreground/75">{t("documents.description")}</p>
            </div>
          </div>

          {request.documents.length === 0 ? (
            <p className="text-base leading-7 text-foreground/75">{t("documents.empty")}</p>
          ) : (
            <div className="grid gap-4">
              {request.documents.map((document) => (
                <article
                  key={document.id}
                  className="rounded-3xl border border-foreground/10 bg-background p-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{document.originalName}</p>
                      <p className="text-sm text-foreground/70">{document.mimeType}</p>
                    </div>
                    <p className="text-sm text-foreground/60">
                      {document.size.toLocaleString(typedLocale)} {t("documents.sizeSuffix")}
                    </p>
                  </div>
                  <p className="mt-3 text-sm text-foreground/70">
                    {t("documents.uploadedAt", {
                      date: new Intl.DateTimeFormat(typedLocale, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(document.createdAt),
                    })}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-foreground/10 bg-card p-8 shadow-sm">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{t("upload.title")}</h2>
              <p className="mt-2 text-sm leading-6 text-foreground/75">{t("upload.description")}</p>
            </div>
            <FileUpload requestId={request.id} onUploaded={() => null} />
          </div>
        </section>
      </section>
    </main>
  );
}
