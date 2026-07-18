"use server";

import db from "@/lib/db";
import { requireAdminOrEditor } from "./auth";

export type CreateSeriesInput = {
  title: string;
  slug: string;
  locale: string;
  description?: string | null;
};

export type UpdateSeriesInput = {
  title?: string;
  slug?: string;
  locale?: string;
  description?: string | null;
};

export async function createSeries(data: CreateSeriesInput) {
  await requireAdminOrEditor();

  return db.series.create({
    data: {
      title: data.title,
      slug: data.slug,
      locale: data.locale,
      description: data.description,
    },
  });
}

export async function getSeriesById(id: string) {
  await requireAdminOrEditor();

  return db.series.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      articles: true,
    },
  });
}

export async function getSeriesList(locale?: string) {
  await requireAdminOrEditor();

  return db.series.findMany({
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

export async function updateSeries(id: string, data: UpdateSeriesInput) {
  await requireAdminOrEditor();

  const existing = await db.series.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Series not found");
  }

  return db.series.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      locale: data.locale,
      description: data.description,
    },
  });
}

export async function deleteSeries(id: string) {
  await requireAdminOrEditor();

  const existing = await db.series.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!existing) {
    throw new Error("Series not found");
  }

  return db.series.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}
