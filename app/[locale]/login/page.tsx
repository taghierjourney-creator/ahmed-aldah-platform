import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import LoginForm from "@/components/LoginForm";
import { verifyLoginToken } from "@/actions/auth";
import { getServerSession } from "@/lib/auth";
import type { Locale } from "@/lib/locale";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: { token?: string };
};

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Login.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LoginPage({ params, searchParams }: LoginPageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  setRequestLocale(typedLocale);

  const session = await getServerSession();
  const role = String(session?.user?.role ?? "").toUpperCase();

  if (session?.user) {
    if (role === "ADMIN") {
      if (session.mfaVerifiedAt) {
        redirect(`/${locale}/admin`);
      }

      redirect(`/${locale}/admin/mfa-verify?callbackUrl=/${locale}/admin`);
    }

    redirect(`/${locale}/portal`);
  }

  let loginFormError: string | null = null;
  const token = searchParams?.token;

  if (token) {
    try {
      const redirectUrl = await verifyLoginToken(token, typedLocale);
      redirect(redirectUrl);
    } catch {
      loginFormError = "Unable to verify this login link. Please request a new sign-in link.";
    }
  }

  const t = await getTranslations("Login");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_60%)] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <section className="max-w-2xl space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/60">
            {t("eyebrow")}
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="max-w-xl text-lg leading-8 text-foreground/70">
            {t("hero.description")}
          </p>
          <div className="rounded-[2rem] border border-foreground/10 bg-card/70 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/60">
              {t("security.title")}
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-foreground/70">
              <li>• {t("security.items.mfa")}</li>
              <li>• {t("security.items.session")}</li>
              <li>• {t("security.items.access")}</li>
            </ul>
          </div>
        </section>

        <div className="w-full max-w-md">
          <LoginForm locale={typedLocale} serverError={loginFormError} />
        </div>
      </div>
    </main>
  );
}
