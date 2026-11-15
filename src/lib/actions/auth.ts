"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/server/db";
import {
  createSession,
  destroySession,
  hashPassword,
  requireAdminOrThrow,
  verifyPassword,
} from "@/lib/server/auth";
import { logActivity } from "@/lib/server/activity";
import { loginSchema, passwordSchema } from "@/lib/validation";
import { z } from "zod";

/* ————— Naive in-memory throttle (dev-grade; use edge rate limiting in prod) ————— */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

async function clientKey() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

function throttled(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

/* ————— Login ————— */
export async function loginAction(input: { email: string; password: string }) {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Enter a valid email and password." };
  }
  const key = await clientKey();
  if (throttled(key)) {
    return { ok: false as const, error: "Too many attempts. Wait a minute and try again." };
  }

  const email = parsed.data.email.toLowerCase();
  const admin = await prisma.adminUser.findUnique({ where: { email } });

  // Constant-shape failure — do not reveal whether the account exists
  if (!admin || !verifyPassword(parsed.data.password, admin.passwordHash)) {
    return { ok: false as const, error: "Invalid email or password." };
  }

  await createSession(admin.id);
  await logActivity({
    actorType: "ADMIN",
    adminId: admin.id,
    action: "Admin signed in",
    detail: email,
  });
  redirect("/admin/dashboard");
}

export async function logoutAction() {
  const admin = await prisma.adminUser.findFirst({ orderBy: { createdAt: "asc" } });
  await destroySession();
  if (admin) {
    await logActivity({ actorType: "ADMIN", adminId: admin.id, action: "Admin signed out", detail: admin.email });
  }
  redirect("/admin/login");
}

/* ————— Change password ————— */
export async function changePasswordAction(input: { currentPassword: string; newPassword: string }) {
  let admin;
  try {
    admin = await requireAdminOrThrow();
  } catch {
    return { ok: false as const, error: "Not authenticated." };
  }

  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid password." };
  }

  const record = await prisma.adminUser.findUnique({ where: { id: admin.id } });
  if (!record || !verifyPassword(parsed.data.currentPassword, record.passwordHash)) {
    return { ok: false as const, error: "Current password is incorrect." };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: hashPassword(parsed.data.newPassword) },
  });
  // Invalidate all other sessions
  await prisma.session.deleteMany({ where: { adminId: admin.id } });
  await logActivity({ actorType: "ADMIN", adminId: admin.id, action: "Password changed", detail: "All sessions revoked" });

  // Re-create the current session so the user stays signed in
  await createSession(admin.id);
  return { ok: true as const };
}
