import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/lib/locale";
import TopBar from "@/components/layout/TopBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import ContentGrid from "@/components/home/ContentGrid";
import ConsultingSection from "@/components/home/ConsultingSection";
import ContactSection from "@/components/home/ContactSection";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  setRequestLocale(typedLocale);
  await getTranslations("Home");

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0F172A]">
      <TopBar />
      <Navbar locale={typedLocale} />
      <main><Hero locale={typedLocale} /><ContentGrid locale={typedLocale} /><ConsultingSection locale={typedLocale} /><ContactSection /></main>
      <Footer />
    </div>
  );
}
