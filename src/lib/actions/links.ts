"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/server/db";
import { generateRawToken, hashToken, requireAdminOrThrow } from "@/lib/server/auth";
import { logActivity } from "@/lib/server/activity";
import { linkExpirySchema, type LinkExpiryInput } from "@/lib/validation";

function expiryDate(expiry: LinkExpiryInput): Date | null {
  if (expiry === "never") return null;
  const d = new Date();
  d.setDate(d.getDate() + Number(expiry));
  return d;
}

const expiryLabel = (expiry: LinkExpiryInput) =>
  expiry === "never" ? "until revoked" : `${expiry} days`;

async function assertProject(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true, name: true } });
  return project;
}

/** Generates a link for a project that has no ACTIVE one (idempotent). */
export async function generateLinkAction(projectId: string, expiry: LinkExpiryInput) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }

  const expiryParsed = linkExpirySchema.safeParse(expiry);
  if (!expiryParsed.success) return { ok: false as const, error: "Invalid expiry." };

  const project = await assertProject(projectId);
  if (!project) return { ok: false as const, error: "Project not found." };

  const existing = await prisma.projectAccessLink.findFirst({
    where: { projectId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
  if (existing) {
    return { ok: false as const, error: "An active link already exists — regenerate it instead." };
  }

  const rawToken = generateRawToken();
  const link = await prisma.projectAccessLink.create({
    data: { projectId, tokenHash: hashToken(rawToken), status: "ACTIVE", expiresAt: expiryDate(expiryParsed.data) },
  });
  await logActivity({
    actorType: "ADMIN",
    adminId: admin.id,
    action: "Client link generated",
    detail: `Expiry: ${expiryLabel(expiryParsed.data)}`,
    projectId,
    accessLinkId: link.id,
  });
  revalidatePath("/admin/access-links");
  return { ok: true as const, token: rawToken, linkId: link.id, expiresAt: link.expiresAt?.toISOString() ?? null };
}

/** Revokes the ACTIVE link immediately. */
export async function revokeLinkAction(projectId: string) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }

  const project = await assertProject(projectId);
  if (!project) return { ok: false as const, error: "Project not found." };

  const active = await prisma.projectAccessLink.findFirst({ where: { projectId, status: "ACTIVE" } });
  if (!active) return { ok: false as const, error: "No active link to revoke." };

  await prisma.projectAccessLink.update({
    where: { id: active.id },
    data: { status: "REVOKED", revokedAt: new Date() },
  });
  await logActivity({
    actorType: "ADMIN", adminId: admin.id, action: "Link revoked",
    detail: "Client access revoked immediately", projectId, accessLinkId: active.id,
  });
  revalidatePath("/admin/access-links");
  revalidatePath(`/admin/projects/${projectId}`);
  return { ok: true as const };
}

/** Invalidates every ACTIVE link, then issues a fresh one. */
export async function regenerateLinkAction(projectId: string, expiry: LinkExpiryInput) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }

  const expiryParsed = linkExpirySchema.safeParse(expiry);
  if (!expiryParsed.success) return { ok: false as const, error: "Invalid expiry." };

  const project = await assertProject(projectId);
  if (!project) return { ok: false as const, error: "Project not found." };

  const rawToken = generateRawToken();
  const [, link] = await prisma.$transaction([
    prisma.projectAccessLink.updateMany({
      where: { projectId, status: "ACTIVE" },
      data: { status: "REVOKED", revokedAt: new Date() },
    }),
    prisma.projectAccessLink.create({
      data: { projectId, tokenHash: hashToken(rawToken), status: "ACTIVE", expiresAt: expiryDate(expiryParsed.data) },
    }),
  ]);
  await logActivity({
    actorType: "ADMIN", adminId: admin.id, action: "Link regenerated",
    detail: "Previous link invalidated; new link issued", projectId, accessLinkId: link.id,
  });
  revalidatePath("/admin/access-links");
  revalidatePath(`/admin/projects/${projectId}`);
  return { ok: true as const, token: rawToken, linkId: link.id, expiresAt: link.expiresAt?.toISOString() ?? null };
}

/** Changes expiry on the ACTIVE link only. */
export async function setLinkExpiryAction(projectId: string, expiry: LinkExpiryInput) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }

  const expiryParsed = linkExpirySchema.safeParse(expiry);
  if (!expiryParsed.success) return { ok: false as const, error: "Invalid expiry." };

  const active = await prisma.projectAccessLink.findFirst({ where: { projectId, status: "ACTIVE" } });
  if (!active) return { ok: false as const, error: "No active link." };

  await prisma.projectAccessLink.update({
    where: { id: active.id },
    data: { expiresAt: expiryDate(expiryParsed.data) },
  });
  await logActivity({
    actorType: "ADMIN", adminId: admin.id, action: "Link expiry updated",
    detail: `Expiry: ${expiryLabel(expiryParsed.data)}`, projectId, accessLinkId: active.id,
  });
  revalidatePath("/admin/access-links");
  return { ok: true as const, expiresAt: expiryDate(expiryParsed.data)?.toISOString() ?? null };
}
