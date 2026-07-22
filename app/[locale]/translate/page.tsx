"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TranslatePage() {
  const [sourceLang, setSourceLang] = useState("ar");
  const [targetLang, setTargetLang] = useState("en");
  const [sourceText, setSourceText] = useState("");
  const [targetText, setTargetText] = useState("");

  useEffect(() => {
    // Auto-translate on type (local workspace - copy source into target as a draft)
    const timeout = setTimeout(() => {
      setTargetText(sourceText);
    }, 300);
    return () => clearTimeout(timeout);
  }, [sourceText]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold mb-4">أداة الترجمة</h1>

        <div className="flex gap-4">
          <div className="w-1/2">
            <div className="mb-2 flex items-center gap-2">
              <label className="text-sm">المصدر</label>
              <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="ms-2 rounded border p-1">
                <option value="ar">Arabic</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
            <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} className="w-full h-96 p-3 border rounded" />
            <div className="mt-2 flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(sourceText); }} className="px-3 py-2 bg-indigo-600 text-white rounded">نسخ</button>
              <button onClick={() => setSourceText("")} className="px-3 py-2 bg-gray-200 rounded">مسح</button>
            </div>
          </div>

          <div className="w-1/2">
            <div className="mb-2 flex items-center gap-2">
              <label className="text-sm">الهدف</label>
              <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="ms-2 rounded border p-1">
                <option value="ar">Arabic</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
            <textarea value={targetText} onChange={(e) => setTargetText(e.target.value)} className="w-full h-96 p-3 border rounded" />
            <div className="mt-2 flex gap-2">
              <button onClick={() => { navigator.clipboard.writeText(targetText); }} className="px-3 py-2 bg-indigo-600 text-white rounded">نسخ</button>
              <button onClick={() => setTargetText("")} className="px-3 py-2 bg-gray-200 rounded">مسح</button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
