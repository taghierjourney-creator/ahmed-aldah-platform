import type { Metadata } from "next";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import ArticleCard from "@/components/ArticleCard";
import SmartSearch from "@/components/SmartSearch";

export const dynamic = "force-dynamic";

type BlogPageProps = {
  params: {
    locale: string;
  };
};

export const metadata: Metadata = {
  title: "Knowledge Hub",
  description: "Explore the latest knowledge hub articles in your chosen language.",
};

export default async function BlogPage({ params }: BlogPageProps) {
  const locale = params.locale;
  const articles = await db.article.findMany({
    where: {
      locale,
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
            Knowledge Hub
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {locale === "ar" ? "المقالات" : "Latest Articles"}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-foreground/75">
            {locale === "ar"
              ? "اكتشف أحدث المقالات المتاحة بلغتك."
              : "Discover the latest published articles for your locale."}
          </p>
        </div>

        <SmartSearch />

        {articles.length === 0 ? (
          <div className="rounded-3xl border border-border/80 bg-card p-10 text-center text-foreground/80">
            {locale === "ar"
              ? "لا توجد مقالات منشورة في الوقت الحالي."
              : "No published articles are available yet."}
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
