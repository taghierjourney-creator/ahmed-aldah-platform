import { Auth } from "@auth/core";
import type { AuthConfig } from "@auth/core";
import type { Session, User } from "@auth/core/types";
import type { AdapterUser } from "@auth/core/adapters";
import GitHub from "@auth/core/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import db from "./lib/db";

type AuthUser = User | AdapterUser | { id: string; email?: string; role?: string };
type SessionUser = Session["user"] & { id: string; role: string | null };

export const authOptions: AuthConfig = {
  adapter: PrismaAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }: { session: Session; user: AuthUser }) {
      if (!session?.user) return session;

      const role = (user as { role?: string }).role;
      const id = (user as { id: string }).id;
      const sessionUser: SessionUser = { ...session.user, id, role: role ?? null };
      session.user = sessionUser;
      return session;
    },
    async signIn({ user }: { user: AuthUser }) {
      if (!user?.email) return false;
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function auth(request: Request) {
  return Auth(request, authOptions);
}
