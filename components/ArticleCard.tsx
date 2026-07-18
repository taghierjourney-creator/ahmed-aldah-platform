import Image from "next/image";
import Link from "next/link";
import type { Article } from "@prisma/client";

const placeholderImageSrc =
  "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoEAAQAAAc0JaQAA3AA/vuUAAA=";

type ArticleCardProps = {
  article: Article & {
    category?: { name: string } | null;
    tags: { name: string; locale: string }[];
  };
};

export default function ArticleCard({ article }: ArticleCardProps) {
  const excerpt = article.content.length > 140 ? `${article.content.slice(0, 140)}…` : article.content;
  const publishedAt = article.createdAt.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article className="group rounded-3xl border border-border/80 bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/${article.locale}/blog/${article.slug}`} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70">
        <div className="mb-5 overflow-hidden rounded-3xl bg-slate-200">
          <Image
            src={placeholderImageSrc}
            alt="Article illustration"
            width={640}
            height={360}
            className="h-48 w-full object-cover"
            placeholder="blur"
            blurDataURL={placeholderImageSrc}
            priority={false}
          />
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-sm text-foreground/70">
            {article.category?.name ? (
              <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-foreground/90">
                {article.category.name}
              </span>
            ) : null}
            <span className="rounded-full bg-foreground/5 px-3 py-1 text-xs font-medium text-foreground/90">
              {article.locale.toUpperCase()}
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground transition group-hover:text-primary">
              {article.title}
            </h2>
            <p className="text-sm leading-6 text-foreground/75">{excerpt}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/60">
            <span>{publishedAt}</span>
            {article.tags.length > 0
              ? article.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.name}
                    className="rounded-full bg-foreground/5 px-2.5 py-1"
                  >
                    {tag.name}
                  </span>
                ))
              : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
