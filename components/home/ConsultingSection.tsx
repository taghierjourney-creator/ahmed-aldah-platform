import Link from "next/link";
import type { Locale } from "@/lib/locale";

export default function ConsultingSection({ locale }: { locale: Locale }) {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-3xl bg-[#0F172A] p-8 text-white md:flex-row md:items-center md:justify-between md:p-12">
        <div><p className="text-sm font-semibold text-[#E2B857]">المكتب الاستشاري</p><h2 className="mt-3 text-3xl font-bold">هل تحتاج إلى استشارة أو دراسة متخصصة؟</h2><p className="mt-4 max-w-2xl leading-8 text-slate-300">نساعد المؤسسات والباحثين على تحويل الأسئلة المعقدة إلى رؤى قابلة للتنفيذ.</p></div>
        <div className="flex shrink-0 flex-wrap gap-3"><Link href={`/${locale}/office`} className="rounded-full bg-[#E2B857] px-5 py-3 font-semibold text-[#0F172A]">طلب استشارة</Link><Link href={`/${locale}/contact`} className="rounded-full border border-slate-500 px-5 py-3 font-semibold text-white">تواصل معنا</Link></div>
      </div>
    </section>
  );
}
