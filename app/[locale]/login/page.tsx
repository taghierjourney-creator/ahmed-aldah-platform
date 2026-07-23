import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import LoginForm from "@/components/LoginForm";
import type { Locale } from "@/lib/locale";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Login.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  setRequestLocale(typedLocale);
  const t = await getTranslations("Login");

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.12),_transparent_40%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="flex flex-col gap-6 rounded-[2rem] border border-foreground/10 bg-card/90 p-8 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/60">{t("eyebrow")}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{t("hero.title")}</h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-foreground/70">{t("hero.description")}</p>
          </div>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <LocaleSwitcher />
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[0.95fr_0.9fr]">
          <section className="rounded-[2rem] border border-foreground/10 bg-card/90 p-8 shadow-sm">
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/60">{t("title")}</p>
                <h2 className="mt-3 text-3xl font-semibold text-foreground">{t("description")}</h2>
              </div>
              <div className="space-y-4 text-sm leading-7 text-foreground/75">
                <p>{t("support")}</p>
                <p>{t("security.title")}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] bg-background/80 p-6">
                  <p className="text-sm font-semibold text-foreground/70">{t("security.items.mfa")}</p>
                </div>
                <div className="rounded-[1.75rem] bg-background/80 p-6">
                  <p className="text-sm font-semibold text-foreground/70">{t("security.items.session")}</p>
                </div>
                <div className="rounded-[1.75rem] bg-background/80 p-6">
                  <p className="text-sm font-semibold text-foreground/70">{t("security.items.access")}</p>
                </div>
              </div>
              <div className="space-y-4 rounded-[1.75rem] border border-foreground/10 bg-background/80 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-foreground/60">{t("googleSignIn.title")}</p>
                <p className="text-sm text-foreground/70">{t("googleSignIn.description")}</p>
                <GoogleSignInButton callbackUrl={`/${typedLocale}`} label={t("actions.continueWithGoogle")} />
              </div>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-foreground/10 bg-card/90 p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">{t("title")}</h2>
            <p className="mt-3 text-sm leading-7 text-foreground/70">{t("description")}</p>
            <div className="mt-8">
              <LoginForm locale={typedLocale} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
