"use server";

import { Role } from "@prisma/client";

import db from "@/lib/db";
import { getServerSession } from "@/lib/auth";

export async function requireAdminSession() {
  const session = await getServerSession();
  const role = String(session?.user?.role ?? "").toUpperCase();
  if (role !== "ADMIN") throw new Error("Unauthorized");
  return session;
}

export async function listUsers() {
  await requireAdminSession();
  return db.user.findMany({ select: { id: true, name: true, email: true, role: true, canPublish: true, avatar: true } });
}

export async function updateUserPublishPermission(userId: string, canPublish: boolean) {
  await requireAdminSession();
  return db.user.update({ where: { id: userId }, data: { canPublish } });
}

export async function updateUserRole(userId: string, role: string) {
  await requireAdminSession();
  const allowed = ["USER", "AUTHOR", "EDITOR", "MODERATOR", "ADMIN", "CLIENT"];
  if (!allowed.includes(role)) throw new Error("Invalid role");
  return db.user.update({ where: { id: userId }, data: { role: role as Role } });
}
