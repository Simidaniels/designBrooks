"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/server/db";
import { requireAdminOrThrow } from "@/lib/server/auth";
import { logActivity } from "@/lib/server/activity";
import { deleteObject } from "@/lib/server/storage";
import { projectSchema } from "@/lib/validation";
import { unmapProjectType } from "@/lib/server/queries";

export async function createProjectAction(input: unknown) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }

  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const d = parsed.data;

  const client = await prisma.client.findUnique({ where: { id: d.clientId } });
  if (!client) return { ok: false as const, error: "Client not found." };

  // Reference uniqueness — warn rather than crash on collision
  if (d.reference) {
    const taken = await prisma.project.findUnique({ where: { reference: d.reference } });
    if (taken) return { ok: false as const, error: `Reference "${d.reference}" is already used by ${taken.name}.` };
  }

  const reference = d.reference || `DB-${new Date().getFullYear()}-${String((await prisma.project.count()) + 1).padStart(3, "0")}`;

  const project = await prisma.project.create({
    data: {
      clientId: d.clientId,
      name: d.name,
      reference,
      type: unmapProjectType(d.type) as never,
      location: d.location || null,
      description: d.description || null,
      status: d.status as never,
      coverImage: d.coverImage?.trim() || null,
    },
  });
  await logActivity({ actorType: "ADMIN", adminId: admin.id, action: "Project created", detail: `${project.name} · ${project.reference}`, projectId: project.id });
  revalidatePath("/admin/projects");
  revalidatePath("/admin/dashboard");
  return { ok: true as const, projectId: project.id };
}

export async function updateProjectAction(id: string, input: Partial<{ name: string; reference: string; type: string; location: string; description: string; status: string; coverImage: string }>) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return { ok: false as const, error: "Project not found." };

  if (input.reference) {
    const taken = await prisma.project.findFirst({ where: { reference: input.reference, NOT: { id } } });
    if (taken) return { ok: false as const, error: `Reference "${input.reference}" is already used by ${taken.name}.` };
  }

  await prisma.project.update({
    where: { id },
    data: {
      ...(input.name !== undefined ? { name: input.name.trim().slice(0, 160) } : {}),
      ...(input.reference !== undefined ? { reference: input.reference.trim() || null } : {}),
      ...(input.type !== undefined ? { type: unmapProjectType(input.type as never) as never } : {}),
      ...(input.location !== undefined ? { location: input.location.trim() || null } : {}),
      ...(input.description !== undefined ? { description: input.description.trim() || null } : {}),
      ...(input.status !== undefined ? { status: input.status as never } : {}),
      ...(input.coverImage !== undefined ? { coverImage: input.coverImage } : {}),
    },
  });
  await logActivity({ actorType: "ADMIN", adminId: admin.id, action: "Project updated", detail: existing.name, projectId: id });
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}

export async function setProjectStatusAction(id: string, status: "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED") {
  return updateProjectAction(id, { status });
}

/** Hard delete: removes documents + files from storage, then the project. */
export async function deleteProjectAction(id: string) {
  let admin;
  try { admin = await requireAdminOrThrow(); } catch { return { ok: false as const, error: "Not authenticated." }; }
  const project = await prisma.project.findUnique({ where: { id }, include: { documents: true } });
  if (!project) return { ok: false as const, error: "Project not found." };

  try {
    for (const doc of project.documents) {
      await deleteObject(doc.storageKey);
      await deleteObject(doc.previewKey);
    }
  } catch (err) {
    // Fail closed — the project and its database records stay intact.
    console.error("[projects] storage delete failed:", (err as { name?: string })?.name ?? "unknown");
    return { ok: false as const, error: "Document storage is unavailable. Nothing was deleted — try again shortly." };
  }
  await prisma.project.delete({ where: { id } });
  await logActivity({ actorType: "ADMIN", adminId: admin.id, action: "Project deleted", detail: `${project.name} (+${project.documents.length} document(s))` });
  revalidatePath("/admin/projects");
  revalidatePath("/admin/dashboard");
  return { ok: true as const };
}
