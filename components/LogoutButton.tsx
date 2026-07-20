"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";

import { logout } from "@/actions/auth";
import type { Locale } from "@/lib/locale";

type LogoutButtonProps = {
  locale: Locale;
  className?: string;
};

export default function LogoutButton({ locale, className }: LogoutButtonProps) {
  const t = useTranslations("Common");
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logout(locale);
      } catch {
        window.location.assign(`/${locale}/login`);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={className ?? "inline-flex items-center rounded-full border border-white/10 px-4 py-2 text-sm font-medium text-foreground/80 transition hover:border-foreground/30 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-70"}
    >
      {isPending ? t("signingOut") : t("logout")}
    </button>
  );
}
