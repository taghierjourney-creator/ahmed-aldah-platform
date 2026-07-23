"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

// Mock data for lectures
const mockLecturesData = [
  {
    id: "1",
    title: "Introduction to Knowledge Systems",
    speaker: "Ahmed Al-Dah",
    category: "Philosophy",
    date: "2024-01-20",
    duration: "45 min",
    status: "Published",
  },
  {
    id: "2",
    title: "Digital Transformation Strategy",
    speaker: "Fatima Hassan",
    category: "Technology",
    date: "2024-01-18",
    duration: "60 min",
    status: "Published",
  },
  {
    id: "3",
    title: "Linguistics in the Modern World",
    speaker: "Muhammad Ali",
    category: "Linguistics",
    date: "2024-01-15",
    duration: "55 min",
    status: "Published",
  },
  {
    id: "4",
    title: "Social Impact Analysis",
    speaker: "Layla Ibrahim",
    category: "Sociology",
    date: "2024-01-12",
    duration: "50 min",
    status: "Published",
  },
  {
    id: "5",
    title: "Economic Trends 2024",
    speaker: "Hassan Abdu",
    category: "Economics",
    date: "2024-01-10",
    duration: "65 min",
    status: "Published",
  },
];

export default function LecturesPage() {
  const t = useTranslations("PublicPages.lectures");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(mockLecturesData.map((item) => item.category))
      ).sort(),
    []
  );

  const filteredLectures = useMemo(() => {
    return mockLecturesData.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.speaker.toLowerCase().includes(searchQuery.toLowerCase());
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
      {filteredLectures.length === 0 ? (
        <div className="rounded-3xl border border-border/80 bg-card p-10 text-center text-foreground/80">
          {t("empty")}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLectures.map((lecture) => (
            <Link
              key={lecture.id}
              href={`#`}
              className="group flex items-start justify-between rounded-lg border border-border/50 bg-card p-6 hover:border-border/80 hover:bg-card/50 transition-colors"
            >
              <div className="flex flex-1 items-start gap-4">
                <div className="mt-1 rounded-lg bg-primary/10 p-3 text-2xl">
                  🎥
                </div>
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-foreground group-hover:text-primary transition-colors">
                    {lecture.title}
                  </h3>
                  <p className="text-sm text-foreground/60">{lecture.speaker}</p>
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {lecture.category}
                    </span>
                    <span className="text-xs text-foreground/50">
                      {new Date(lecture.date).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-foreground/50">
                      {lecture.duration}
                    </span>
                  </div>
                </div>
              </div>
              <button className="ms-4 shrink-0 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
                Watch
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
          Share your expertise with our learning community.
        </p>
        <button className="rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          {t("create")}
        </button>
      </section>
    </main>
  );
}
