"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { verifyMfaCode } from "@/actions/auth";
import type { Locale } from "@/lib/locale";

type MfaVerifyFormProps = {
  callbackUrl?: string;
  locale: Locale;
};

export default function MfaVerifyForm({
  callbackUrl,
  locale,
}: MfaVerifyFormProps) {
  const router = useRouter();
  const t = useTranslations("MfaVerify");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (token.trim().length !== 6) {
        setError(t("form.invalidTokenFormat"));
        setIsSubmitting(false);
        return;
      }

      await verifyMfaCode(token);
      
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.push(`/${locale}/admin/comments`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to verify TOTP code",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="token"
          className="block text-sm font-medium text-foreground"
        >
          {t("form.label")}
        </label>
        <input
          id="token"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          value={token}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
            setToken(val);
          }}
          placeholder="000000"
          disabled={isSubmitting}
          autoFocus
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/30 disabled:opacity-50 text-center text-lg tracking-widest"
        />
        <p className="text-xs text-foreground/60">{t("form.hint")}</p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || token.length !== 6}
        className="w-full px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting ? t("form.verifying") : t("form.verify")}
      </button>
    </form>
  );
}
