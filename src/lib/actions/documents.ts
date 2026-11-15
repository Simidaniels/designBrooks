"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/server/db";
import { requireAdminOrThrow } from "@/lib/server/auth";
import { logActivity } from "@/lib/server/activity";
import { deleteObject } from "@/lib/server/storage";
import { unmapCategory } from "@/lib/server/queries";
import type { AccessMode, DocumentCategory } from "@/lib/types";

export async function setDocumentAccessAction(id: string, mode: AccessMode) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return { ok: false as const, error: "Document not found." };

  await prisma.document.update({ where: { id }, data: { accessMode: mode } });
  await logActivity({
    actorType: "ADMIN",
    adminId: admin.id,
    action: "Access setting changed",
    detail: `${doc.name} → ${mode === "FULL_ACCESS" ? "Full access" : "Restricted preview"}`,
    projectId: doc.projectId,
    documentId: id,
  });
  revalidatePath("/admin/documents");
  revalidatePath(`/admin/projects/${doc.projectId}`);
  return { ok: true as const };
}

export async function updateDocumentAction(id: string, input: { name?: string; category?: DocumentCategory; revision?: string }) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return { ok: false as const, error: "Document not found." };

  await prisma.document.update({
    where: { id },
    data: {
      ...(input.name ? { name: input.name.trim().slice(0, 200) } : {}),
      ...(input.category ? { category: unmapCategory(input.category) as never } : {}),
      ...(input.revision ? { revision: input.revision.trim().slice(0, 30) } : {}),
    },
  });
  await logActivity({ actorType: "ADMIN", adminId: admin.id, action: "Document updated", detail: doc.name, projectId: doc.projectId, documentId: id });
  revalidatePath("/admin/documents");
  revalidatePath(`/admin/projects/${doc.projectId}`);
  return { ok: true as const };
}

/** Deletes the row and removes the stored files (original + preview). */
export async function deleteDocumentAction(id: string) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) return { ok: false as const, error: "Document not found." };

  await deleteObject(doc.storageKey);
  await deleteObject(doc.previewKey);
  await prisma.document.delete({ where: { id } });
  await logActivity({ actorType: "ADMIN", adminId: admin.id, action: "Document deleted", detail: doc.name, projectId: doc.projectId, documentId: id });
  revalidatePath("/admin/documents");
  revalidatePath(`/admin/projects/${doc.projectId}`);
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}
