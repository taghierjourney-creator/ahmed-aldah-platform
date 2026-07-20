"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

import { requestLoginLink } from "@/actions/auth";
import type { Locale } from "@/lib/locale";

type LoginFormProps = {
  locale: Locale;
  serverError?: string | null;
};

export default function LoginForm({ locale, serverError }: LoginFormProps) {
  const t = useTranslations("Login");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(serverError ?? null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsPending(true);

    try {
      await requestLoginLink(email.trim(), locale);
      setSuccessMessage(t("states.linkSent"));
    } catch {
      setError(t("errors.authFailed"));
    } finally {
      setIsPending(false);
    }
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

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="space-y-4">
        <label htmlFor="login-email" className="block text-sm font-medium text-foreground">
          {t("form.emailLabel")}
        </label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("form.emailPlaceholder")}
          disabled={isPending}
          required
          className="w-full rounded-[1.25rem] border border-foreground/10 bg-background px-4 py-3 text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/30"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !email.trim()}
        className="flex w-full items-center justify-center gap-3 rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? (
          <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-background/70 border-t-transparent" />
        ) : null}
        {isPending ? t("states.sendingLink") : t("actions.sendLoginLink")}
      </button>

      <p className="text-xs leading-6 text-foreground/60">
        {t("support")}
      </p>
    </form>
  );
}
