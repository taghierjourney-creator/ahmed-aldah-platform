"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";

const ADMIN_EDITOR_ROLES = new Set(["ADMIN", "EDITOR"]);

export async function requireAdminOrEditor() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await getServerSession(authOptions as unknown as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = String((session as any)?.user?.role ?? "").toUpperCase();

  if (!ADMIN_EDITOR_ROLES.has(role)) {
    throw new Error("Unauthorized");
  }

  return session;
}
