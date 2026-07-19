import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import type { Locale } from "@/lib/locale";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  setRequestLocale(typedLocale);

  await getTranslations("Home");

  redirect(`/${locale}/office`);
}

