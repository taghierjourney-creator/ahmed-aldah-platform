"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { generateMfaSecret, verifyMfaSetup } from "@/actions/auth";
import type { Locale } from "@/lib/locale";

type MfaSetupFormProps = {
  locale: Locale;
};

export default function MfaSetupForm({
  locale,
}: MfaSetupFormProps) {
  const router = useRouter();
  const t = useTranslations("MfaSetup");
  const [isPending, startTransition] = useTransition();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [manualEntry, setManualEntry] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerateSecret = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await generateMfaSecret();
        setQrCode(result.qrCode);
        setManualEntry(result.manualEntry);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate secret",
        );
      }
    });
  };

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (token.trim().length !== 6) {
        setError(t("form.invalidTokenFormat"));
        setIsSubmitting(false);
        return;
      }

      await verifyMfaSetup(token);
      router.push(`/${locale}/admin/comments`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to verify TOTP code",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!qrCode ? (
        <button
          onClick={handleGenerateSecret}
          disabled={isPending}
          className="w-full px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? t("form.generatingSecret") : t("form.generateSecret")}
        </button>
      ) : (
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">
                {t("form.scanQrCode")}
              </h3>
              <p className="text-sm text-foreground/75">{t("form.qrDescription")}</p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center p-4 bg-background rounded-lg">
              {qrCode && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrCode}
                  alt="QR Code"
                  width={300}
                  height={300}
                  className="rounded-lg"
                />
              )}
            </div>

            {/* Manual Entry */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                {t("form.manualEntry")}
              </h4>
              <div className="bg-background p-3 rounded-lg font-mono text-sm text-foreground/75 break-all">
                {manualEntry}
              </div>
            </div>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="token" className="block text-sm font-medium text-foreground">
                {t("form.enterCode")}
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
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-foreground/30 disabled:opacity-50"
              />
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
              {isSubmitting ? t("form.verifying") : t("form.verifyCode")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
