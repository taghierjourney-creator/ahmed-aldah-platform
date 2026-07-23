"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

// Mock data for analyses
const mockAnalysesData = [
  {
    id: "1",
    title: "The Future of Global Knowledge Networks",
    author: "Ahmed Al-Dah",
    category: "Global Affairs",
    date: "2024-01-20",
    readTime: "8 min",
    status: "Published",
  },
  {
    id: "2",
    title: "Artificial Intelligence and Society",
    author: "Fatima Hassan",
    category: "Technology",
    date: "2024-01-18",
    readTime: "10 min",
    status: "Published",
  },
  {
    id: "3",
    title: "Language, Culture, and Identity",
    author: "Muhammad Ali",
    category: "Culture",
    date: "2024-01-16",
    readTime: "7 min",
    status: "Published",
  },
  {
    id: "4",
    title: "Economic Inequality in the Digital Era",
    author: "Layla Ibrahim",
    category: "Economics",
    date: "2024-01-14",
    readTime: "12 min",
    status: "Published",
  },
  {
    id: "5",
    title: "Democracy and Digital Platforms",
    author: "Hassan Abdu",
    category: "Politics",
    date: "2024-01-12",
    readTime: "9 min",
    status: "Published",
  },
];

export default function AnalysesPage() {
  const t = useTranslations("PublicPages.analyses");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(
    () =>
      Array.from(new Set(mockAnalysesData.map((item) => item.category))).sort(),
    []
  );

  const filteredAnalyses = useMemo(() => {
    return mockAnalysesData.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

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
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Results Section */}
      {filteredAnalyses.length === 0 ? (
        <div className="rounded-3xl border border-border/80 bg-card p-10 text-center text-foreground/80">
          {t("empty")}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredAnalyses.map((analysis) => (
            <Link
              key={analysis.id}
              href={`#`}
              className="group flex flex-col rounded-lg border border-border/50 bg-card p-6 hover:border-border/80 hover:shadow-lg transition-all"
            >
              <div className="mb-3 flex items-start justify-between">
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {analysis.category}
                </span>
                <span className="text-xs text-foreground/50">
                  {analysis.readTime}
                </span>
              </div>
              <h3 className="mb-2 flex-1 font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {analysis.title}
              </h3>
              <div className="space-y-2 border-t border-border/30 pt-3">
                <p className="text-sm text-foreground/60">{analysis.author}</p>
                <p className="text-xs text-foreground/50">
                  {new Date(analysis.date).toLocaleDateString()}
                </p>
              </div>
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
          Share your expert insights and contribute to public discourse.
        </p>
        <button className="rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          {t("create")}
        </button>
      </section>
    </main>
  );
}
