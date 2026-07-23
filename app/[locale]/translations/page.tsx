"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

// Mock data for translations
const mockTranslationsData = [
  {
    id: "1",
    title: "The Enlightenment Philosophers",
    originalAuthor: "French Scholars",
    translator: "Ahmed Al-Dah",
    originalLanguage: "French",
    date: "2024-01-18",
    status: "Published",
  },
  {
    id: "2",
    title: "Modern Economics Principles",
    originalAuthor: "Thomas Piketty",
    translator: "Fatima Hassan",
    originalLanguage: "English",
    date: "2024-01-15",
    status: "Published",
  },
  {
    id: "3",
    title: "Digital Society Essays",
    originalAuthor: "Jaron Lanier",
    translator: "Muhammad Ali",
    originalLanguage: "English",
    date: "2024-01-12",
    status: "Published",
  },
  {
    id: "4",
    title: "Cultural Studies Volume",
    originalAuthor: "Stuart Hall",
    translator: "Layla Ibrahim",
    originalLanguage: "English",
    date: "2024-01-10",
    status: "Published",
  },
  {
    id: "5",
    title: "Philosophy of Science",
    originalAuthor: "Karl Popper",
    translator: "Hassan Abdu",
    originalLanguage: "German",
    date: "2024-01-05",
    status: "Published",
  },
];

export default function TranslationsPage() {
  const t = useTranslations("PublicPages.translations");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  const languages = useMemo(
    () =>
      Array.from(
        new Set(mockTranslationsData.map((item) => item.originalLanguage))
      ).sort(),
    []
  );

  const filteredTranslations = useMemo(() => {
    return mockTranslationsData.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.translator.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLanguage =
        selectedLanguage === "all" ||
        item.originalLanguage === selectedLanguage;
      return matchesSearch && matchesLanguage;
    });
  }, [searchQuery, selectedLanguage]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header Section */}
      <section className="mb-10 space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/90">
          {t("eyebrow")}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-base leading-7 text-foreground/75">
          {t("description")}
        </p>
      </section>

      {/* Search and Filter Section */}
      <section className="mb-8 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <input
            type="text"
            placeholder={t("search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-lg border border-border bg-background px-4 py-2 text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Languages</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Results Section */}
      {filteredTranslations.length === 0 ? (
        <div className="rounded-3xl border border-border/80 bg-card p-10 text-center text-foreground/80">
          {t("empty")}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTranslations.map((translation) => (
            <Link
              key={translation.id}
              href={`#`}
              className="group flex items-start justify-between rounded-lg border border-border/50 bg-card p-6 hover:border-border/80 hover:bg-card/50 transition-colors"
            >
              <div className="flex-1">
                <h3 className="mb-1 font-semibold text-foreground group-hover:text-primary transition-colors">
                  {translation.title}
                </h3>
                <p className="text-sm text-foreground/60">
                  {translation.originalAuthor}
                </p>
                <p className="text-xs text-foreground/50 mt-1">
                  Translated by {translation.translator}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {translation.originalLanguage}
                  </span>
                  <span className="text-xs text-foreground/50">
                    {new Date(translation.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button className="ms-4 shrink-0 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                Read
              </button>
            </Link>
          ))}
        </div>
      )}

      {/* CTA Section */}
      <section className="mt-12 rounded-3xl bg-gradient-to-r from-primary/10 to-primary/5 p-8 text-center">
        <h2 className="mb-3 text-2xl font-semibold text-foreground">
          {t("create")}
        </h2>
        <p className="mb-6 text-foreground/75">
          Help us bring important works to Arabic-speaking audiences.
        </p>
        <button className="rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          {t("create")}
        </button>
      </section>
    </main>
  );
}
