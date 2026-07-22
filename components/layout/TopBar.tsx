"use client";

import { useLocale } from "next-intl";
import { useState } from "react";

const locales = [
  { value: "ar", label: "العربية" },
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
] as const;

function Icon({ type }: { type: "phone" | "mail" }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-none stroke-current stroke-2">
      {type === "phone" ? (
        <path d="M5 4h3l2 5-2 1a12 12 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2C10 21 3 14 3 6a2 2 0 0 1 2-2Z" />
      ) : (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m4 7 8 6 8-6" />
        </>
      )}
    </svg>
  );
}

export default function TopBar() {
  const locale = useLocale();
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  function toggleTheme() {
    const nextDark = !dark;
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("theme", nextDark ? "dark" : "light");
    setDark(nextDark);
  }

  return (
    <div className="border-b border-slate-200 bg-[#0F172A] text-slate-200 dark:border-slate-800">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-4" dir="ltr">
          <a href="tel:+22222228131" className="inline-flex items-center gap-1.5 hover:text-[#E2B857]">
            <Icon type="phone" />
            +222 22228131
          </a>
          <a href="mailto:ahmed.eddaht@gmail.com" className="inline-flex items-center gap-1.5 hover:text-[#E2B857]">
            <Icon type="mail" />
            ahmed.eddaht@gmail.com
          </a>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="locale-selector" className="sr-only">اللغة</label>
          <select
            id="locale-selector"
            value={locale}
            onChange={(event) => {
              window.location.href = `/${event.target.value}`;
            }}
            className="bg-transparent text-slate-200 outline-none"
          >
            {locales.map((item) => <option key={item.value} value={item.value} className="text-slate-900">{item.label}</option>)}
          </select>
          <button type="button" onClick={toggleTheme} className="rounded-full px-2 py-1 hover:text-[#E2B857]" aria-label={dark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}>
            {dark ? "☀" : "☾"}
          </button>
        </div>
      </div>
    </div>
  );
}
