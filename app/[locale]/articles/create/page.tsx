"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { createArticleAsAuthor } from "@/actions/editorial";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CreateArticlePage() {
  const locale = useLocale();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Call server action
      // @ts-ignore Server Action
      await createArticleAsAuthor({ title, slug, excerpt, coverImage, content, locale, status });
      // simple redirect
      window.location.href = `/${locale}/admin`;
    } catch (err: any) {
      setError(err?.message || "Failed to save");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold mb-4">كتابة مقال</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">العنوان</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded border p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium">الملف التعريفي (slug)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 block w-full rounded border p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium">مقتطف</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="mt-1 block w-full rounded border p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium">صورة الغلاف (URL)</label>
            <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="mt-1 block w-full rounded border p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium">المحتوى (Markdown)</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} className="mt-1 block w-full h-64 rounded border p-2" />
          </div>

          <div>
            <label className="block text-sm font-medium">الحالة</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 block rounded border p-2">
              <option value="DRAFT">مسودة</option>
              <option value="PENDING">مراجعة</option>
              <option value="PUBLISHED">نشر</option>
            </select>
          </div>

          {error && <div className="text-red-600">{error}</div>}

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded">{saving ? 'جاري الحفظ…' : 'حفظ'}</button>
            <a href={`/${locale}/portal`} className="px-4 py-2 border rounded">إلغاء</a>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
