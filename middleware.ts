import { NextRequest, NextResponse } from "next/server";

export const runtime = "experimental-edge";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length >= 2) {
    const [locale, ...rest] = segments;
    const normalizedLocale = locale.toLowerCase();
    const supportedLocales = new Set(["en", "fr", "ar"]);

    if (supportedLocales.has(normalizedLocale)) {
      const oldSlug = rest.join("/");

      if (oldSlug) {
        try {
          // Query the server-side API route which uses the Prisma client (node runtime)
          const apiUrl = new URL(`/api/redirects?locale=${encodeURIComponent(
            normalizedLocale,
          )}&oldSlug=${encodeURIComponent(oldSlug)}`, request.url);

          const res = await fetch(apiUrl.toString(), {
            method: "GET",
            headers: { "x-middleware": "1" },
            cache: "no-store",
          });

          if (res.ok) {
            const body = await res.json();
            const newSlug: string | undefined = body?.newSlug;

            if (typeof newSlug === "string" && newSlug.length > 0) {
              const targetUrl = newSlug.startsWith("/")
                ? newSlug
                : `/${normalizedLocale}/${newSlug}`;

              return NextResponse.redirect(new URL(targetUrl, request.url), 301);
            }
          }
        } catch {
          // Fail-open: do not block requests on redirect lookup errors
          // but do not expose details here.
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:locale(en|fr|ar)/:path*"],
};
