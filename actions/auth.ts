"use server";

import db from "@/lib/db";
import { getServerSession } from "@/lib/auth";
import { encryptMfaSecret, decryptMfaSecret } from "@/lib/mfa-crypto";
import { generateTotpSecret, verifyTotpToken, generateQrCodeDataUrl, isValidTokenFormat } from "@/lib/totp";

const ADMIN_EDITOR_ROLES = new Set(["ADMIN", "EDITOR"]);
const ADMIN_MODERATOR_ROLES = new Set(["ADMIN", "MODERATOR"]);
const ADMIN_ROLE = "ADMIN";

export async function requireAdminOrEditor() {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = String((session.user as any)?.role ?? "").toUpperCase();

  if (!ADMIN_EDITOR_ROLES.has(role)) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireAdminOrModerator() {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = String((session.user as any)?.role ?? "").toUpperCase();

  if (!ADMIN_MODERATOR_ROLES.has(role)) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireAdmin() {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = String((session.user as any)?.role ?? "").toUpperCase();

  if (role !== ADMIN_ROLE) {
    throw new Error("Unauthorized");
  }

  return session;
}

/**
 * Generate a new TOTP secret for MFA setup.
 * Returns encrypted secret (stored in DB) and QR code for scanning.
 * Does NOT enable MFA yet—requires verification via verifyMfaSetup.
 */
export async function generateMfaSecret(): Promise<{
  qrCode: string;
  manualEntry: string;
}> {
  const session = await requireAdmin();

  if (!session?.user?.email) {
    throw new Error("User email required for MFA setup");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session.user as any)?.id;
  if (!userId) {
    throw new Error("User ID required");
  }

  const { secret, otpauth_url } = generateTotpSecret(session.user.email);

  try {
    const encrypted = encryptMfaSecret(secret);

    await db.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: encrypted,
        twoFactorEnabled: false,
      },
    });

    const qrCode = await generateQrCodeDataUrl(otpauth_url);

    return {
      qrCode,
      manualEntry: secret,
    };
  } catch {
    throw new Error("Failed to generate MFA secret");
  }
}

/**
 * Verify TOTP code during initial MFA setup.
 * If valid, enables MFA. If invalid, keeps secret but MFA disabled.
 */
export async function verifyMfaSetup(token: string): Promise<void> {
  if (!isValidTokenFormat(token)) {
    throw new Error("Invalid token format");
  }

  const session = await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session.user as any)?.id;
  if (!userId) {
    throw new Error("User ID required");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { twoFactorSecret: true, twoFactorEnabled: true },
  });

  if (!user || !user.twoFactorSecret || user.twoFactorEnabled) {
    throw new Error("MFA setup not in progress or already enabled");
  }

  try {
    const decrypted = decryptMfaSecret(user.twoFactorSecret);
    const valid = verifyTotpToken(decrypted, token);

    if (!valid) {
      throw new Error("Invalid TOTP code");
    }

    await db.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid TOTP code") {
      throw error;
    }
    throw new Error("Failed to verify MFA setup");
  }
}

/**
 * Verify TOTP code during login (MFA challenge).
 * On success, marks the session as MFA-verified.
 */
export async function verifyMfaCode(token: string): Promise<void> {
  if (!isValidTokenFormat(token)) {
    throw new Error("Invalid token format");
  }

  const session = await getServerSession();

  if (!session?.user?.id || !session.mfaVerifiedAt === undefined) {
    throw new Error("Invalid session state");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorSecret: true, twoFactorEnabled: true },
  });

  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new Error("MFA not enabled for user");
  }

  try {
    const decrypted = decryptMfaSecret(user.twoFactorSecret);
    const valid = verifyTotpToken(decrypted, token);

    if (!valid) {
      throw new Error("Invalid TOTP code");
    }

    // Update session with MFA verification timestamp
    const cookieStore = await (await import("next/headers")).cookies();
    const sessionToken = cookieStore.get("authjs.session-token")?.value;

    if (sessionToken) {
      await db.session.update({
        where: { sessionToken },
        data: { mfaVerifiedAt: new Date() },
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid TOTP code") {
      throw error;
    }
    throw new Error("Failed to verify MFA code");
  }
}

/**
 * Disable MFA for the current user.
 * Clears the encrypted secret and disables the flag.
 */
export async function disableMfa(): Promise<void> {
  const session = await requireAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (session.user as any)?.id;
  if (!userId) {
    throw new Error("User ID required");
  }

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: null,
        twoFactorEnabled: false,
      },
    });

    await db.session.deleteMany({
      where: { userId },
    });
  } catch {
    throw new Error("Failed to disable MFA");
  }
}

/**
 * Logout the current session securely.
 * Deletes the session from the database.
 */
export async function logoutSession(): Promise<void> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return;
  }

  try {
    const cookieStore = await (await import("next/headers")).cookies();
    const sessionToken = cookieStore.get("authjs.session-token")?.value;

    if (sessionToken) {
      await db.session.delete({
        where: { sessionToken },
      });
    }
  } catch {
    // Silently fail—session already deleted or doesn't exist
  }
}

/**
 * Mark the current session as idle-expired.
 * Used by idle timeout provider to invalidate on client side too.
 */
export async function expireIdleSession(): Promise<void> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return;
  }

  try {
    const cookieStore = await (await import("next/headers")).cookies();
    const sessionToken = cookieStore.get("authjs.session-token")?.value;

    if (sessionToken) {
      // Set expiration to now to immediately invalidate
      await db.session.update({
        where: { sessionToken },
        data: { expires: new Date() },
      });
    }
  } catch {
    // Silently fail
  }
}
