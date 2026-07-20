"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";

import type { Locale } from "@/lib/locale";

type LoginFormProps = {
  locale: Locale;
};

export default function LoginForm({ locale }: LoginFormProps) {
  const t = useTranslations("Login");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const result = await signIn("github", {
          callbackUrl: `/${locale}/portal`,
          redirect: false,
        });

        if (result?.error) {
          setError(t("errors.authFailed"));
          return;
        }

        if (result?.url) {
          window.location.assign(result.url);
          return;
        }

        setError(t("errors.authFailed"));
      } catch {
        setError(t("errors.authFailed"));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-white/10 bg-card/90 p-8 shadow-2xl shadow-black/20 backdrop-blur">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/60">
          {t("eyebrow")}
        </p>
        <h2 className="text-2xl font-semibold text-foreground">
          {t("title")}
        </h2>
        <p className="text-sm leading-7 text-foreground/70">
          {t("description")}
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-3 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? (
          <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-background/70 border-t-transparent" />
        ) : null}
        {isPending ? t("states.signingIn") : t("actions.signInWithGithub")}
      </button>

      <p className="text-xs leading-6 text-foreground/60">
        {t("support")}
      </p>
    </form>
  );
}
