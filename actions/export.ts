"use server";

import db from "@/lib/db";
import { createAuditLogEntry } from "@/lib/audit";
import { getServerSession } from "@/lib/auth";

const MFA_WINDOW_MS = 15 * 60 * 1000;

export type DatabaseExportResult = {
  fileName: string;
  jsonBundle: string;
  csvSummary: string;
};

function formatCsvSummary(rows: Record<string, number>): string {
  const header = "entity,count";
  const lines = Object.entries(rows).map(([entity, count]) => `${entity},${count}`);
  return [header, ...lines].join("\n");
}

export async function exportDatabase(): Promise<DatabaseExportResult> {
  const session = await getServerSession();
  const role = String(session?.user?.role ?? "").toUpperCase();
  const mfaVerifiedAt = session?.mfaVerifiedAt;

  if (role !== "ADMIN" || !mfaVerifiedAt) {
    throw new Error("Unauthorized");
  }

  const timeSinceMfa = Date.now() - new Date(mfaVerifiedAt).getTime();
  if (timeSinceMfa > MFA_WINDOW_MS) {
    throw new Error("MFA verification is required again for export");
  }

  const [users, sessions, clientRequests, documents, articles, categories, tags, series, comments, redirectRules] =
    await Promise.all([
      db.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          image: true,
          twoFactorEnabled: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.session.findMany({
        select: {
          id: true,
          userId: true,
          expires: true,
          mfaVerifiedAt: true,
        },
      }),
      db.clientRequest.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
        },
      }),
      db.document.findMany({
        select: {
          id: true,
          storagePath: true,
          originalName: true,
          mimeType: true,
          size: true,
          createdAt: true,
          requestId: true,
          userId: true,
        },
      }),
      db.article.findMany({
        select: {
          id: true,
          title: true,
          slug: true,
          content: true,
          published: true,
          locale: true,
          translationGroupId: true,
          normalizedTitle: true,
          normalizedDescription: true,
          normalizedContent: true,
          categoryId: true,
          seriesId: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      db.category.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          locale: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      db.tag.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          locale: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      db.series.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          slug: true,
          locale: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      db.comment.findMany({
        select: {
          id: true,
          content: true,
          status: true,
          articleId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      db.redirectRule.findMany({
        select: {
          id: true,
          oldSlug: true,
          newSlug: true,
          locale: true,
          createdAt: true,
        },
      }),
    ]);

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    exportedBy: session.user?.id ?? null,
    counts: {
      users: users.length,
      sessions: sessions.length,
      clientRequests: clientRequests.length,
      documents: documents.length,
      articles: articles.length,
      categories: categories.length,
      tags: tags.length,
      series: series.length,
      comments: comments.length,
      redirectRules: redirectRules.length,
    },
    data: {
      users,
      sessions,
      clientRequests,
      documents,
      articles,
      categories,
      tags,
      series,
      comments,
      redirectRules,
    },
  };

  await createAuditLogEntry({
    userId: session.user?.id ?? null,
    action: "EXPORT_DATABASE",
    entity: "AuditLogEntry",
    entityId: null,
    beforeState: null,
    afterState: {
      exportedAt: exportPayload.exportedAt,
      counts: exportPayload.counts,
    },
  });

  const jsonBundle = JSON.stringify(exportPayload, null, 2);
  const csvSummary = formatCsvSummary(exportPayload.counts);
  const fileName = `database-export-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

  return {
    fileName,
    jsonBundle,
    csvSummary,
  };
}
