"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";

import { submitComment, type SubmitCommentResult } from "@/actions/comment";

export type ApprovedComment = {
  id: string;
  content: string;
  createdAt: string;
};

type ArticleCommentSectionProps = {
  articleId: string;
  initialComments: ApprovedComment[];
};

type FeedbackState = "success" | "error" | "validation" | null;

export default function ArticleCommentSection({
  articleId,
  initialComments,
}: ArticleCommentSectionProps) {
  const t = useTranslations("Comments");
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [isPending, startTransition] = useTransition();

  const inputClassName = useMemo(
    () =>
      "w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-start text-base text-foreground shadow-sm outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60",
    [],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const trimmed = content.trim();

    if (trimmed.length < 3) {
      setFeedback("validation");
      return;
    }

    startTransition(async () => {
      let result: SubmitCommentResult;

      try {
        result = await submitComment({
          articleId,
          content: trimmed,
        });
      } catch {
        setFeedback("error");
        return;
      }

      if (result.success) {
        setContent("");
        setFeedback("success");
        return;
      }

      if (result.errorCode === "validation") {
        setFeedback("validation");
        return;
      }

      setFeedback("error");
    });
  };

  const feedbackMessage =
    feedback === "success"
      ? t("success")
      : feedback === "validation"
        ? t("errors.validation")
        : feedback === "error"
          ? t("errors.generic")
          : null;

  return (
    <section className="mt-12 space-y-8 border-t border-foreground/10 pt-10">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">{t("title")}</h2>
        <p className="text-sm text-foreground/70">{t("description")}</p>
      </div>

      {comments.length > 0 ? (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-2xl border border-foreground/10 bg-card/80 p-5 shadow-sm"
            >
              <p className="whitespace-pre-line text-base leading-8 text-foreground">{comment.content}</p>
              <p className="mt-3 text-xs text-foreground/60">
                {new Date(comment.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-foreground/15 bg-card/50 px-4 py-6 text-sm text-foreground/70">
          {t("empty")}
        </p>
      )}

      {feedbackMessage ? (
        <div
          role="status"
          aria-live="polite"
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback === "success"
              ? "border-emerald-600/30 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "border-red-500/30 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-200"
          }`}
        >
          {feedbackMessage}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="article-comment" className="mb-2 block text-sm font-medium text-foreground">
            {t("placeholder")}
          </label>
          <textarea
            id="article-comment"
            name="comment"
            rows={4}
            value={content}
            disabled={isPending}
            onChange={(event) => {
              setContent(event.target.value);
              if (feedback) {
                setFeedback(null);
              }
            }}
            placeholder={t("placeholder")}
            aria-label={t("placeholder")}
            className={`${inputClassName} min-h-[7rem] resize-y`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? t("submitting") : t("submit")}
          </button>
          {isPending ? (
            <p className="text-sm text-foreground/70" role="status" aria-live="polite">
              {t("loading")}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
