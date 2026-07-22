"use server";

import db from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export type CreateEditorialInput = {
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  content: string;
  locale: string;
  categoryId?: string | null;
  status?: "DRAFT" | "PENDING" | "PUBLISHED";
  audioUrl?: string | null;
};

export async function createArticleAsAuthor(data: CreateEditorialInput) {
  const session = await getServerSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const role = String(session.user.role ?? "").toUpperCase();
  const canPublish = session.user.canPublish === true;

  if (!(role === "ADMIN" || canPublish === true)) {
    throw new Error("Insufficient permissions");
  }

  const now = new Date();
  const published = data.status === "PUBLISHED";
  const publishedAt = published ? now : null;

  const created = await db.article.create({
    data: {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      coverImage: data.coverImage,
      content: data.content,
      audioUrl: data.audioUrl ?? null,
      published,
      status: data.status ?? "DRAFT",
      publishedAt: publishedAt ?? undefined,
      locale: data.locale,
      author: { connect: { id: session.user.id } },
    },
  });

  return created;
}
