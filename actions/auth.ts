"use server";

import { getServerSession } from "@/lib/auth";

const ADMIN_EDITOR_ROLES = new Set(["ADMIN", "EDITOR"]);
const ADMIN_MODERATOR_ROLES = new Set(["ADMIN", "MODERATOR"]);

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

/**
 * Generate TOTP secret for two-factor authentication setup.
 * Placeholder for phase 3a implementation - MFA enrollment flow.
 *
 * @throws {Error} if user is not authenticated or lacks ADMIN role
 * @returns Promise with generated secret (encrypted in production)
 */
export async function generateTOTPSecret() {
  const session = await requireAdminOrEditor();

  if (!session?.user?.email) {
    throw new Error("User email required for TOTP setup");
  }

  // TODO: Phase 3a implementation
  // 1. Generate TOTP secret using speakeasy/otplib
  // 2. Encrypt secret before storage (never store plaintext)
  // 3. Return QR code URI for authenticator app enrollment
  // 4. Validate with database transaction

  throw new Error("TOTP setup not yet implemented");
}

/**
 * Verify TOTP token for two-factor authentication.
 * Placeholder for phase 3a implementation - MFA verification flow.
 *
 * @param _token - 6-digit TOTP token from authenticator app
 * @throws {Error} if token is invalid or user lacks MFA setup
 * @returns Promise<boolean> indicating verification success
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function verifyTOTPToken(_token: string): Promise<boolean> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error("Unauthenticated");
  }

  // TODO: Phase 3a implementation
  // 1. Retrieve user's encrypted TOTP secret from database
  // 2. Decrypt secret (production: use encryption service)
  // 3. Verify token window (±30 seconds per RFC 6238)
  // 4. Prevent token replay by tracking verified tokens
  // 5. Return verification result

  throw new Error("TOTP verification not yet implemented");
}

/**
 * Enable two-factor authentication for user account.
 * Placeholder for phase 3a implementation.
 *
 * @param _verificationToken - validated TOTP token confirming setup
 * @throws {Error} if verification fails or user lacks ADMIN role
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function enableTwoFactor(_verificationToken: string) {
  const session = await requireAdminOrEditor();

  if (!session?.user?.id) {
    throw new Error("User ID required");
  }

  // TODO: Phase 3a implementation
  // 1. Verify TOTP token matches stored secret
  // 2. Update user.twoFactorEnabled flag in database
  // 3. Audit log: MFA enabled by user
  // 4. Return success confirmation

  throw new Error("MFA enablement not yet implemented");
}

/**
 * Disable two-factor authentication for user account.
 * Placeholder for phase 3a implementation.
 *
 * @throws {Error} if user lacks ADMIN role or MFA not enabled
 */
export async function disableTwoFactor() {
  const session = await requireAdminOrEditor();

  if (!session?.user?.id) {
    throw new Error("User ID required");
  }

  // TODO: Phase 3a implementation
  // 1. Clear user.twoFactorSecret and set twoFactorEnabled = false
  // 2. Invalidate all active sessions for security
  // 3. Audit log: MFA disabled by user
  // 4. Notify user of MFA removal via email

  throw new Error("MFA disablement not yet implemented");
}

