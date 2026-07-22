"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/locale";

type ContentGridProps = { locale: Locale };
type Item = { title: string; summary: string; author: string; category: string; date: string; time: string };

const tabs: Record<string, { label: string; items: Item[] }> = {
  articles: { label: "أحدث المقالات", items: [
    { title: "تحولات المعرفة العربية في العصر الرقمي", summary: "قراءة في أثر التقنية على إنتاج المعرفة وتداولها.", author: "أحمد الدّاه", category: "فكر", date: "20 يوليو 2026", time: "8 دقائق" },
    { title: "الجامعة ومجتمع المعرفة", summary: "نحو شراكة أكثر عمقًا بين البحث واحتياجات المجتمع.", author: "سارة المختار", category: "تعليم", date: "18 يوليو 2026", time: "6 دقائق" },
  ]},
  analysis: { label: "التحليلات", items: [
    { title: "الجغرافيا الجديدة للتأثير الثقافي", summary: "كيف تعيد المنصات الرقمية تشكيل القوة الناعمة.", author: "محمد الأمين", category: "تحليل", date: "16 يوليو 2026", time: "12 دقيقة" },
  ]},
  research: { label: "الأبحاث", items: [
    { title: "منهجيات البحث النوعي في السياق العربي", summary: "دليل تمهيدي لبناء أسئلة بحثية قابلة للتطبيق.", author: "د. ليلى أحمد", category: "أبحاث", date: "12 يوليو 2026", time: "15 دقيقة" },
  ]},
  books: { label: "الكتب", items: [
    { title: "أسئلة النهضة المؤجلة", summary: "مراجعة نقدية في مشاريع الإصلاح والمعرفة.", author: "فريق المنصة", category: "كتب", date: "10 يوليو 2026", time: "5 دقائق" },
  ]},
  translations: { label: "الترجمات", items: [
    { title: "المعرفة العابرة للغات", summary: "مختارات مترجمة في فلسفة العلم والمجتمع.", author: "وحدة الترجمة", category: "ترجمة", date: "8 يوليو 2026", time: "10 دقائق" },
  ]},
  lectures: { label: "المحاضرات", items: [
    { title: "كيف نكتب بحثًا مؤثرًا؟", summary: "محاضرة تأسيسية في بناء الحجة وتوثيق المصادر.", author: "أحمد الدّاه", category: "محاضرات", date: "5 يوليو 2026", time: "45 دقيقة" },
  ]},
};

export default function ContentGrid({ locale }: ContentGridProps) {
  const [active, setActive] = useState("articles");
  const current = tabs[active];
  return (
    <section className="bg-[#FAFAFA] px-4 py-16 dark:bg-[#0F172A] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div role="tablist" aria-label="أقسام المحتوى" className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-3 dark:border-slate-700">
          {Object.entries(tabs).map(([key, tab]) => (
            <button key={key} role="tab" aria-selected={active === key} onClick={() => setActive(key)} className={`shrink-0 rounded-full px-4 py-2 text-sm ${active === key ? "bg-[#C5A059] text-[#0F172A]" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {current.items.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400"><span>{item.category}</span><span>•</span><span>{item.date}</span><span>•</span><span>{item.time}</span></div>
              <h3 className="mt-4 text-xl font-bold text-[#0F172A] dark:text-white">{item.title}</h3>
              <p className="mt-3 leading-8 text-slate-600 dark:text-slate-300">{item.summary}</p>
              <div className="mt-5 flex items-center justify-between"><span className="text-sm text-[#8B6B2E]">{item.author}</span><Link href={`/${locale}/blog`} className="text-sm font-semibold text-[#8B6B2E]">اقرأ المزيد</Link></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
