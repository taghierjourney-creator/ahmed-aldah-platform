import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { getServerSession } from "@/lib/auth";
import { getPendingCommentsForModeration } from "@/actions/comment";
import CommentModerationTable from "@/components/admin/CommentModerationTable";
import type { Locale } from "@/lib/locale";

export const dynamic = "force-dynamic";

type AdminCommentsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: AdminCommentsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "CommentModeration.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AdminCommentsPage({ params }: AdminCommentsPageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  setRequestLocale(typedLocale);

  const t = await getTranslations("CommentModeration");

  const session = await getServerSession();
  const role = String(session?.user?.role ?? "").toUpperCase();
  const allowed = role === "ADMIN" || role === "MODERATOR";

  if (!allowed) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-red-500/20 bg-card p-10 text-center shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("permission.title")}</h1>
          <p className="mt-4 text-base leading-7 text-foreground/75">{t("permission.description")}</p>
        </section>
      </main>
    );
  }

  const comments = await getPendingCommentsForModeration();

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/60">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-foreground/75">{t("description")}</p>
        </header>

        <CommentModerationTable
          comments={comments.map((comment) => ({
            id: comment.id,
            content: comment.content,
            status: comment.status,
            createdAt: comment.createdAt.toISOString(),
            article: comment.article,
          }))}
        />
      </section>
    </main>
  );
}
