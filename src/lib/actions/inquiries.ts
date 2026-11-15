"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/server/db";
import { requireAdminOrThrow } from "@/lib/server/auth";
import { inquirySchema } from "@/lib/validation";
import { unmapInquiryStatus } from "@/lib/server/queries";
import type { InquiryStatus } from "@/lib/types";

const inquiryAttempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function throttle(key: string): boolean {
  const now = Date.now();
  const entry = inquiryAttempts.get(key);
  if (!entry || entry.resetAt < now) {
    inquiryAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

/** Public inquiry — no admin session required; validated + throttled. */
export async function submitInquiryAction(input: unknown) {
  const h = await headers();
  const key = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (throttle(key)) {
    return { ok: false as const, error: "Too many messages in a short period. Please try again in a minute." };
  }

  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    // Honeypot rejection is silent — bots think they succeeded
    if ((input as { website?: string })?.website) return { ok: true as const };
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid submission." };
  }
  const d = parsed.data;
  await prisma.inquiry.create({
    data: {
      name: d.name,
      email: d.email.toLowerCase(),
      phone: d.phone || null,
      service: d.service,
      location: d.location || null,
      description: d.brief,
      status: "NEW",
      isRead: false,
    },
  });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}

/** Mark an inquiry as read (opening it) and stamp the reader. */
export async function markInquiryReadAction(id: string) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }

  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry) return { ok: false as const, error: "Inquiry not found." };
  if (inquiry.isRead) return { ok: true as const, alreadyRead: true };

  await prisma.inquiry.update({ where: { id }, data: { isRead: true } });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}

/** Admin — advance an inquiry through its lifecycle (also marks it read). */
export async function setInquiryStatusAction(id: string, status: InquiryStatus) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }

  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry) return { ok: false as const, error: "Inquiry not found." };

  await prisma.inquiry.update({ where: { id }, data: { status: unmapInquiryStatus(status) as never, isRead: true } });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}
