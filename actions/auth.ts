"use server";

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import db from "@/lib/db";
import { decryptMfaSecret, encryptMfaSecret } from "@/lib/mfa-crypto";
import { generateQrCodeDataUrl, generateTotpSecret, isValidTokenFormat, verifyTotpToken } from "@/lib/totp";
import { sendTransactionalEmail } from "@/lib/email";
import { getServerSession } from "@/lib/auth";

const ADMIN_EDITOR_ROLES = new Set(["ADMIN", "EDITOR"]);
const ADMIN_MODERATOR_ROLES = new Set(["ADMIN", "MODERATOR"]);
const PENDING_MFA_COOKIE_NAME = "mfa-pending-secret";
const PENDING_MFA_COOKIE_MAX_AGE = 60 * 15;
const LOGIN_TOKEN_EXPIRY_SECONDS = 60 * 15;
const SESSION_MAX_AGE = 24 * 60 * 60;
const LOGIN_TOKEN_PATTERN = /^[0-9a-f]{48}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSigningSecret(): string {
  const secret = process.env.MFA_ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("Authentication configuration is incomplete");
  }

  return secret;
}

function signPayload(payload: string): string {
  const signature = createHmac("sha256", getSigningSecret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

function verifySignedPayload(value: string): string | null {
  const delimiterIndex = value.lastIndexOf(".");

  if (delimiterIndex <= 0) {
    return null;
  }

  const payload = value.slice(0, delimiterIndex);
  const signature = value.slice(delimiterIndex + 1);
  const expectedSignature = createHmac("sha256", getSigningSecret()).update(payload).digest("hex");

  try {
    const provided = Buffer.from(signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (provided.length !== expected.length) {
      return null;
    }

    timingSafeEqual(provided, expected);
  } catch {
    return null;
  }

  return payload;
}

async function getAuthenticatedSessionRecord() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("authjs.session-token")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await db.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  if (session.expires < new Date()) {
    await db.session.delete({ where: { id: session.id } });
    return null;
  }

  return session;
}

async function clearPendingMfaCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(PENDING_MFA_COOKIE_NAME);
}

function normalizeEmail(email: string): string {
  return String(email).trim().toLowerCase();
}

function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000"
  ).replace(/\/+$/, "");
}

function getSessionCookieName(): string {
  return "authjs.session-token";
}

async function createSessionCookie(sessionToken: string, expiresInSeconds: number) {
  const cookieStore = await cookies();
  cookieStore.set(getSessionCookieName(), sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: expiresInSeconds,
  });
}

export async function requestLoginLink(email: string, locale: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!EMAIL_PATTERN.test(normalizedEmail)) {
    throw new Error("Authentication failed");
  }

  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new Error("Authentication failed");
  }

  const token = randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + LOGIN_TOKEN_EXPIRY_SECONDS * 1000);

  await db.verificationToken.create({
    data: {
      identifier: normalizedEmail,
      token,
      expires,
    },
  });

  const appUrl = getAppUrl();
  const loginUrl = `${appUrl}/${encodeURIComponent(locale)}/login?token=${encodeURIComponent(token)}`;

  const emailResult = await sendTransactionalEmail({
    to: normalizedEmail,
    subject: "Your secure sign-in link",
    text: `Use this link to sign in: ${loginUrl}

This link expires in 15 minutes. If you did not request this email, please ignore it.`,
  });

  if (!emailResult.ok) {
    throw new Error("Authentication failed");
  }
}

export async function verifyLoginToken(token: string, locale: string): Promise<string> {
  if (!LOGIN_TOKEN_PATTERN.test(token)) {
    throw new Error("Invalid login link");
  }

  const verificationToken = await db.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    throw new Error("Invalid or expired login link");
  }

  const user = await db.user.findUnique({
    where: { email: verificationToken.identifier },
  });

  if (!user) {
    throw new Error("Invalid or expired login link");
  }

  const sessionToken = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await db.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires,
      mfaVerifiedAt: user.twoFactorEnabled ? null : new Date(),
    },
  });

  await createSessionCookie(sessionToken, SESSION_MAX_AGE);
  await db.verificationToken.delete({ where: { token } });

  const role = user.role;
  if (role === "ADMIN" && user.twoFactorEnabled) {
    return `/${locale}/admin/mfa-verify?callbackUrl=/${locale}/admin`;
  }

  if (role === "ADMIN") {
    return `/${locale}/admin`;
  }

  return `/${locale}/portal`;
}

export async function requireAdminOrEditor() {
  const session = await getServerSession();
  const role = String(session?.user?.role ?? "").toUpperCase();

  if (!ADMIN_EDITOR_ROLES.has(role)) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireAdminOrModerator() {
  const session = await getServerSession();
  const role = String(session?.user?.role ?? "").toUpperCase();

  if (!ADMIN_MODERATOR_ROLES.has(role)) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function generateMfaSecret() {
  const session = await getAuthenticatedSessionRecord();

  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const { secret, otpauth_url } = generateTotpSecret(session.user.email);
  const encryptedSecret = encryptMfaSecret(secret);
  const signedSecret = signPayload(encryptedSecret);

  const cookieStore = await cookies();
  cookieStore.set(PENDING_MFA_COOKIE_NAME, signedSecret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PENDING_MFA_COOKIE_MAX_AGE,
  });

  const qrCode = await generateQrCodeDataUrl(otpauth_url);

  return {
    qrCode,
    manualEntry: secret,
  };
}

export async function verifyMfaSetup(token: string) {
  const session = await getAuthenticatedSessionRecord();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!isValidTokenFormat(token)) {
    throw new Error("Invalid MFA code");
  }

  if (session.user.twoFactorEnabled) {
    throw new Error("MFA is already enabled");
  }

  const cookieStore = await cookies();
  const pendingSecret = cookieStore.get(PENDING_MFA_COOKIE_NAME)?.value;

  if (!pendingSecret) {
    throw new Error("MFA setup session expired");
  }

  const signedPayload = verifySignedPayload(pendingSecret);

  if (!signedPayload) {
    throw new Error("Invalid MFA setup session");
  }

  const decryptedSecret = decryptMfaSecret(signedPayload);

  if (!verifyTotpToken(decryptedSecret, token)) {
    throw new Error("Invalid MFA code");
  }

  await db.user.update({
    where: { id: session.user.id },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: signedPayload,
    },
  });

  await clearPendingMfaCookie();

  return { success: true };
}

export async function verifyMfaCode(token: string) {
  const session = await getAuthenticatedSessionRecord();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!isValidTokenFormat(token)) {
    throw new Error("Invalid MFA code");
  }

  if (!session.user.twoFactorEnabled || !session.user.twoFactorSecret) {
    throw new Error("MFA is not enabled");
  }

  const decryptedSecret = decryptMfaSecret(session.user.twoFactorSecret);

  if (!verifyTotpToken(decryptedSecret, token)) {
    throw new Error("Invalid MFA code");
  }

  await db.session.update({
    where: { id: session.id },
    data: {
      mfaVerifiedAt: new Date(),
    },
  });

  return { success: true };
}

export async function expireIdleSession() {
  const session = await getAuthenticatedSessionRecord();

  if (!session) {
    return { success: true };
  }

  await db.session.delete({ where: { id: session.id } });

  const cookieStore = await cookies();
  cookieStore.delete("authjs.session-token");

  return { success: true };
}

export async function logout(locale: string) {
  const session = await getAuthenticatedSessionRecord();

  if (session) {
    await db.session.delete({ where: { id: session.id } });
  }

  const cookieStore = await cookies();
  cookieStore.delete("authjs.session-token");
  cookieStore.delete(PENDING_MFA_COOKIE_NAME);

  redirect(`/${locale}/login`);
}
