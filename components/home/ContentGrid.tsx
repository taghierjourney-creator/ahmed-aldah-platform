"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { Locale } from "@/lib/locale";

type ContentGridProps = { locale: Locale };
type Item = { title: string; summary: string; author: string; category: string; date: string; time: string };

const mockTabs: Record<string, Item[]> = {
  articles: [
    { title: "Knowledge Transformations in the Digital Era", summary: "An examination of technology's impact on knowledge production and dissemination.", author: "Ahmed Al-Dah", category: "Thought", date: "July 20, 2026", time: "8 min" },
    { title: "The University and Knowledge Society", summary: "Toward a deeper partnership between research and community needs.", author: "Sarah Al-Mukhtar", category: "Education", date: "July 18, 2026", time: "6 min" },
  ],
  analyses: [
    { title: "The New Geography of Cultural Influence", summary: "How digital platforms are reshaping soft power.", author: "Muhammad Al-Amin", category: "Analysis", date: "July 16, 2026", time: "12 min" },
  ],
  research: [
    { title: "Qualitative Research Methodologies in Arab Context", summary: "A primer on building applicable research questions.", author: "Dr. Leila Ahmed", category: "Research", date: "July 12, 2026", time: "15 min" },
  ],
  books: [
    { title: "Questions of Delayed Renaissance", summary: "A critical review of reform and knowledge projects.", author: "Platform Team", category: "Books", date: "July 10, 2026", time: "5 min" },
  ],
  translations: [
    { title: "Knowledge Across Languages", summary: "Selected translations in philosophy of science and society.", author: "Translation Unit", category: "Translation", date: "July 8, 2026", time: "10 min" },
  ],
  lectures: [
    { title: "How to Write Impactful Research?", summary: "A foundational lecture on building arguments and citing sources.", author: "Ahmed Al-Dah", category: "Lectures", date: "July 5, 2026", time: "45 min" },
  ],
};

export default function ContentGrid({ locale }: ContentGridProps) {
  const [active, setActive] = useState("articles");
  const t = useTranslations("Home.contentGrid");
  const current = mockTabs[active] || [];
  
  const tabLabels: Record<string, string> = {
    articles: t("articles"),
    analyses: t("analyses"),
    research: t("research"),
    books: t("books"),
    translations: t("translations"),
    lectures: t("lectures"),
  };

  return (
    <section className="bg-[#FAFAFA] px-4 py-16 dark:bg-[#0F172A] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div role="tablist" aria-label={t("ariaLabel")} className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-3 dark:border-slate-700">
          {Object.keys(mockTabs).map((key) => (
            <button key={key} role="tab" aria-selected={active === key} onClick={() => setActive(key)} className={`shrink-0 rounded-full px-4 py-2 text-sm ${active === key ? "bg-[#C5A059] text-[#0F172A]" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
              {tabLabels[key]}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {current.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400"><span>{item.category}</span><span>•</span><span>{item.date}</span><span>•</span><span>{item.time}</span></div>
              <h3 className="mt-4 text-xl font-bold text-[#0F172A] dark:text-white">{item.title}</h3>
              <p className="mt-3 leading-8 text-slate-600 dark:text-slate-300">{item.summary}</p>
              <div className="mt-5 flex items-center justify-between"><span className="text-sm text-[#8B6B2E]">{item.author}</span><Link href={`/${locale}/blog`} className="text-sm font-semibold text-[#8B6B2E]">{t("readMore")}</Link></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
