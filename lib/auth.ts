"use server";

import { cookies } from "next/headers";
import type { Session } from "next-auth";
import db from "@/lib/db";

/**
 * Get the current server session with MFA verification status.
 * Retrieves session from database using session token from cookies.
 *
 * @returns Current session with user data or null if not authenticated
 */
export async function getServerSession(): Promise<(Session & { mfaVerifiedAt?: Date }) | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("authjs.session-token")?.value;

    if (!sessionToken) {
      return null;
    }

    const session = await db.session.findUnique({
      where: { sessionToken },
      include: {
        user: true,
      },
    });

    if (!session) {
      return null;
    }

    if (session.expires < new Date()) {
      await db.session.delete({ where: { id: session.id } });
      return null;
    }

    return {
      user: session.user,
      expires: session.expires.toISOString(),
      mfaVerifiedAt: session.mfaVerifiedAt ?? undefined,
    };
  } catch {
    return null;
  }
}


