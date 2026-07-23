"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

// Mock data for books
const mockBooksData = [
  {
    id: "1",
    title: "Knowledge Systems in Modern Society",
    author: "Ahmed Al-Dah",
    category: "Philosophy",
    date: "2024-01-20",
    status: "Published",
  },
  {
    id: "2",
    title: "Digital Transformation Guide",
    author: "Fatima Hassan",
    category: "Technology",
    date: "2024-01-15",
    status: "Published",
  },
  {
    id: "3",
    title: "Arabic Linguistics Studies",
    author: "Muhammad Ali",
    category: "Linguistics",
    date: "2024-01-10",
    status: "Published",
  },
  {
    id: "4",
    title: "Social Impact Assessment",
    author: "Layla Ibrahim",
    category: "Sociology",
    date: "2024-01-05",
    status: "Published",
  },
  {
    id: "5",
    title: "Economic Perspectives 2024",
    author: "Hassan Abdu",
    category: "Economics",
    date: "2023-12-28",
    status: "Published",
  },
];

export default function BooksPage() {
  const t = useTranslations("PublicPages.books");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(
    () =>
      Array.from(new Set(mockBooksData.map((item) => item.category))).sort(),
    []
  );

  const filteredBooks = useMemo(() => {
    return mockBooksData.filter((item) => {
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
      {filteredBooks.length === 0 ? (
        <div className="rounded-3xl border border-border/80 bg-card p-10 text-center text-foreground/80">
          {t("empty")}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => (
            <Link
              key={book.id}
              href={`#`}
              className="group flex flex-col overflow-hidden rounded-lg border border-border/50 bg-card hover:border-border/80 hover:shadow-lg transition-all"
            >
              <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <span className="text-4xl">📖</span>
              </div>
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <h3 className="mb-2 font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-foreground/60">{book.author}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-3">
                  <span className="inline-block rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {book.category}
                  </span>
                  <span className="text-xs text-foreground/50">
                    {new Date(book.date).getFullYear()}
                  </span>
                </div>
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
          Share your publication with our reading community.
        </p>
        <button className="rounded-lg bg-primary px-6 py-2 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          {t("create")}
        </button>
      </section>
    </main>
  );
}
