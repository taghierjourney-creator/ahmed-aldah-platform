"use server";

import db from "@/lib/db";
import { sanitizeHtml } from "@/lib/sanitize";
import { requireAdminOrEditor } from "@/actions/auth";

// Version payload shape stored in ArticleVersion.content (JSON)
export type VersionContent = {
  html: string;
};

export async function autoSaveVersion(articleId: string, locale: string, rawHtml: string) {
  await requireAdminOrEditor();

  const normalizedId = String(articleId).trim();
  if (!normalizedId) throw new Error("Invalid article id");

  const article = await db.article.findUnique({ where: { id: normalizedId }, select: { id: true, locale: true } });
  if (!article) throw new Error("Article not found");

  if (String(article.locale) !== String(locale)) {
    // Enforce locale-scoped versions
    throw new Error("Locale mismatch");
  }

  // sanitize server-side
  const safe = sanitizeHtml(rawHtml);

  const last = await db.articleVersion.findFirst({
    where: { articleId: normalizedId, locale },
    orderBy: { versionNumber: "desc" },
    select: { versionNumber: true },
  });

  const nextVersion = (last?.versionNumber ?? 0) + 1;

  await db.articleVersion.create({
    data: {
      articleId: normalizedId,
      locale,
      content: { html: safe },
      versionNumber: nextVersion,
    },
  });

  return { success: true, version: nextVersion } as const;
}

export async function listVersions(articleId: string) {
  await requireAdminOrEditor();

  const normalizedId = String(articleId).trim();
  if (!normalizedId) throw new Error("Invalid article id");

  const versions = await db.articleVersion.findMany({
    where: { articleId: normalizedId },
    orderBy: { versionNumber: "desc" },
    select: {
      id: true,
      savedAt: true,
      versionNumber: true,
      locale: true,
    },
  });

  return versions;
}

export async function restoreVersion(versionId: string) {
  await requireAdminOrEditor();

  const normalized = String(versionId).trim();
  if (!normalized) throw new Error("Invalid version id");

  const version = await db.articleVersion.findUnique({ where: { id: normalized } });
  if (!version) throw new Error("Version not found");

  // load the article row - ensure we only update that specific article row
  const article = await db.article.findUnique({ where: { id: version.articleId }, select: { id: true, locale: true, translationGroupId: true } });
  if (!article) throw new Error("Article not found");

  if (article.locale !== version.locale) {
    // Defensive: mismatched locales should never be restored across locales
    throw new Error("Locale mismatch during restore");
  }

  // content stored as JSON { html }
  // extract html value from Json safely
  const contentVal = version.content;
  let contentHtml = "";
  if (typeof contentVal === "object" && contentVal !== null) {
    const obj = contentVal as Record<string, unknown>;
    const htmlCandidate = obj["html"];
    if (typeof htmlCandidate === "string") {
      contentHtml = htmlCandidate;
    }
  }

  // server-side sanitize again before persisting
  const safe = sanitizeHtml(String(contentHtml));

  // Update only this article row (locale-scoped), do NOT touch other translations under same translationGroupId
  await db.article.update({
    where: { id: article.id },
    data: {
      content: safe,
      updatedAt: new Date(),
    },
  });

  // create a new version to record the restore action
  const last = await db.articleVersion.findFirst({ where: { articleId: article.id, locale: article.locale }, orderBy: { versionNumber: "desc" }, select: { versionNumber: true } });
  const nextVersion = (last?.versionNumber ?? 0) + 1;

  await db.articleVersion.create({
    data: {
      articleId: article.id,
      locale: article.locale,
      content: { html: safe },
      versionNumber: nextVersion,
    },
  });

  return { success: true } as const;
}
