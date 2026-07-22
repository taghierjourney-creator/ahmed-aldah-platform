"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function Navbar() {
  const t = useTranslations("Home");
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold">A</div>
          <span className="text-lg font-semibold">منصة أحمد الداه</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href={`/${locale}`} className="hover:underline">الرئيسية</Link>
          <Link href={`/${locale}/blog`} className="hover:underline">المقالات والآراء</Link>
          <Link href={`/${locale}/translate`} className="hover:underline">أداة الترجمة</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href={`/${locale}/login`} className="px-3 py-2 bg-indigo-600 rounded">تسجيل الدخول</Link>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            ☰
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-gray-800">
          <nav className="flex flex-col p-4 gap-2">
            <Link href={`/${locale}`} className="block">الرئيسية</Link>
            <Link href={`/${locale}/blog`} className="block">المقالات والآراء</Link>
            <Link href={`/${locale}/translate`} className="block">أداة الترجمة</Link>
            <Link href={`/${locale}/login`} className="block">تسجيل الدخول</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
