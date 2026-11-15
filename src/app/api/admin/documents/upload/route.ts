import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/server/db";
import { requireAdminOrThrow } from "@/lib/server/auth";
import { logActivity } from "@/lib/server/activity";
import { newStorageKey, putObject } from "@/lib/server/storage";
import { watermarkImage, watermarkPdf } from "@/lib/server/watermark";
import { documentMetaSchema } from "@/lib/validation";
import { unmapCategory, mapDocument } from "@/lib/server/queries";
import { sniff } from "@/lib/server/file-sniff";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB
const EXT_ALLOWLIST = new Set(["pdf", "jpg", "jpeg", "png", "webp", "dwg", "dxf", "zip"]);

export async function POST(request: NextRequest) {
  let admin;
  try {
    admin = await requireAdminOrThrow();
  } catch {
    return NextResponse.json({ ok: false, error: "Not authenticated." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Expected multipart form data." }, { status: 400 });
  }

  const meta = documentMetaSchema.safeParse({
    projectId: String(form.get("projectId") ?? ""),
    name: String(form.get("name") ?? ""),
    category: String(form.get("category") ?? "architectural"),
    revision: String(form.get("revision") ?? "Rev A"),
    accessMode: String(form.get("accessMode") ?? "RESTRICTED_PREVIEW"),
  });
  if (!meta.success) {
    return NextResponse.json({ ok: false, error: meta.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }
  const { projectId, name, category, revision, accessMode } = meta.data;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { client: { select: { fullName: true } } },
  });
  if (!project) {
    return NextResponse.json({ ok: false, error: "Project not found." }, { status: 404 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Choose a file to upload." }, { status: 400 });
  }
  if (file.size === 0) return NextResponse.json({ ok: false, error: "The file is empty." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "File exceeds the 25 MB limit." }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!EXT_ALLOWLIST.has(ext)) {
    return NextResponse.json({ ok: false, error: `.${ext || "unknown"} files are not accepted. Use PDF, JPG, PNG, WebP, DWG, DXF or ZIP.` }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniff(buffer);
  if (!sniffed.ok) {
    return NextResponse.json({ ok: false, error: "File contents do not match an accepted format." }, { status: 400 });
  }

  // ————— Store the original privately —————
  const storageKey = newStorageKey(projectId, ext);
  await putObject(storageKey, buffer);

  // ————— Restricted previews are generated server-side now —————
  const isRestricted = accessMode === "RESTRICTED_PREVIEW";
  const previewable = sniffed.kind === "pdf" || sniffed.kind === "jpg" || sniffed.kind === "png" || sniffed.kind === "webp";
  let previewKey: string | null = null;
  let status: "READY" | "PROCESSING" | "FAILED" = "READY";
  let failureReason: string | null = null;

  if (isRestricted) {
    if (previewable) {
      try {
        const preview =
          sniffed.kind === "pdf"
            ? await watermarkPdf(buffer, project.client.fullName, project.reference ?? "DB")
            : await watermarkImage(buffer, project.client.fullName, project.reference ?? "DB");
        previewKey = newStorageKey(projectId, preview.ext);
        await putObject(previewKey, preview.buffer);
      } catch (err) {
        console.error("[upload] watermark failed:", err);
        status = "FAILED";
        failureReason = "Watermarked preview could not be generated.";
      }
    } else {
      status = "FAILED";
      failureReason = "This file type has no browser preview — only authorized full-access clients can download it.";
    }
  }

  const document = await prisma.document.create({
    data: {
      projectId,
      name: name.trim(),
      category: unmapCategory(category) as never,
      originalFileName: file.name.replace(/[^\w.\-() ]+/g, "_").slice(0, 200),
      storageKey,
      previewKey,
      mimeType: file.type || "application/octet-stream",
      fileSize: file.size,
      fileType: ext.toUpperCase(),
      accessMode,
      revision: revision.trim() || "Rev A",
      status,
      failureReason,
      uploadedById: admin.id,
    },
  });

  await logActivity({
    actorType: "ADMIN",
    adminId: admin.id,
    action: "Document uploaded",
    detail: `${document.name} · ${document.fileType} · ${accessMode === "FULL_ACCESS" ? "Full access" : "Restricted preview"}`,
    projectId,
    documentId: document.id,
  });

  // Current link state for the post-upload panel
  const link = await prisma.projectAccessLink.findFirst({
    where: { projectId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    ok: true,
    document: mapDocument(document),
    link: link
      ? {
          id: link.id,
          status: link.status,
          expiresAt: link.expiresAt?.toISOString() ?? null,
          lastAccessedAt: link.lastAccessedAt?.toISOString() ?? null,
          openCount: link.openCount,
          createdAt: link.createdAt.toISOString(),
          projectId,
        }
      : null,
  });
}
