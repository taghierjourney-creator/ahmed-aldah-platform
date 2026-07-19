"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { moderateComment, type ModerationAction } from "@/actions/comment";

export type ModerationComment = {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  article: {
    title: string;
    slug: string;
    locale: string;
  };
};

type CommentModerationTableProps = {
  comments: ModerationComment[];
};

export default function CommentModerationTable({ comments }: CommentModerationTableProps) {
  const t = useTranslations("CommentModeration");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAction = (commentId: string, action: ModerationAction) => {
    startTransition(async () => {
      const result = await moderateComment(commentId, action);

      if (result.success) {
        router.refresh();
      }
    });
  };

  if (comments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-foreground/15 bg-card/50 px-6 py-10 text-center text-sm text-foreground/70">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-foreground/10 bg-card shadow-sm">
      <table className="min-w-full divide-y divide-foreground/10 text-start">
        <thead className="bg-foreground/[0.03]">
          <tr>
            <th scope="col" className="px-4 py-3 text-sm font-semibold text-foreground">
              {t("table.comment")}
            </th>
            <th scope="col" className="px-4 py-3 text-sm font-semibold text-foreground">
              {t("table.article")}
            </th>
            <th scope="col" className="px-4 py-3 text-sm font-semibold text-foreground">
              {t("table.date")}
            </th>
            <th scope="col" className="px-4 py-3 text-sm font-semibold text-foreground">
              {t("table.status")}
            </th>
            <th scope="col" className="px-4 py-3 text-sm font-semibold text-foreground">
              {t("table.actions")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-foreground/10">
          {comments.map((comment) => (
            <tr key={comment.id} className="align-top">
              <td className="max-w-sm px-4 py-4 text-sm leading-7 text-foreground">
                <p className="whitespace-pre-line">{comment.content}</p>
              </td>
              <td className="px-4 py-4 text-sm text-foreground/80">
                <p className="font-medium text-foreground">{comment.article.title}</p>
                <p className="mt-1 text-xs text-foreground/60">
                  {comment.article.locale}/{comment.article.slug}
                </p>
              </td>
              <td className="px-4 py-4 text-sm text-foreground/70">
                {new Date(comment.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-4 text-sm text-foreground/70">{comment.status}</td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAction(comment.id, "APPROVE")}
                    className="rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-800 disabled:opacity-60"
                  >
                    {t("actions.approve")}
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAction(comment.id, "REJECT")}
                    className="rounded-full px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-foreground/15 transition hover:bg-foreground/5 disabled:opacity-60"
                  >
                    {t("actions.reject")}
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAction(comment.id, "SPAM")}
                    className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    {t("actions.spam")}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
