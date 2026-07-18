"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { SearchResult } from "@/app/actions/search";
import { searchArticles } from "@/app/actions/search";

type SearchStatus = "idle" | "loading" | "success" | "no-results" | "error";

const debounceMs = 300;

export default function SmartSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      startTransition(async () => {
        setStatus("loading");
        try {
          const nextResults = await searchArticles(trimmedQuery);
          setResults(nextResults);
          setStatus(nextResults.length > 0 ? "success" : "no-results");
        } catch {
          setResults([]);
          setStatus("error");
        }
      });
    }, debounceMs);

    return () => window.clearTimeout(timeoutId);
  }, [query, startTransition]);

  const helperText = useMemo(() => {
    if (status === "loading") {
      return "جاري البحث…";
    }
    if (status === "error") {
      return "تعذر إكمال البحث الآن. حاول مرة أخرى لاحقاً.";
    }
    if (status === "no-results") {
      return "لا توجد نتائج تطابق بحثك";
    }
    return "ابحث في المقالات بالعنوان أو المحتوى";
  }, [status]);

  return (
    <div className="w-full rounded-[2rem] border border-border/70 bg-card/95 p-4 shadow-sm backdrop-blur-sm" dir="rtl">
      <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground/80" htmlFor="smart-search-input">
        <span className="text-lg">🔎</span>
        <span>البحث الذكي</span>
      </label>

      <div className="relative">
        <input
          id="smart-search-input"
          type="search"
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            if (!nextQuery.trim()) {
              setResults([]);
              setStatus("idle");
            }
          }}
          placeholder="ابحث عن مقال…"
          aria-label="بحث المقالات"
          className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 pe-12 text-start text-base text-foreground shadow-sm outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
        />
        <div className="pointer-events-none absolute inset-y-0 end-4 flex items-center">
          {isPending ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/70 border-t-transparent" />
          ) : (
            <span className="text-lg">⌕</span>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm text-foreground/70" role="status" aria-live="polite">
        {helperText}
      </p>

      {status === "loading" ? (
        <div className="mt-4 space-y-3">
          <div className="h-3 animate-pulse rounded-full bg-foreground/10" />
          <div className="h-3 w-4/5 animate-pulse rounded-full bg-foreground/10" />
          <div className="h-3 w-3/5 animate-pulse rounded-full bg-foreground/10" />
        </div>
      ) : null}

      {status === "success" && results.length > 0 ? (
        <ul className="mt-4 space-y-2" role="listbox" aria-label="نتائج البحث">
          {results.map((article) => (
            <li key={article.id}>
              <Link
                href={`/${article.locale}/blog/${article.slug}`}
                className="flex flex-col rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-start transition hover:border-primary/60 hover:bg-background"
              >
                <span className="text-sm font-semibold text-foreground">{article.title}</span>
                <span className="mt-1 text-sm text-foreground/70">{article.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
