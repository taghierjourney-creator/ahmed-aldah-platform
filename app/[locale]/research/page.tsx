"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

// Mock data for research items
const mockResearchData = [
  {
    id: "1",
    title: "The Future of Digital Transformation",
    author: "Dr. Ahmed Al-Dah",
    category: "Technology",
    date: "2024-01-15",
    status: "Published",
  },
  {
    id: "2",
    title: "Understanding Cultural Linguistics",
    author: "Dr. Fatima Hassan",
    category: "Linguistics",
    date: "2024-01-10",
    status: "Published",
  },
  {
    id: "3",
    title: "Machine Learning Applications",
    author: "Prof. Muhammad Ali",
    category: "AI",
    date: "2024-01-05",
    status: "Published",
  },
  {
    id: "4",
    title: "Social Media Impact Study",
    author: "Dr. Layla Ibrahim",
    category: "Sociology",
    date: "2023-12-28",
    status: "Published",
  },
  {
    id: "5",
    title: "Economic Policy Analysis 2024",
    author: "Prof. Hassan Abdu",
    category: "Economics",
    date: "2023-12-20",
    status: "Published",
  },
];

export default function ResearchPage() {
  const t = useTranslations("PublicPages.research");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(mockResearchData.map((item) => item.category))
      ).sort(),
    []
  );

  const filteredResearch = useMemo(() => {
    return mockResearchData.filter((item) => {
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
      {filteredResearch.length === 0 ? (
        <div className="rounded-3xl border border-border/80 bg-card p-10 text-center text-foreground/80">
          {t("empty")}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResearch.map((research) => (
            <div
              key={research.id}
              className="flex items-start justify-between rounded-lg border border-border/50 bg-card p-6 hover:border-border/80 hover:bg-card/50 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-foreground hover:text-primary transition-colors">
                  <Link href={`#`}>{research.title}</Link>
                </h3>
                <p className="text-sm text-foreground/60">{research.author}</p>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {research.category}
                  </span>
                  <span className="text-xs text-foreground/50">
                    {new Date(research.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <button className="ms-4 shrink-0 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                Read
              </button>
            </div>
          ))}
        </div>
      )}

      {/* CTA Section */}
      <section className="mt-12 rounded-3xl bg-gradient-to-r from-primary/10 to-primary/5 p-8 text-center">
        <h2 className="mb-3 text-2xl font-semibold text-foreground">
          {t("create")}
        </h2>
        <p className="mb-6 text-foreground/75">
          Share your research with our growing community of scholars and
          practitioners.
        </p>
        <button className="rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          {t("create")}
        </button>
      </section>
    </main>
  );
}
