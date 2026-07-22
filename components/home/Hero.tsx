import Link from "next/link";
import type { Locale } from "@/lib/locale";

type HeroProps = {
  locale: Locale;
};

export default function Hero({ locale }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#FAFAFA] px-4 py-20 dark:bg-[#0F172A] sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-4xl">
          <p className="mb-5 text-sm font-semibold tracking-[0.2em] text-[#A27C36]">
            منصة أحمد الدّاه
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-[1.25] tracking-tight text-[#0F172A] dark:text-[#F8FAFC] sm:text-5xl lg:text-7xl">
            منصة معرفية عربية للبحث والنشر والاستشارات
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-9 text-slate-600 dark:text-slate-300">
            مساحة مؤسسية للمعرفة العربية، تجمع البحث الرصين والنشر المتخصص والخدمات الاستشارية في بيئة موثوقة.
          </p>
        </div>

        <blockquote className="mt-10 max-w-4xl border-e-4 border-[#C5A059] bg-white/80 p-6 text-lg leading-9 text-slate-700 shadow-sm dark:bg-slate-800/70 dark:text-slate-200">
          منصة أحمد الدّاه هي منصة عربية للمعرفة والبحث والاستشارات، تجمع بين النشر العلمي، والأرشيف المعرفي، والخدمات الاستشارية في بيئة احترافية، مصممة لتبقى مرجعًا معرفيًا لعقود.
        </blockquote>

        <div className="mt-9 flex flex-wrap gap-4">
          <Link
            href={`/${locale}/blog`}
            className="rounded-full bg-[#0F172A] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#1E293B] dark:bg-[#E2B857] dark:text-[#0F172A]"
          >
            استكشف المقالات
          </Link>
          <Link
            href={`/${locale}/translate`}
            className="rounded-full border border-[#C5A059] px-6 py-3 font-semibold text-[#8B6B2E] transition-colors hover:bg-[#C5A059]/10 dark:text-[#E2B857]"
          >
            أداة الترجمة
          </Link>
        </div>

        <form
          action={`/${locale}/blog`}
          method="get"
          className="mt-10 flex max-w-3xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row dark:border-slate-700 dark:bg-slate-800"
          role="search"
        >
          <label htmlFor="hero-search" className="sr-only">
            ابحث في المنصة
          </label>
          <input
            id="hero-search"
            name="q"
            type="search"
            placeholder="ابحث في المقالات والأبحاث والكتب..."
            className="min-h-12 flex-1 rounded-xl border-0 bg-transparent px-4 text-slate-900 outline-none ring-0 placeholder:text-slate-400 dark:text-white"
          />
          <button
            type="submit"
            className="min-h-12 rounded-xl bg-[#C5A059] px-6 font-semibold text-[#0F172A] transition-colors hover:bg-[#D4AF37]"
          >
            بحث
          </button>
        </form>
      </div>
    </section>
  );
}
