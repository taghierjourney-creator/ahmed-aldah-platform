"use client";

import { useEffect, useMemo, useState } from "react";
import { Amiri, Cairo, Noto_Naskh_Arabic, Reem_Kufi, Tajawal } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";

const reemKufi = Reem_Kufi({
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "500", "700"],
});

const amiri = Amiri({
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "700"],
});

const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "500", "700"],
});

const cairo = Cairo({
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "500", "700"],
});

const tajawal = Tajawal({
  subsets: ["arabic"],
  display: "swap",
  weight: ["400", "500", "700"],
});

type ReaderPanelProps = {
  locale: string;
  children: ReactNode;
};

type FontOption = {
  id: string;
  name: string;
  description: string;
  preview: string;
  family: string;
  className?: string;
};

type ThemeOption = {
  id: string;
  name: string;
  arabicName: string;
  surface: string;
  text: string;
  panel: string;
  border: string;
  accent: string;
  shadow: string;
};

type ReaderSettings = {
  font: string;
  theme: string;
  fontSize: string;
  lineHeight: string;
};

const fontOptions: FontOption[] = [
  {
    id: "reem-kufi",
    name: "Reem Kufi",
    description: "الخط الكوفي المهيب لعشاق الزخرفة والأصالة",
    preview: "نص تجريبي للقراءة",
    family: reemKufi.style.fontFamily,
    className: reemKufi.className,
  },
  {
    id: "amiri",
    name: "Amiri",
    description: "الخط الأميري الكلاسيكي للروايات الطويلة والمخطوطات الشنقيطية",
    preview: "نص تجريبي للقراءة",
    family: amiri.style.fontFamily,
    className: amiri.className,
  },
  {
    id: "noto-naskh",
    name: "Noto Naskh Arabic",
    description: "خط النسخ الصحفي المريح والمعتمد عالمياً للمقالات",
    preview: "نص تجريبي للقراءة",
    family: naskh.style.fontFamily,
    className: naskh.className,
  },
  {
    id: "cairo",
    name: "Cairo",
    description: "خط كايرو الحديث والواضح للمقالات السريعة والإخبارية",
    preview: "نص تجريبي للقراءة",
    family: cairo.style.fontFamily,
    className: cairo.className,
  },
  {
    id: "tajawal",
    name: "Tajawal",
    description: "خط تجوال الرشيق والنظيف",
    preview: "نص تجريبي للقراءة",
    family: tajawal.style.fontFamily,
    className: tajawal.className,
  },
  {
    id: "system-serif",
    name: "System-Serif",
    description: "الخط الكلاسيكي الفاخر للروايات الطويلة والمحتوى الأجنبي",
    preview: "نص تجريبي للقراءة",
    family: "serif",
  },
];

const themeOptions: ThemeOption[] = [
  {
    id: "default-light",
    name: "Default Light",
    arabicName: "الأبيض العاجي",
    surface: "#fcf8ee",
    text: "#1f2533",
    panel: "#ffffff",
    border: "rgba(31, 37, 51, 0.12)",
    accent: "#8b5e3c",
    shadow: "rgba(60, 32, 13, 0.2)",
  },
  {
    id: "dark-mode",
    name: "Dark Mode",
    arabicName: "الأسود الملكي",
    surface: "#0f172a",
    text: "#f8f7f2",
    panel: "#111827",
    border: "rgba(248, 247, 242, 0.16)",
    accent: "#e2b161",
    shadow: "rgba(0, 0, 0, 0.35)",
  },
  {
    id: "sepia",
    name: "Sepia",
    arabicName: "البني الدافئ",
    surface: "#f5e8d1",
    text: "#4b2f21",
    panel: "#f8efe1",
    border: "rgba(75, 47, 33, 0.16)",
    accent: "#8a4f2f",
    shadow: "rgba(112, 74, 42, 0.18)",
  },
  {
    id: "soft-blue",
    name: "Soft Blue",
    arabicName: "الأزرق الهادئ",
    surface: "#eef4ff",
    text: "#24324a",
    panel: "#f8fbff",
    border: "rgba(36, 50, 74, 0.14)",
    accent: "#4f7fb8",
    shadow: "rgba(79, 127, 184, 0.16)",
  },
  {
    id: "gentle-rose",
    name: "Gentle Rose",
    arabicName: "الزهري الناعم",
    surface: "#fff1f7",
    text: "#4d2d3f",
    panel: "#fff8fc",
    border: "rgba(77, 45, 63, 0.14)",
    accent: "#b66f8f",
    shadow: "rgba(182, 111, 143, 0.18)",
  },
  {
    id: "eco-green",
    name: "Eco Green",
    arabicName: "الأخضر المريح للعين",
    surface: "#edf7e8",
    text: "#28442d",
    panel: "#f7fcf3",
    border: "rgba(40, 68, 45, 0.14)",
    accent: "#5d8a57",
    shadow: "rgba(93, 138, 87, 0.16)",
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    arabicName: "الأرجواني الفاخر",
    surface: "#f3ebff",
    text: "#3f2d56",
    panel: "#fbf7ff",
    border: "rgba(63, 45, 86, 0.14)",
    accent: "#7a4fb2",
    shadow: "rgba(122, 79, 178, 0.18)",
  },
];

const fontSizeOptions = ["80%", "90%", "100%", "110%", "120%", "130%", "140%"];
const lineHeightOptions = ["140%", "150%", "160%"];
const storageKeys = {
  font: "reader-font",
  theme: "reader-theme",
  fontSize: "reader-font-size",
  lineHeight: "reader-line-height",
};

function getDefaultSettings(): ReaderSettings {
  return {
    font: "reem-kufi",
    theme: "default-light",
    fontSize: "100%",
    lineHeight: "150%",
  };
}

function getStoredSettings(): ReaderSettings | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedFont = window.localStorage.getItem(storageKeys.font);
  const storedTheme = window.localStorage.getItem(storageKeys.theme);
  const storedFontSize = window.localStorage.getItem(storageKeys.fontSize);
  const storedLineHeight = window.localStorage.getItem(storageKeys.lineHeight);

  if (!storedFont && !storedTheme && !storedFontSize && !storedLineHeight) {
    return null;
  }

  return {
    font: storedFont ?? getDefaultSettings().font,
    theme: storedTheme ?? getDefaultSettings().theme,
    fontSize: storedFontSize ?? getDefaultSettings().fontSize,
    lineHeight: storedLineHeight ?? getDefaultSettings().lineHeight,
  };
}

export default function ReaderPanel({ locale, children }: ReaderPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    const stored = getStoredSettings();
    return stored ?? getDefaultSettings();
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(storageKeys.font, settings.font);
    window.localStorage.setItem(storageKeys.theme, settings.theme);
    window.localStorage.setItem(storageKeys.fontSize, settings.fontSize);
    window.localStorage.setItem(storageKeys.lineHeight, settings.lineHeight);
  }, [settings]);

  const activeFont = useMemo(
    () => fontOptions.find((font) => font.id === settings.font) ?? fontOptions[0],
    [settings.font]
  );

  const activeTheme = useMemo(
    () => themeOptions.find((theme) => theme.id === settings.theme) ?? themeOptions[0],
    [settings.theme]
  );

  const articleStyles = useMemo<CSSProperties>(
    () => ({
      backgroundColor: activeTheme.surface,
      color: activeTheme.text,
      borderColor: activeTheme.border,
      transition: "background-color 0.5s ease, color 0.5s ease",
    }),
    [activeTheme]
  );

  const panelStyles = useMemo<CSSProperties>(
    () => ({
      backgroundColor: activeTheme.panel,
      color: activeTheme.text,
      borderColor: activeTheme.border,
      transition: "background-color 0.5s ease, color 0.5s ease",
    }),
    [activeTheme]
  );

  const bodyStyles = useMemo<CSSProperties>(
    () => ({
      fontFamily: activeFont.family,
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      transition: "font-size 0.35s ease, line-height 0.35s ease, font-family 0.35s ease",
    }),
    [activeFont.family, settings.fontSize, settings.lineHeight]
  );

  const isArabic = locale === "ar";

  return (
    <div className="relative min-h-screen" dir={isArabic ? "rtl" : "ltr"} style={{ backgroundColor: activeTheme.surface, color: activeTheme.text }}>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-label={isArabic ? "فتح لوحة القراءة" : "Open reader panel"}
        aria-pressed={isOpen}
        className={`fixed bottom-5 z-50 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-foreground text-background shadow-2xl transition-transform duration-500 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 ${isArabic ? "start-5" : "end-5"}`}
        style={{
          background: `linear-gradient(135deg, ${activeTheme.accent}, ${activeTheme.panel})`,
          color: activeTheme.text,
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        }}
      >
        <svg
          viewBox="0 0 64 64"
          aria-hidden="true"
          className="h-7 w-7"
          fill="currentColor"
        >
          <path d="M18 10c9 0 16 7 16 16v6c0 2 1 5 3 8l8 10c2 2 2 5 1 8l-2 5c-1 2-3 3-5 3H25c-8 0-14-6-14-14v-2c0-4 2-7 5-10l3-2V10Zm30 2c7 0 12 5 12 12v4c0 5-3 9-7 10-2 0-4 2-4 4v3c0 1-1 2-2 2h-3c-2 0-3-1-3-3v-6c0-4 2-8 5-10l7-2v-4c0-2-1-3-3-3H48Z" />
        </svg>
      </button>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div
          className="rounded-[2rem] border border-white/40 bg-white/70 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.14)] backdrop-blur-md transition-colors duration-500 md:p-10"
          style={{ ...articleStyles, ...bodyStyles }}
        >
          {children}
        </div>
      </div>

      <aside
        className={`fixed inset-y-0 z-40 flex w-full max-w-md flex-col border-s bg-white/95 p-6 shadow-2xl backdrop-blur-xl transition-transform duration-500 ${isArabic ? "start-0" : "end-0"} ${isOpen ? "translate-x-0" : isArabic ? "-translate-x-full" : "translate-x-full"}`}
        style={panelStyles}
        aria-label={isArabic ? "لوحة القراءة" : "Reader preferences"}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-foreground/60">
              {isArabic ? "خ" : "Reader"}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {isArabic ? "لوحة القراءة" : "Reading Panel"}
            </h2>
          </div>
          <button
            type="button"
            className="rounded-full border border-black/10 px-3 py-1 text-sm transition hover:scale-105"
            onClick={() => setIsOpen(false)}
          >
            {isArabic ? "إغلاق" : "Close"}
          </button>
        </div>

        <div className="mt-8 space-y-8 overflow-y-auto pe-1">
          <section>
            <h3 className="text-lg font-semibold">
              {isArabic ? "الخطوط" : "Typography"}
            </h3>
            <div className="mt-4 space-y-3">
              {fontOptions.map((font) => (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => setSettings((current) => ({ ...current, font: font.id }))}
                  className={`w-full rounded-2xl border p-4 text-start transition ${settings.font === font.id ? "border-primary/60 shadow-sm" : "border-black/10"}`}
                  style={{ backgroundColor: settings.font === font.id ? activeTheme.accent + "16" : "transparent" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{font.name}</p>
                      <p className="mt-1 text-sm text-foreground/70">{font.description}</p>
                    </div>
                    {settings.font === font.id ? <span className="text-lg">✓</span> : null}
                  </div>
                  <p className="mt-3 text-lg" style={{ fontFamily: font.family }}>
                    {font.preview}
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold">
              {isArabic ? "الألوان" : "Themes"}
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {themeOptions.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSettings((current) => ({ ...current, theme: theme.id }))}
                  className="flex flex-col items-center rounded-2xl border border-black/10 p-3 transition hover:scale-105"
                  style={{ backgroundColor: theme.panel }}
                >
                  <div className="flex items-center justify-center rounded-full border border-black/10 p-2" style={{ backgroundColor: theme.surface }}>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: theme.accent, color: theme.panel }}>
                      {settings.theme === theme.id ? "✓" : ""}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium">{isArabic ? theme.arabicName : theme.name}</p>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold">
              {isArabic ? "التحكم في القراءة" : "Reading Controls"}
            </h3>
            <div className="mt-4 space-y-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-medium" htmlFor="font-size">
                    {isArabic ? "حجم الخط" : "Font Size"}
                  </label>
                  <span className="text-sm text-foreground/70">{settings.fontSize}</span>
                </div>
                <input
                  id="font-size"
                  type="range"
                  min="0"
                  max={fontSizeOptions.length - 1}
                  value={fontSizeOptions.indexOf(settings.fontSize)}
                  onChange={(event) => {
                    const next = fontSizeOptions[Number(event.target.value)];
                    setSettings((current) => ({ ...current, fontSize: next }));
                  }}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-medium" htmlFor="line-height">
                    {isArabic ? "تباعد السطور" : "Line Height"}
                  </label>
                  <span className="text-sm text-foreground/70">{settings.lineHeight}</span>
                </div>
                <div className="flex gap-2">
                  {lineHeightOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSettings((current) => ({ ...current, lineHeight: option }))}
                      className={`flex-1 rounded-full border px-3 py-2 text-sm transition ${settings.lineHeight === option ? "border-primary/60 bg-primary/10" : "border-black/10"}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </aside>

      <div className="pointer-events-none fixed inset-0 bg-black/0 transition duration-500" style={{ backgroundColor: isOpen ? "rgba(15, 23, 42, 0.24)" : "transparent" }} />
    </div>
  );
}
