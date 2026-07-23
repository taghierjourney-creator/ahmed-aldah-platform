import type { Metadata } from "next";
import { getServerSession } from "@/lib/auth";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/locale";
import AdminDashboard from "@/components/admin/AdminDashboard";

type AdminDashboardPageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: AdminDashboardPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AdminDashboard.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function AdminDashboardPage({ params }: AdminDashboardPageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  setRequestLocale(typedLocale);

  const session = await getServerSession();
  const role = (session?.user?.role ?? "JOURNALIST") as "SUPER_ADMIN" | "JOURNALIST" | "ADMIN";
  const userName = session?.user?.name ?? "Administrator";

  return <AdminDashboard userRole={role} userName={userName} />;
}
