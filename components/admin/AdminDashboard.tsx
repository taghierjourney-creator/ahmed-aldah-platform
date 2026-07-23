"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

export type UserRole = "SUPER_ADMIN" | "JOURNALIST" | "ADMIN";

type AdminTab =
  | "dashboard"
  | "articles"
  | "research"
  | "books"
  | "users"
  | "settings";

type Article = {
  id: string;
  title: string;
  status: "Draft" | "Published" | "Review";
  author: string;
  publishedAt: string;
};

type ResearchItem = {
  id: string;
  title: string;
  category: string;
  status: "Draft" | "Published" | "Archived";
  updatedAt: string;
};

type BookItem = {
  id: string;
  title: string;
  author: string;
  publishedAt: string;
  status: "Draft" | "Published";
};

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "Active" | "Inactive";
};

type SiteSetting = {
  id: string;
  name: string;
  value: string;
  description: string;
};

const mockArticles: Article[] = [
  {
    id: "A-001",
    title: "How AI Is Reshaping Arabic Journalism",
    status: "Published",
    author: "Hani Al-Dah",
    publishedAt: "2025-04-01",
  },
  {
    id: "A-002",
    title: "The Future of Multilingual Publishing",
    status: "Draft",
    author: "Sara Jouan",
    publishedAt: "2025-05-12",
  },
  {
    id: "A-003",
    title: "Designing Content Workflows for Editors",
    status: "Review",
    author: "Kareem Mahfouz",
    publishedAt: "2025-06-07",
  },
];

const mockResearch: ResearchItem[] = [
  {
    id: "R-001",
    title: "Academic Research on Visual Storytelling",
    category: "Media Studies",
    status: "Published",
    updatedAt: "2025-04-10",
  },
  {
    id: "R-002",
    title: "Artificial Intelligence in Education",
    category: "EdTech",
    status: "Draft",
    updatedAt: "2025-05-22",
  },
];

const mockBooks: BookItem[] = [
  {
    id: "B-001",
    title: "A Modern Guide to Digital Publishing",
    author: "Lina Haddad",
    publishedAt: "2024-12-15",
    status: "Published",
  },
  {
    id: "B-002",
    title: "Designing Better Journalist Experiences",
    author: "Youssef Ben",
    publishedAt: "2025-01-08",
    status: "Draft",
  },
];

const mockUsers: UserItem[] = [
  {
    id: "U-001",
    name: "Rania El-Sayed",
    email: "rania@newsroom.com",
    role: "JOURNALIST",
    status: "Active",
  },
  {
    id: "U-002",
    name: "Adel Al-Mahdi",
    email: "adel@platform.com",
    role: "SUPER_ADMIN",
    status: "Active",
  },
  {
    id: "U-003",
    name: "Mina Khalil",
    email: "mina@content.io",
    role: "JOURNALIST",
    status: "Inactive",
  },
];

const mockSettings: SiteSetting[] = [
  {
    id: "S-001",
    name: "siteTitle",
    value: "Ahmed Aldah Platform",
    description: "The primary site title visible across metadata and admin headers.",
  },
  {
    id: "S-002",
    name: "supportEmail",
    value: "support@ahmedaldah.com",
    description: "Contact email for user support and site administration.",
  },
];

const metrics = {
  totalArticles: mockArticles.length,
  totalResearch: mockResearch.length,
  totalBooks: mockBooks.length,
  totalUsers: mockUsers.length,
};

const tabConfig: { id: AdminTab; labelKey: string }[] = [
  { id: "dashboard", labelKey: "admin.tabs.dashboard" },
  { id: "articles", labelKey: "admin.tabs.articles" },
  { id: "research", labelKey: "admin.tabs.research" },
  { id: "books", labelKey: "admin.tabs.books" },
  { id: "users", labelKey: "admin.tabs.users" },
  { id: "settings", labelKey: "admin.tabs.settings" },
];

type AdminDashboardProps = {
  userRole: UserRole;
  userName: string;
};

const formatDate = (date: string) => new Date(date).toLocaleDateString();

const statusBadge = (status: string) => {
  const colorClasses = {
    Draft: "bg-yellow-100 text-yellow-800",
    Published: "bg-green-100 text-green-800",
    Review: "bg-sky-100 text-sky-800",
    Archived: "bg-gray-100 text-gray-800",
    Active: "bg-emerald-100 text-emerald-800",
    Inactive: "bg-red-100 text-red-800",
  } as const;

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${colorClasses[status as keyof typeof colorClasses] || "bg-slate-100 text-slate-800"}`}>
      {status}
    </span>
  );
};

export default function AdminDashboard({ userRole, userName }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [search, setSearch] = useState("");
  const t = useTranslations("AdminDashboard");

  const isSuperAdmin = userRole === "SUPER_ADMIN" || userRole === "ADMIN";
  const hasAccess = (tab: AdminTab) => {
    if (tab === "users" || tab === "settings" || tab === "research" || tab === "books") {
      return isSuperAdmin;
    }
    return true;
  };

  const filteredArticles = useMemo(
    () =>
      mockArticles.filter((article) =>
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.author.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const filteredResearch = useMemo(
    () =>
      mockResearch.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const filteredBooks = useMemo(
    () =>
      mockBooks.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.author.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  const filteredUsers = useMemo(
    () =>
      mockUsers.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.role.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-sm shadow-slate-200/50 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              {t("welcome")}
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              {t("hello", { name: userName })}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              {t("overview")}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/70">
              <dt className="text-sm text-slate-500 dark:text-slate-400">{t("metrics.articles")}</dt>
              <dd className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{metrics.totalArticles}</dd>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/70">
              <dt className="text-sm text-slate-500 dark:text-slate-400">{t("metrics.research")}</dt>
              <dd className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{metrics.totalResearch}</dd>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/70">
              <dt className="text-sm text-slate-500 dark:text-slate-400">{t("metrics.books")}</dt>
              <dd className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{metrics.totalBooks}</dd>
            </div>
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/70">
              <dt className="text-sm text-slate-500 dark:text-slate-400">{t("metrics.users")}</dt>
              <dd className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{metrics.totalUsers}</dd>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-3 shadow-sm shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-wrap items-center gap-2 px-4 py-3">
          {tabConfig.map((tab) =>
            hasAccess(tab.id) ? (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {t(tab.labelKey)}
              </button>
            ) : null,
          )}
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === "dashboard" && (
          <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t("adminTabs.dashboard")}</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("dashboard.summary")}</p>
              </div>
              <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {isSuperAdmin ? t("dashboard.roleSuperAdmin") : t("dashboard.roleJournalist")}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.quickActions")}</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900/90">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("dashboard.quickAction.articles")}</h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("dashboard.quickAction.articlesDescription")}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900/90">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t("dashboard.quickAction.research")}</h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("dashboard.quickAction.researchDescription")}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.identity")}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">{userName.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{userName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t("dashboard.loggedAs")}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.totalContent")}</p>
                <div className="mt-4 grid gap-3">
                  <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900/90">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t("dashboard.articles")}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{metrics.totalArticles}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900/90">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t("dashboard.books")}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{metrics.totalBooks}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/70">
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("dashboard.administration")}</p>
                <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{isSuperAdmin ? t("dashboard.fullAccess") : t("dashboard.journalistAccess")}</p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "articles" && (
          <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t("adminTabs.articles")}</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("articles.description")}</p>
              </div>
              <button className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                {t("articles.create")}
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("articles.search")}
                className="w-full rounded-3xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950/80 dark:text-white dark:focus:border-slate-500"
              />
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
              <table className="min-w-full text-start text-sm">
                <thead className="bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3">{t("articles.table.id")}</th>
                    <th className="px-4 py-3">{t("articles.table.title")}</th>
                    <th className="px-4 py-3">{t("articles.table.status")}</th>
                    <th className="px-4 py-3">{t("articles.table.author")}</th>
                    <th className="px-4 py-3">{t("articles.table.published")}</th>
                    <th className="px-4 py-3">{t("articles.table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article) => (
                    <tr key={article.id} className="border-t border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{article.id}</td>
                      <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">{article.title}</td>
                      <td className="px-4 py-4">{statusBadge(article.status)}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{article.author}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{formatDate(article.publishedAt)}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        <div className="flex flex-wrap gap-2">
                          <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                            {t("actions.edit")}
                          </button>
                          <button className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-700/20 dark:text-red-200 dark:hover:bg-red-700/10">
                            {t("actions.delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "research" && isSuperAdmin && (
          <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t("adminTabs.research")}</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("research.description")}</p>
              </div>
              <button className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                {t("research.create")}
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("research.search")}
                className="w-full rounded-3xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950/80 dark:text-white dark:focus:border-slate-500"
              />
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
              <table className="min-w-full text-start text-sm">
                <thead className="bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3">{t("research.table.id")}</th>
                    <th className="px-4 py-3">{t("research.table.title")}</th>
                    <th className="px-4 py-3">{t("research.table.category")}</th>
                    <th className="px-4 py-3">{t("research.table.status")}</th>
                    <th className="px-4 py-3">{t("research.table.updated")}</th>
                    <th className="px-4 py-3">{t("research.table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResearch.map((item) => (
                    <tr key={item.id} className="border-t border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{item.id}</td>
                      <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">{item.title}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{item.category}</td>
                      <td className="px-4 py-4">{statusBadge(item.status)}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{formatDate(item.updatedAt)}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        <div className="flex flex-wrap gap-2">
                          <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                            {t("actions.edit")}
                          </button>
                          <button className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-700/20 dark:text-red-200 dark:hover:bg-red-700/10">
                            {t("actions.delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "books" && isSuperAdmin && (
          <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t("adminTabs.books")}</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("books.description")}</p>
              </div>
              <button className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                {t("books.create")}
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("books.search")}
                className="w-full rounded-3xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950/80 dark:text-white dark:focus:border-slate-500"
              />
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
              <table className="min-w-full text-start text-sm">
                <thead className="bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3">{t("books.table.id")}</th>
                    <th className="px-4 py-3">{t("books.table.title")}</th>
                    <th className="px-4 py-3">{t("books.table.author")}</th>
                    <th className="px-4 py-3">{t("books.table.published")}</th>
                    <th className="px-4 py-3">{t("books.table.status")}</th>
                    <th className="px-4 py-3">{t("books.table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="border-t border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{book.id}</td>
                      <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">{book.title}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{book.author}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{formatDate(book.publishedAt)}</td>
                      <td className="px-4 py-4">{statusBadge(book.status)}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        <div className="flex flex-wrap gap-2">
                          <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                            {t("actions.edit")}
                          </button>
                          <button className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-700/20 dark:text-red-200 dark:hover:bg-red-700/10">
                            {t("actions.delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "users" && isSuperAdmin && (
          <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t("adminTabs.users")}</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("users.description")}</p>
              </div>
              <button className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                {t("users.invite")}
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("users.search")}
                className="w-full rounded-3xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950/80 dark:text-white dark:focus:border-slate-500"
              />
            </div>

            <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
              <table className="min-w-full text-start text-sm">
                <thead className="bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3">{t("users.table.id")}</th>
                    <th className="px-4 py-3">{t("users.table.name")}</th>
                    <th className="px-4 py-3">{t("users.table.email")}</th>
                    <th className="px-4 py-3">{t("users.table.role")}</th>
                    <th className="px-4 py-3">{t("users.table.status")}</th>
                    <th className="px-4 py-3">{t("users.table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t border-slate-200 dark:border-slate-800">
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{user.id}</td>
                      <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">{user.name}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{user.email}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">{user.role}</td>
                      <td className="px-4 py-4">{statusBadge(user.status)}</td>
                      <td className="px-4 py-4 text-slate-600 dark:text-slate-300">
                        <div className="flex flex-wrap gap-2">
                          <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
                            {t("actions.edit")}
                          </button>
                          <button className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-700/20 dark:text-red-200 dark:hover:bg-red-700/10">
                            {t("actions.remove")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "settings" && isSuperAdmin && (
          <section className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t("adminTabs.settings")}</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t("settings.description")}</p>
              </div>
              <button className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                {t("settings.update")}
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {mockSettings.map((setting) => (
                <div key={setting.id} className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/80">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{t(`settings.items.${setting.name}`)}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{setting.description}</p>
                  <div className="mt-4 flex flex-col gap-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{t("settings.value")}</label>
                    <input
                      type="text"
                      value={setting.value}
                      readOnly
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950/90 dark:text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
