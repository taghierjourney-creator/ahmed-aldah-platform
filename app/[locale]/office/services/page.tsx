import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import OfficeNav from "@/components/office/OfficeNav";
import ServiceCard from "@/components/office/ServiceCard";
import db from "@/lib/db";
import type { Locale } from "@/lib/locale";

type OfficeServicesPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: OfficeServicesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "OfficeServices.metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function OfficeServicesPage({ params }: OfficeServicesPageProps) {
  const { locale } = await params;
  const typedLocale = locale as Locale;

  setRequestLocale(typedLocale);

  const t = await getTranslations("OfficeServices");
  const tOffice = await getTranslations("Office.hero");

  const services = await db.service.findMany({
    where: { locale },
    orderBy: { createdAt: "desc" },
    select: {
      slug: true,
      title: true,
      description: true,
      locale: true,
    },
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-10">
        <header className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-400">
            {tOffice("eyebrow")}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t("heading")}
          </h1>
          <p className="max-w-3xl text-base leading-7 text-foreground/75">
            {t("subheading")}
          </p>
        </header>

        <OfficeNav active="services" />

        {services.length === 0 ? (
          <div className="rounded-3xl border border-foreground/10 bg-card p-10 text-center text-foreground/75">
            {t("empty")}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
