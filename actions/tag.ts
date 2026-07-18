"use server";

import db from "@/lib/db";
import { requireAdminOrEditor } from "./auth";

export type CreateTagInput = {
  name: string;
  slug: string;
  locale: string;
};

export type UpdateTagInput = {
  name?: string;
  slug?: string;
  locale?: string;
};

export async function createTag(data: CreateTagInput) {
  await requireAdminOrEditor();

  return db.tag.create({
    data: {
      name: data.name,
      slug: data.slug,
      locale: data.locale,
    },
  });
}

export async function getTagById(id: string) {
  await requireAdminOrEditor();

  return db.tag.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      articles: true,
    },
  });
}

export async function getTags(locale?: string) {
  await requireAdminOrEditor();

  return db.tag.findMany({
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

export async function updateTag(id: string, data: UpdateTagInput) {
  await requireAdminOrEditor();

  const existing = await db.tag.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Tag not found");
  }

  return db.tag.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      locale: data.locale,
    },
  });
}

export async function deleteTag(id: string) {
  await requireAdminOrEditor();

  const existing = await db.tag.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Tag not found");
  }

  return db.tag.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}
