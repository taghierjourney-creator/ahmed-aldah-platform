"use server";

import type { Prisma } from "@prisma/client";

import db from "@/lib/db";

const SENSITIVE_KEY_PATTERNS = [
  /token/i,
  /secret/i,
  /password/i,
  /email/i,
  /phone/i,
  /ssn/i,
  /dob/i,
  /credit/i,
  /card/i,
  /cvv/i,
  /pin/i,
  /mfa/i,
  /verification/i,
  /session/i,
];

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

function scrubValue(value: unknown): Prisma.JsonValue | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value as Prisma.JsonValue;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => scrubValue(item)) as Prisma.JsonArray;
  }

  if (typeof value === "object") {
    const safeObject: Prisma.JsonObject = {};

    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      if (isSensitiveKey(key)) {
        continue;
      }

      const scrubbed = scrubValue(raw);
      if (scrubbed !== null) {
        safeObject[key] = scrubbed;
      }
    }

    return safeObject;
  }

  return null;
}

export async function createAuditLogEntry({
  userId,
  action,
  entity,
  entityId,
  beforeState,
  afterState,
}: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  beforeState?: unknown;
  afterState?: unknown;
}): Promise<void> {
  await db.auditLogEntry.create({
    data: {
      userId: userId ?? null,
      action,
      entity,
      entityId: entityId ?? null,
      beforeState: scrubValue(beforeState) ?? undefined,
      afterState: scrubValue(afterState) ?? undefined,
    },
  });
}
