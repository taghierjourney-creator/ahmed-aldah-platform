"use client";

import React from "react";

type ErrorProps = {
  error: Error;
  reset: () => void;
};

export default function GlobalError({ error, reset }: ErrorProps) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-background text-foreground">
        <main className="mx-auto max-w-3xl p-8">
          <section className="rounded-2xl bg-card/90 p-8 shadow-md">
            <h1 className="text-2xl font-semibold">عذراً</h1>
            <p className="mt-4 text-base text-foreground/70">
              عذراً، حدث خطأ غير متوقع أثناء معالجة طلبك الحركي. تم إرسال تقرير تشخيصي تلقائي لفريق الدعم لحل المشكلة.
            </p>

            <div className="mt-6 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => reset()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-95"
              >
                إعادة المحاولة
              </button>

              <details className="text-sm text-foreground/60">
                <summary className="cursor-pointer">تفاصيل الخطأ (للمطورين)</summary>
                <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-foreground/60">{String(error?.message ?? "غير متوفر")}</pre>
              </details>
            </div>
          </section>
        </main>
      </body>
    </html>
  );
}
