"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default function Navbar() {
  const locale = useLocale();
  const t = useTranslations("navigation");
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold">A</div>
          <span className="text-lg font-semibold">{t("brand")}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href={`/${locale}`} className="hover:underline">{t("home")}</Link>
          <Link href={`/${locale}/blog`} className="hover:underline">{t("blog")}</Link>
          <Link href={`/${locale}/research`} className="hover:underline">{t("research")}</Link>
          <Link href={`/${locale}/books`} className="hover:underline">{t("books")}</Link>
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link href={`/${locale}/login`} className="px-3 py-2 bg-indigo-600 rounded">{t("login")}</Link>
          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={t("toggleMenu")}
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-gray-800">
          <nav className="flex flex-col p-4 gap-2">
            <Link href={`/${locale}`} className="block">{t("home")}</Link>
            <Link href={`/${locale}/blog`} className="block">{t("blog")}</Link>
            <Link href={`/${locale}/research`} className="block">{t("research")}</Link>
            <Link href={`/${locale}/books`} className="block">{t("books")}</Link>
            <Link href={`/${locale}/login`} className="block">{t("login")}</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
