import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import db from "@/lib/db";
import ArticleCard from "@/components/ArticleCard";
import SmartSearch from "@/components/SmartSearch";
import type { Locale } from "@/lib/locale";

type BlogPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Blog.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  setRequestLocale(typedLocale);
  const t = await getTranslations("Blog");

  const articles = await db.article.findMany({
    where: {
      locale: typedLocale,
      published: true,
      deletedAt: null,
    },
    include: {
      category: true,
      tags: true,
      series: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!articles) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/90">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-foreground/75">
            {t("description")}
          </p>
        </div>

        <SmartSearch />

        {articles.length === 0 ? (
          <div className="rounded-3xl border border-border/80 bg-card p-10 text-center text-foreground/80">
            {t("empty")}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
