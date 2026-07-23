import { Auth } from "@auth/core";
import type { AuthConfig } from "@auth/core";
import type { Session, User } from "@auth/core/types";
import type { AdapterUser } from "@auth/core/adapters";
import Google from "@auth/core/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import db from "./lib/db";

type AuthUser = User | AdapterUser | { id: string; email?: string; role?: string };
type SessionUser = Session["user"] & { id: string; role: string | null };

// Session security configuration
const SESSION_MAX_AGE = 24 * 60 * 60; // 24 hours
const SESSION_UPDATE_AGE = 60 * 60; // 1 hour - how often to update session
const SESSION_IDLE_TIMEOUT = 30 * 60; // 30 minutes idle timeout for admin/client portal

export const authOptions: AuthConfig = {
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "database",
    maxAge: SESSION_MAX_AGE,
    updateAge: SESSION_UPDATE_AGE,
  },
  callbacks: {
    async session({ session, user }: { session: Session; user: AuthUser }) {
      if (!session?.user) return session;

      const role = (user as { role?: string }).role;
      const id = (user as { id: string }).id;
      const sessionUser: SessionUser = { ...session.user, id, role: role ?? null };
      session.user = sessionUser;

      // TODO: Phase 3a - Implement idle timeout enforcement
      // Check session last activity timestamp and enforce 30-minute idle limit
      // for ADMIN and CLIENT roles. Track activity in middleware/route handlers.
      // Return session with activity tracking metadata.

      return session;
    },
    async signIn({ user }: { user: AuthUser }) {
      if (!user?.email) return false;

      // TODO: Phase 3a - Enforce MFA for ADMIN users on sign-in
      // Check if user.twoFactorEnabled === true
      // If MFA required, redirect to verification page before session creation
      // Only complete sign-in after successful TOTP verification

      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function auth(request: Request) {
  return Auth(request, authOptions);
}

// Export session timeout constants for use in middleware/client code
export { SESSION_MAX_AGE, SESSION_IDLE_TIMEOUT };
