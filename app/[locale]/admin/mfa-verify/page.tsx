import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import MfaVerifyForm from "@/components/MfaVerifyForm";
import type { Locale } from "@/lib/locale";

export const dynamic = "force-dynamic";

type MfaVerifyPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string }>;
};

export async function generateMetadata({
  params,
}: MfaVerifyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "MfaVerify.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function MfaVerifyPage({
  params,
  searchParams,
}: MfaVerifyPageProps) {
  const { locale } = await params;
  const { callbackUrl } = await searchParams;
  const typedLocale = locale as Locale;

  setRequestLocale(typedLocale);

  const t = await getTranslations("MfaVerify");

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-base leading-7 text-foreground/75">
            {t("description")}
          </p>
        </div>

        <MfaVerifyForm
          callbackUrl={callbackUrl}
          locale={typedLocale}
        />
      </div>
    </main>
  );
}
