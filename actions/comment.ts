"use server";

import { CommentStatus } from "@prisma/client";

import { getServerSession } from "@/lib/auth";
import db from "@/lib/db";

const ADMIN_MODERATOR_ROLES = new Set(["ADMIN", "MODERATOR"]);

const CONTENT_LIMITS = {
  min: 3,
  max: 2000,
} as const;

export type SubmitCommentInput = {
  articleId: string;
  content: string;
};

export type SubmitCommentResult =
  | { success: true }
  | {
      success: false;
      errorCode: "validation" | "article_not_found" | "unknown";
    };

export type ModerationAction = "APPROVE" | "REJECT" | "SPAM";

export type ModerateCommentResult =
  | { success: true }
  | {
      success: false;
      errorCode: "unauthorized" | "not_found" | "unknown";
    };

function sanitizeCommentContent(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<[^>]*>/g, "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, CONTENT_LIMITS.max);
}

function validateCommentContent(content: string): string | null {
  const sanitized = sanitizeCommentContent(content);

  if (!sanitized) {
    return null;
  }

  if (sanitized.length < CONTENT_LIMITS.min) {
    return null;
  }

  return sanitized;
}

const moderationStatusMap: Record<ModerationAction, CommentStatus> = {
  APPROVE: CommentStatus.APPROVED,
  REJECT: CommentStatus.REJECTED,
  SPAM: CommentStatus.SPAM,
};

export async function submitComment(input: SubmitCommentInput): Promise<SubmitCommentResult> {
  const articleId = input.articleId?.trim();

  if (!articleId) {
    return { success: false, errorCode: "validation" };
  }

  const content = validateCommentContent(input.content ?? "");

  if (!content) {
    return { success: false, errorCode: "validation" };
  }

  const article = await db.article.findFirst({
    where: {
      id: articleId,
      deletedAt: null,
      published: true,
    },
    select: { id: true },
  });

  if (!article) {
    return { success: false, errorCode: "article_not_found" };
  }

  try {
    await db.comment.create({
      data: {
        articleId: article.id,
        content,
        status: CommentStatus.PENDING,
      },
    });

    return { success: true };
  } catch {
    return { success: false, errorCode: "unknown" };
  }
}

export async function moderateComment(
  commentId: string,
  action: ModerationAction,
): Promise<ModerateCommentResult> {
  const session = await getServerSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = String((session?.user as any)?.role ?? "").toUpperCase();

  if (!ADMIN_MODERATOR_ROLES.has(role)) {
    return { success: false, errorCode: "unauthorized" };
  }

  const normalizedCommentId = commentId?.trim();

  if (!normalizedCommentId || !moderationStatusMap[action]) {
    return { success: false, errorCode: "not_found" };
  }

  const existing = await db.comment.findUnique({
    where: { id: normalizedCommentId },
    select: { id: true },
  });

  if (!existing) {
    return { success: false, errorCode: "not_found" };
  }

  try {
    await db.comment.update({
      where: { id: normalizedCommentId },
      data: {
        status: moderationStatusMap[action],
      },
    });

    return { success: true };
  } catch {
    return { success: false, errorCode: "unknown" };
  }
}

export async function getApprovedCommentsForArticle(articleId: string) {
  return db.comment.findMany({
    where: {
      articleId,
      status: CommentStatus.APPROVED,
    },
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
    },
  });
}

export async function getPendingCommentsForModeration() {
  return db.comment.findMany({
    where: {
      status: CommentStatus.PENDING,
    },
    include: {
      article: {
        select: {
          title: true,
          slug: true,
          locale: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}
