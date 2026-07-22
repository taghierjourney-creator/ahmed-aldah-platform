import Link from "next/link";
import { getServerSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import type { Locale } from "@/lib/locale";

type NavbarProps = {
  locale: Locale;
};

const links = [
  { href: "", label: "الرئيسية" },
  { href: "/blog", label: "المقالات" },
  { href: "/research", label: "الأبحاث" },
  { href: "/books", label: "الكتب" },
  { href: "/translate", label: "الترجمة" },
  { href: "/office", label: "المكتب" },
  { href: "/contact", label: "تواصل معنا" },
] as const;

export default async function Navbar({ locale }: NavbarProps) {
  const session = await getServerSession();
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#FAFAFA]/95 backdrop-blur dark:border-slate-700/80 dark:bg-[#0F172A]/95">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}`}
          className="shrink-0 text-lg font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]"
        >
          منصة أحمد الدّاه
        </Link>

        <nav
          aria-label="التنقل الرئيسي"
          className="hidden items-center gap-5 text-sm text-slate-600 lg:flex dark:text-slate-300"
        >
          {links.map((link) => (
            <Link
              key={link.label}
              href={`/${locale}${link.href}`}
              className="transition-colors hover:text-[#C5A059]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="البحث"
            className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-200 hover:text-[#C5A059] dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2">
              <circle cx="11" cy="11" r="6" />
              <path d="m16 16 4 4" />
            </svg>
          </button>

          {user?.id ? (
            <div className="flex items-center gap-3">
              {isAdmin ? (
                <Link
                  href={`/${locale}/admin`}
                  className="hidden rounded-full border border-[#C5A059] px-4 py-2 text-sm font-medium text-[#8B6B2E] transition-colors hover:bg-[#C5A059]/10 sm:inline-flex"
                >
                  لوحة الإدارة
                </Link>
              ) : null}
              <LogoutButton locale={locale} />
            </div>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="rounded-full bg-[#0F172A] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1E293B] dark:bg-[#E2B857] dark:text-[#0F172A]"
            >
              تسجيل الدخول
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
