import { getServerSession } from "@/lib/auth";

export type Role = "ADMIN" | "EDITOR" | "MODERATOR" | "USER" | "CLIENT";

// Check if the user has at least one of the required roles. Fail-closed: return false if no session or role.
export async function hasRole(_request: Request | undefined, allowed: Role[] = []): Promise<boolean> {
  const session = await getServerSession();
  if (!session?.user?.role) return false;
  const role = session.user.role.toUpperCase() as Role;
  return allowed.includes(role);
}

// Utility to require role on server actions — throws to fail-closed
export async function requireRole(_request: Request | undefined, allowed: Role[] = []) {
  const ok = await hasRole(_request, allowed);
  if (!ok) {
    const err = new Error("Access denied") as Error & { status?: number };
    // attach status for API handlers
    err.status = 403;
    throw err;
  }
}
