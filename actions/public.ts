"use server";

import db from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function getPublishedArticles(locale?: string) {
  const where: Prisma.ArticleWhereInput = {
    deletedAt: null,
    published: true,
    status: "PUBLISHED",
  };

  if (locale) where.locale = locale;

  return db.article.findMany({
    where,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      publishedAt: true,
      author: {
        select: { id: true, name: true, avatar: true },
      },
      audioUrl: true,
    },
    orderBy: { publishedAt: "desc" },
    take: 12,
  });
}

export async function getFeaturedArticle(locale?: string) {
  const where: Prisma.ArticleWhereInput = { deletedAt: null, published: true, status: "PUBLISHED" };
  if (locale) where.locale = locale;

  const article = await db.article.findFirst({
    where,
    include: {
      author: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  return article;
}
