import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleByLocaleAndSlug } from "@/actions/article";
import ReaderPanel from "@/components/ReaderPanel";

type ArticleDetailPageProps = {
  params: {
    locale: string;
    slug: string;
  };
};

export async function generateMetadata({ params }: ArticleDetailPageProps): Promise<Metadata> {
  const article = await getArticleByLocaleAndSlug(params.locale, params.slug);

  if (!article && params.locale !== "ar") {
    return {
      title: "Translation not available",
      robots: "noindex",
      description: "This article is not yet available in the selected language.",
    };
  }

  if (!article) {
    return {
      title: "Article not found",
      description: "The requested article could not be found.",
    };
  }

  return {
    title: article.title,
    description: article.content.slice(0, 140),
  };
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { locale, slug } = params;
  const article = await getArticleByLocaleAndSlug(locale, slug);

  if (!article && locale === "ar") {
    notFound();
  }

  if (!article) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-border/80 bg-card p-10 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/90">
            {locale === "ar" ? "غير متوفر" : "Not Available"}
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {locale === "ar"
              ? "المقال غير متوفر بعد بهذه اللغة"
              : "Not yet available in this language"}
          </h1>
          <p className="mt-4 text-base leading-7 text-foreground/75">
            {locale === "ar"
              ? "يرجى التحقق مرة أخرى لاحقًا أو اختيار لغة أخرى لعرض المحتوى المتاح."
              : "Please check back later or switch to another language to view available content."}
          </p>
        </section>
      </main>
    );
  }

  return (
    <ReaderPanel locale={locale}>
      <main className="mx-auto max-w-5xl px-0 py-0 sm:px-0 lg:px-0">
        <article className="space-y-8">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/70">
              <span className="rounded-full bg-foreground/5 px-3 py-1">{article.locale.toUpperCase()}</span>
              <span className="rounded-full bg-foreground/5 px-3 py-1">{article.category?.name ?? "General"}</span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {article.title}
            </h1>
            <p className="text-sm text-foreground/60">
              {new Date(article.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </header>

          <div className="rounded-[2rem] border border-black/10 bg-white/60 p-8 shadow-sm backdrop-blur-sm">
            <p className="whitespace-pre-line text-lg leading-9 text-start">
              {article.content}
            </p>
          </div>
        </article>
      </main>
    </ReaderPanel>
  );
}
