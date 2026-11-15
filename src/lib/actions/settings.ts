"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/server/db";
import { requireAdminOrThrow } from "@/lib/server/auth";
import { logActivity } from "@/lib/server/activity";

const studioProfileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40),
  locations: z.string().trim().max(200),
});

const linkDefaultsSchema = z.object({
  defaultExpiry: z.enum(["never", "7", "30", "90"]),
  defaultAccessMode: z.enum(["RESTRICTED_PREVIEW", "FULL_ACCESS"]),
});

const notificationPrefsSchema = z.object({
  inquiryAlerts: z.boolean(),
  clientLinkOpened: z.boolean(),
  downloadCompleted: z.boolean(),
  weeklyDigest: z.boolean(),
});

async function setSetting(key: string, value: unknown, adminId: string, action: string) {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value: JSON.stringify(value) },
    update: { value: JSON.stringify(value) },
  });
  await logActivity({ actorType: "ADMIN", adminId, action, detail: key });
  revalidatePath("/admin/settings");
}

export async function saveStudioProfileAction(input: unknown) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }
  const parsed = studioProfileSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Check the studio details — email must be valid." };
  await setSetting("studio.profile", parsed.data, admin.id, "Studio profile updated");
  return { ok: true as const };
}

export async function saveLinkDefaultsAction(input: unknown) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }
  const parsed = linkDefaultsSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid link defaults." };
  await setSetting("links.defaults", parsed.data, admin.id, "Link defaults updated");
  return { ok: true as const };
}

export async function saveNotificationPrefsAction(input: unknown) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }
  const parsed = notificationPrefsSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid notification preferences." };
  await setSetting("notifications.prefs", parsed.data, admin.id, "Notification preferences updated");
  return { ok: true as const };
}

