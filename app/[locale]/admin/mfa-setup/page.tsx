import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth";
import MfaSetupForm from "@/components/MfaSetupForm";
import type { Locale } from "@/lib/locale";

export const dynamic = "force-dynamic";

type MfaSetupPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: MfaSetupPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "MfaSetup.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function MfaSetupPage({ params }: MfaSetupPageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  setRequestLocale(typedLocale);

  const session = await getServerSession();
  const role = String(session?.user?.role ?? "").toUpperCase();

  if (role !== "ADMIN") {
    redirect(`/${locale}/`);
  }

  const userEmail = session?.user?.email;
  if (!userEmail) {
    redirect(`/${locale}/`);
  }

  const t = await getTranslations("MfaSetup");

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

        <MfaSetupForm
          locale={typedLocale}
        />
      </div>
    </main>
  );
}
