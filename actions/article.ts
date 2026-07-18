"use server";

import type { Prisma } from "@prisma/client";
import db from "@/lib/db";
import { normalizeArabic } from "@/lib/arabic-normalizer";
import { requireAdminOrEditor } from "./auth";

export type CreateArticleInput = {
  title: string;
  slug: string;
  content: string;
  locale: string;
  translationGroupId?: string;
  published?: boolean;
  categoryId?: string | null;
  seriesId?: string | null;
  tagIds?: string[];
};

export type UpdateArticleInput = {
  title?: string;
  slug?: string;
  content?: string;
  locale?: string;
  translationGroupId?: string;
  published?: boolean;
  categoryId?: string | null;
  seriesId?: string | null;
  tagIds?: string[];
};

export type ArticleFilter = {
  locale?: string;
  translationGroupId?: string;
  categoryId?: string;
  seriesId?: string;
  tagId?: string;
  published?: boolean;
};

export async function createArticle(data: CreateArticleInput) {
  await requireAdminOrEditor();

  const translationGroupId = data.translationGroupId ?? crypto.randomUUID();
  const normalizedTitle = normalizeArabic(data.title);
  const normalizedDescription = normalizeArabic(data.content.slice(0, 240));
  const normalizedContent = normalizeArabic(data.content);
  const createData: Prisma.ArticleCreateInput = {
    title: data.title,
    slug: data.slug,
    content: data.content,
    locale: data.locale,
    translationGroupId,
    published: data.published ?? false,
    normalizedTitle,
    normalizedDescription,
    normalizedContent,
    category: data.categoryId
      ? {
          connect: { id: data.categoryId },
        }
      : undefined,
    series: data.seriesId
      ? {
          connect: { id: data.seriesId },
        }
      : undefined,
    tags:
      data.tagIds?.length
        ? {
            connect: data.tagIds.map((id) => ({ id })),
          }
        : undefined,
  };

  return db.article.create({
    data: createData,
    include: {
      tags: true,
      category: true,
      series: true,
    },
  });
}

export async function getArticleById(id: string) {
  await requireAdminOrEditor();

  return db.article.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      tags: true,
      category: true,
      series: true,
    },
  });
}

export async function getArticleByLocaleAndSlug(locale: string, slug: string) {
  await requireAdminOrEditor();

  return db.article.findFirst({
    where: {
      locale,
      slug,
      deletedAt: null,
    },
    include: {
      tags: true,
      category: true,
      series: true,
    },
  });
}

export async function getArticles(filter: ArticleFilter = {}) {
  await requireAdminOrEditor();

  const where: Prisma.ArticleWhereInput = {
    deletedAt: null,
    ...(filter.locale ? { locale: filter.locale } : {}),
    ...(filter.translationGroupId ? { translationGroupId: filter.translationGroupId } : {}),
    ...(filter.categoryId ? { categoryId: filter.categoryId } : {}),
    ...(filter.seriesId ? { seriesId: filter.seriesId } : {}),
    ...(filter.published !== undefined ? { published: filter.published } : {}),
    ...(filter.tagId
      ? {
          tags: {
            some: {
              id: filter.tagId,
            },
          },
        }
      : {}),
  };

  return db.article.findMany({
    where,
    include: {
      tags: true,
      category: true,
      series: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function updateArticle(id: string, data: UpdateArticleInput) {
  await requireAdminOrEditor();

  const existing = await db.article.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Article not found");
  }

  const normalizedTitle = normalizeArabic(data.title ?? existing.title);
  const normalizedDescription = normalizeArabic((data.content ?? existing.content).slice(0, 240));
  const normalizedContent = normalizeArabic(data.content ?? existing.content);
  const updateData: Prisma.ArticleUpdateInput = {
    title: data.title,
    slug: data.slug,
    content: data.content,
    locale: data.locale,
    translationGroupId: data.translationGroupId ?? existing.translationGroupId,
    published: data.published,
    normalizedTitle,
    normalizedDescription,
    normalizedContent,
    category:
      data.categoryId === null
        ? { disconnect: true }
        : data.categoryId
        ? { connect: { id: data.categoryId } }
        : undefined,
    series:
      data.seriesId === null
        ? { disconnect: true }
        : data.seriesId
        ? { connect: { id: data.seriesId } }
        : undefined,
    tags: data.tagIds
      ? {
          set: data.tagIds.map((id) => ({ id })),
        }
      : undefined,
  };

  return db.article.update({
    where: { id },
    data: updateData,
    include: {
      tags: true,
      category: true,
      series: true,
    },
  });
}

export async function deleteArticle(id: string) {
  await requireAdminOrEditor();

  const existing = await db.article.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Article not found");
  }

  return db.article.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}
