import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export type Role = "ADMIN" | "EDITOR" | "MODERATOR" | "USER" | "CLIENT";

// Check if the user has at least one of the required roles. Fail-closed: return false if no session or role.
export async function hasRole(request: Request, allowed: Role[] = []): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = (await getServerSession(authOptions as unknown as any)) as { user?: { role?: string } } | null;
  if (!session || !session.user) return false;
  const role = session.user.role as Role | undefined;
  if (!role) return false;
  return allowed.includes(role as Role);
}

// Utility to require role on server actions — throws to fail-closed
export async function requireRole(request: Request, allowed: Role[] = []) {
  const ok = await hasRole(request, allowed);
  if (!ok) {
    const err = new Error("Access denied") as Error & { status?: number };
    // attach status for API handlers
    err.status = 403;
    throw err;
  }
}
