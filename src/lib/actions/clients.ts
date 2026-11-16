"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/server/db";
import { requireAdminOrThrow } from "@/lib/server/auth";
import { logActivity } from "@/lib/server/activity";
import { deleteObject } from "@/lib/server/storage";
import { clientSchema } from "@/lib/validation";

export async function createClientAction(input: unknown) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }

  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  // Likely-duplicate detection (warn, don't block) — surface to the UI as a soft flag
  const duplicate = d.email
    ? await prisma.client.findFirst({ where: { email: { equals: d.email, mode: "insensitive" } }, select: { id: true, fullName: true } })
    : null;

  const client = await prisma.client.create({
    data: {
      fullName: d.fullName,
      email: d.email || null,
      phone: d.phone || null,
      company: d.company || null,
      location: d.location || null,
      internalNotes: d.internalNotes || null,
    },
  });
  await logActivity({ actorType: "ADMIN", adminId: admin.id, action: "Client created", detail: `${client.fullName}${client.email ? ` · ${client.email}` : ""}` });
  revalidatePath("/admin/clients");
  revalidatePath("/admin/dashboard");
  return { ok: true as const, clientId: client.id, duplicateOf: duplicate?.fullName ?? null };
}

export async function updateClientAction(id: string, input: unknown) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }

  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const existing = await prisma.client.findUnique({ where: { id } });
  if (!existing) return { ok: false as const, error: "Client not found." };

  await prisma.client.update({
    where: { id },
    data: {
      fullName: d.fullName,
      email: d.email || null,
      phone: d.phone || null,
      company: d.company || null,
      location: d.location || null,
      internalNotes: d.internalNotes || null,
    },
  });
  await logActivity({ actorType: "ADMIN", adminId: admin.id, action: "Client updated", detail: d.fullName });
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id}`);
  return { ok: true as const };
}

export async function archiveClientAction(id: string) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) return { ok: false as const, error: "Client not found." };
  await prisma.client.update({ where: { id }, data: { archivedAt: client.archivedAt ? null : new Date() } });
  await logActivity({
    actorType: "ADMIN",
    adminId: admin.id,
    action: client.archivedAt ? "Client restored" : "Client archived",
    detail: client.fullName,
  });
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${id}`);
  return { ok: true as const };
}

/** Hard delete: cascades to projects, documents (files removed too) and links. */
export async function deleteClientAction(id: string) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }
  const client = await prisma.client.findUnique({
    where: { id },
    include: { projects: { include: { documents: true } } },
  });
  if (!client) return { ok: false as const, error: "Client not found." };

  try {
    for (const project of client.projects) {
      for (const doc of project.documents) {
        await deleteObject(doc.storageKey);
        await deleteObject(doc.previewKey);
      }
    }
  } catch (err) {
    // Fail closed — the client and its database records stay intact.
    console.error("[clients] storage delete failed:", (err as { name?: string })?.name ?? "unknown");
    return { ok: false as const, error: "Document storage is unavailable. Nothing was deleted — try again shortly." };
  }
  await prisma.client.delete({ where: { id } });
  await logActivity({ actorType: "ADMIN", adminId: admin.id, action: "Client deleted", detail: `${client.fullName} (with ${client.projects.length} project(s))` });
  revalidatePath("/admin/clients");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}
