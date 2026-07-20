"use server";

import crypto from "crypto";
import { scanFile } from "@/lib/scanner";
import { getServerSession } from "@/lib/auth";
import db from "@/lib/db";

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const BUCKET_NAME = "client-documents";

type UploadResult = {
  id: string;
  storagePath: string;
  originalName: string;
  mimeType: string;
  size: number;
  requestId: string;
  createdAt: Date;
};

function normalizeRequestId(id: string): string {
  const normalized = typeof id === "string" ? id.trim() : "";

  if (!normalized || normalized.length > 64 || !REQUEST_ID_PATTERN.test(normalized)) {
    throw new Error("Unauthorized Access");
  }

  return normalized;
}

type AuthenticatedSession = NonNullable<Awaited<ReturnType<typeof getServerSession>>> & {
  user: { id: string; role?: string };
};

async function requireAuthenticatedSession(): Promise<AuthenticatedSession> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error("Unauthorized Access");
  }

  return session as AuthenticatedSession;
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Storage service unavailable");
  }

  return { url, serviceRoleKey };
}

async function uploadToSupabase(storagePath: string, body: Uint8Array, mimeType: string) {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const uploadUrl = `${url}/storage/v1/object/${encodeURIComponent(BUCKET_NAME)}/${encodeURIComponent(storagePath)}`;

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
      "Content-Type": mimeType,
      "x-upsert": "false",
    },
    body: body as unknown as BodyInit,
  });

  if (!response.ok) {
    throw new Error("Failed to upload file to storage");
  }

  return true;
}

export async function uploadFile(file: File, requestId: string): Promise<UploadResult> {
  if (!(file instanceof File)) {
    throw new Error("Invalid file upload");
  }

  const normalizedRequestId = normalizeRequestId(requestId);
  const session = await requireAuthenticatedSession();

  const userId = session.user.id;
  const role = String((session.user as { role?: string }).role ?? "").toUpperCase();

  const clientRequest = await db.clientRequest.findUnique({
    where: { id: normalizedRequestId },
    select: { userId: true },
  });

  if (!clientRequest) {
    throw new Error("Unauthorized Access");
  }

  const isOwner = clientRequest.userId === userId;
  const isPrivileged = role === "ADMIN" || role === "MODERATOR";

  if (!isOwner && !isPrivileged) {
    throw new Error("Unauthorized Access");
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("الملف أكبر من الحجم المسموح.");
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("نوع الملف غير مدعوم.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const scanResult = await scanFile(buffer);
  if (!scanResult.safe) {
    throw new Error("الملف يحتوي على تهديد أمني أو فشل فحص الأمان");
  }

  const storagePath = `${normalizedRequestId}/${crypto.randomUUID()}`;

  try {
    await uploadToSupabase(storagePath, new Uint8Array(arrayBuffer), file.type);
  } catch {
    throw new Error("الملف يحتوي على تهديد أمني أو فشل فحص الأمان");
  }

  const document = await db.document.create({
    data: {
      storagePath,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      requestId: normalizedRequestId,
      userId,
    },
  });

  return {
    id: document.id,
    storagePath: document.storagePath,
    originalName: document.originalName,
    mimeType: document.mimeType,
    size: document.size,
    requestId: document.requestId,
    createdAt: document.createdAt,
  };
}
