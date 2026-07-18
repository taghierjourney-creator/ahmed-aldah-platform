"use server";

import db from "@/lib/db";
import { normalizeArabic } from "@/lib/arabic-normalizer";

export type SearchResult = {
  id: string;
  title: string;
  description: string;
  slug: string;
  locale: string;
};

export async function searchArticles(query: string): Promise<SearchResult[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  const normalizedQuery = normalizeArabic(trimmedQuery).trim();
  if (!normalizedQuery) {
    return [];
  }

  try {
    const articles = await db.article.findMany({
      where: {
        deletedAt: null,
        published: true,
        OR: [
          {
            normalizedTitle: {
              contains: normalizedQuery,
              mode: "insensitive",
            },
          },
          {
            normalizedDescription: {
              contains: normalizedQuery,
              mode: "insensitive",
            },
          },
          {
            normalizedContent: {
              contains: normalizedQuery,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        locale: true,
        content: true,
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });

    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      description: article.content.slice(0, 160).replace(/\s+/g, " ").trim(),
      slug: article.slug,
      locale: article.locale,
    }));
  } catch {
    return [];
  }
}
