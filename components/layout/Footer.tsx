import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] px-4 py-12 text-slate-300 sm:px-6 lg:px-8" role="contentinfo">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
        <div><h2 className="text-lg font-bold text-white">منصة أحمد الدّاه</h2><p className="mt-3 text-sm leading-7">مؤسسة عربية للمعرفة والبحث والاستشارات والنشر المتخصص.</p></div>
        <div><h3 className="font-semibold text-white">التنقل</h3><div className="mt-3 space-y-2 text-sm"><Link className="block hover:text-[#E2B857]" href="/ar">الرئيسية</Link><Link className="block hover:text-[#E2B857]" href="/ar/blog">المقالات</Link><Link className="block hover:text-[#E2B857]" href="/ar/translate">الترجمة</Link></div></div>
        <div><h3 className="font-semibold text-white">الخدمات</h3><div className="mt-3 space-y-2 text-sm"><Link className="block hover:text-[#E2B857]" href="/ar/office">الاستشارات</Link><Link className="block hover:text-[#E2B857]" href="/ar/office/services">الخدمات البحثية</Link></div></div>
        <div><h3 className="font-semibold text-white">تواصل معنا</h3><div className="mt-3 space-y-2 text-sm" dir="ltr"><a className="block hover:text-[#E2B857]" href="tel:+22222228131">+222 22228131</a><a className="block hover:text-[#E2B857]" href="mailto:ahmed.eddaht@gmail.com">ahmed.eddaht@gmail.com</a></div></div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-slate-700 pt-5 text-sm">© {new Date().getFullYear()} منصة أحمد الدّاه. جميع الحقوق محفوظة.</div>
    </footer>
  );
}
