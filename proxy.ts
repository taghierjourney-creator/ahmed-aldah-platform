import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if accessing admin routes (except MFA setup/verify)
  const adminRouteMatch = pathname.match(/^\/([a-z]{2})\/admin\/(.*?)(?:\/|$)/);
  if (adminRouteMatch) {
    const locale = adminRouteMatch[1];
    const adminRoute = adminRouteMatch[2];

    // Exceptions: MFA setup and verify routes don't require prior authentication
    if (!adminRoute.startsWith("mfa-setup") && !adminRoute.startsWith("mfa-verify")) {
      // Check for session token
      const sessionToken = request.cookies.get("authjs.session-token")?.value;

      if (!sessionToken) {
        const callbackUrl = encodeURIComponent(pathname);
        return NextResponse.redirect(
          new URL(`/${locale}/admin/mfa-verify?callbackUrl=${callbackUrl}`, request.url),
        );
      }
    }
  }

  // Proceed with next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/", "/(en|fr)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
