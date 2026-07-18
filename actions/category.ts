"use server";

import db from "@/lib/db";
import { requireAdminOrEditor } from "./auth";

export type CreateCategoryInput = {
  name: string;
  slug: string;
  locale: string;
};

export type UpdateCategoryInput = {
  name?: string;
  slug?: string;
  locale?: string;
};

export async function createCategory(data: CreateCategoryInput) {
  await requireAdminOrEditor();

  return db.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      locale: data.locale,
    },
  });
}

export async function getCategoryById(id: string) {
  await requireAdminOrEditor();

  return db.category.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      articles: true,
    },
  });
}

export async function getCategories(locale?: string) {
  await requireAdminOrEditor();

  return db.category.findMany({
    where: {
      deletedAt: null,
      ...(locale ? { locale } : {}),
    },
    include: {
      articles: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function updateCategory(id: string, data: UpdateCategoryInput) {
  await requireAdminOrEditor();

  const existing = await db.category.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Category not found");
  }

  return db.category.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      locale: data.locale,
    },
  });
}

export async function deleteCategory(id: string) {
  await requireAdminOrEditor();

  const existing = await db.category.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Category not found");
  }

  return db.category.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}
