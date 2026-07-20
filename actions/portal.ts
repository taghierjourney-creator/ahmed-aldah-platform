"use server";

import type { RequestStatus } from "@prisma/client";

import { getServerSession } from "@/lib/auth";
import db from "@/lib/db";

const MAX_REQUEST_ID_LENGTH = 64;
const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

type ClientRequestSummary = {
  id: string;
  title: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
};

type ClientRequestDocument = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: Date;
};

type ClientRequestDetails = {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  createdAt: Date;
  updatedAt: Date;
  documents: ClientRequestDocument[];
};

function normalizeRequestId(id: string): string {
  const normalized = typeof id === "string" ? id.trim() : "";

  if (
    !normalized ||
    normalized.length > MAX_REQUEST_ID_LENGTH ||
    !REQUEST_ID_PATTERN.test(normalized)
  ) {
    throw new Error("Unauthorized Access");
  }

  return normalized;
}

type AuthenticatedSession = NonNullable<Awaited<ReturnType<typeof getServerSession>>> & {
  user: { id: string };
};

async function requireAuthenticatedSession(): Promise<AuthenticatedSession> {
  const session = await getServerSession();

  if (!session?.user?.id) {
    throw new Error("Unauthorized Access");
  }

  return session as AuthenticatedSession;
}

export async function getClientRequests(): Promise<ClientRequestSummary[]> {
  const session = await requireAuthenticatedSession();

  return db.clientRequest.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getClientRequestById(
  id: string,
): Promise<ClientRequestDetails> {
  const requestId = normalizeRequestId(id);
  const session = await requireAuthenticatedSession();

  const request = await db.clientRequest.findFirst({
    where: {
      id: requestId,
      userId: session.user.id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      documents: {
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          size: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!request) {
    throw new Error("Unauthorized Access");
  }

  return request;
}
