"use client";

import { FormEvent, useState } from "react";

export default function ContactSection() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setSent(false);
    window.setTimeout(() => { setLoading(false); setSent(true); event.currentTarget.reset(); }, 500);
  }
  return <section className="bg-slate-100 px-4 py-16 dark:bg-slate-900 sm:px-6 lg:px-8"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2"><div><p className="text-sm font-semibold text-[#8B6B2E]">تواصل معنا</p><h2 className="mt-3 text-3xl font-bold text-[#0F172A] dark:text-white">نستمع إلى أسئلتكم ومشاريعكم</h2><p className="mt-5 leading-8 text-slate-600 dark:text-slate-300">للاستفسارات البحثية والاستشارية، تواصلوا مع فريق المنصة.</p><div className="mt-8 space-y-3 text-slate-700 dark:text-slate-200" dir="ltr"><a className="block" href="tel:+22222228131">+222 22228131</a><a className="block" href="mailto:ahmed.eddaht@gmail.com">ahmed.eddaht@gmail.com</a></div></div><form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-800"><label className="block text-sm">الاسم الكامل<input required name="name" className="mt-2 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-600 dark:bg-slate-900" /></label><label className="block text-sm">البريد الإلكتروني<input required type="email" name="email" className="mt-2 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-600 dark:bg-slate-900" /></label><label className="block text-sm">رقم الهاتف (اختياري)<input name="phone" className="mt-2 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-600 dark:bg-slate-900" /></label><label className="block text-sm">الموضوع<input required name="subject" className="mt-2 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-600 dark:bg-slate-900" /></label><label className="block text-sm">الرسالة<textarea required name="message" rows={4} className="mt-2 w-full rounded-lg border border-slate-300 p-3 dark:border-slate-600 dark:bg-slate-900" /></label><button disabled={loading} className="rounded-full bg-[#0F172A] px-6 py-3 font-semibold text-white disabled:opacity-60 dark:bg-[#E2B857] dark:text-[#0F172A]">{loading ? "جاري الإرسال..." : "إرسال الرسالة"}</button>{sent && <p role="status" className="text-sm text-emerald-700">تم إرسال رسالتكم بنجاح.</p>}</form></div></section>;
}
