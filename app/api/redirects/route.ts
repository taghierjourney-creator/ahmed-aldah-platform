import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import db from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const locale = String(url.searchParams.get("locale") ?? "").toLowerCase();
    const oldSlug = String(url.searchParams.get("oldSlug") ?? "");

    if (!locale || !oldSlug) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const redirectRule = await db.redirectRule.findFirst({
      where: { locale, oldSlug },
      select: { newSlug: true },
    });

    if (!redirectRule) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ newSlug: redirectRule.newSlug });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
