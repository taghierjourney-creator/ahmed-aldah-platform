import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

type OfficeNavProps = {
  active?: "office" | "services" | "projects";
};

export default async function OfficeNav({ active }: OfficeNavProps) {
  const t = await getTranslations("Office.nav");

  const linkClass = (isActive: boolean) =>
    isActive
      ? "rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white shadow-sm"
      : "rounded-full px-4 py-2 text-sm font-medium text-foreground ring-1 ring-foreground/15 transition hover:bg-foreground/5";

  return (
    <nav aria-label={t("label")} className="flex flex-wrap gap-2">
      <Link href="/office" className={linkClass(active === "office")}>
        {t("backToOffice")}
      </Link>
      <Link href="/office/services" className={linkClass(active === "services")}>
        {t("services")}
      </Link>
      <Link href="/office/projects" className={linkClass(active === "projects")}>
        {t("projects")}
      </Link>
    </nav>
  );
}
