"use server";

import { getServerSession } from "@/lib/auth";
import db from "@/lib/db";

const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const BUCKET_NAME = "client-documents";
const SIGNED_URL_EXPIRES = 15 * 60; // 15 minutes

type DownloadResult = {
  url: string;
  expiresAt: string;
};

type AuthenticatedSession = NonNullable<Awaited<ReturnType<typeof getServerSession>>> & {
  user: { id: string; role?: string };
};

function normalizeDocumentId(id: string): string {
  const normalized = typeof id === "string" ? id.trim() : "";

  if (!normalized || normalized.length > 64 || !REQUEST_ID_PATTERN.test(normalized)) {
    throw new Error("Unauthorized Access");
  }

  return normalized;
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Unauthorized Access");
  }

  return { url, serviceRoleKey };
}

async function requireAuthenticatedSession(): Promise<AuthenticatedSession> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error("Unauthorized Access");
  }

  return session as AuthenticatedSession;
}

export async function getDownloadUrl(documentId: string): Promise<DownloadResult> {
  const normalizedDocumentId = normalizeDocumentId(documentId);
  const session = await requireAuthenticatedSession();

  const document = await db.document.findUnique({
    where: { id: normalizedDocumentId },
    select: {
      storagePath: true,
      userId: true,
    },
  });

  if (!document) {
    throw new Error("Unauthorized Access");
  }

  const role = String(session.user.role ?? "").toUpperCase();
  const isPrivileged = role === "ADMIN" || role === "MODERATOR";
  const isOwner = document.userId === session.user.id;

  if (!isOwner && !isPrivileged) {
    throw new Error("Unauthorized Access");
  }

  const { url, serviceRoleKey } = getSupabaseConfig();

  const response = await fetch(
    `${url}/storage/v1/object/sign/${encodeURIComponent(BUCKET_NAME)}/${encodeURIComponent(
      document.storagePath,
    )}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expires_in: SIGNED_URL_EXPIRES }),
    },
  );

  if (!response.ok) {
    throw new Error("Unauthorized Access");
  }

  const payload = (await response.json()) as { signedURL?: string };
  const urlResult = payload.signedURL;

  if (!urlResult || typeof urlResult !== "string") {
    throw new Error("Unauthorized Access");
  }

  return {
    url: urlResult,
    expiresAt: new Date(Date.now() + SIGNED_URL_EXPIRES * 1000).toISOString(),
  };
}
