import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 mt-12" role="contentinfo">
      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-semibold mb-2">منصة أحمد الداه</h4>
          <p className="text-sm text-gray-400">حقوق الطبع والنشر © {new Date().getFullYear()} منصة أحمد الداه</p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">روابط سريعة</h4>
          <ul className="text-sm text-gray-400 space-y-1">
            <li><Link href="/en">English</Link></li>
            <li><Link href="/fr">Français</Link></li>
            <li><Link href="/ar">العربية</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2">اتصل بنا</h4>
          <p className="text-sm text-gray-400">contact@ahmed-aldah.example</p>
        </div>
      </div>
    </footer>
  );
}
