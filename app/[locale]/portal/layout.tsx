import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { getServerSession } from "@/lib/auth";
import type { Locale } from "@/lib/locale";

type PortalLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export default async function PortalLayout({ children, params }: PortalLayoutProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  setRequestLocale(typedLocale);

  const session = await getServerSession();
  const role = String(session?.user?.role ?? "").toUpperCase();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  if (role !== "CLIENT") {
    redirect(`/${locale}/login`);
  }

  return <>{children}</>;
}
