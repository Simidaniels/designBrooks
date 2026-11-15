import { NextRequest, NextResponse } from "next/server";
import { authorizedDocument, resolveClientToken } from "@/lib/server/client-links";
import { getObject } from "@/lib/server/storage";
import { logActivity } from "@/lib/server/activity";
import { contentTypeFor, safeFileName } from "@/lib/server/mime";
import { sniff } from "@/lib/server/file-sniff";
import { prisma } from "@/lib/server/db";

export const runtime = "nodejs";

/* Streams the authorized view of a document:
   - RESTRICTED  → watermarked preview only (404 when none exists)
   - FULL_ACCESS → the original file, inline              */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const token = request.nextUrl.searchParams.get("token");

  const link = await resolveClientToken(token);
  if (!link || link.status !== "ACTIVE") {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }
  const document = await authorizedDocument(link, id);
  if (!document) {
    return NextResponse.json({ error: "Not authorized." }, { status: 404 });
  }

  const isFull = document.accessMode === "FULL_ACCESS";
  const key = isFull ? document.storageKey : document.previewKey;
  const ext = key?.split(".").pop()?.toLowerCase() ?? "bin";

  if (!key) {
    return NextResponse.json({ error: "Preview unavailable for this file type." }, { status: 404 });
  }

  let data: Buffer;
  try {
    data = await getObject(key);
  } catch {
    return NextResponse.json({ error: "Preview unavailable." }, { status: 404 });
  }

  // Serve by actual bytes when recognizable, not just by key extension —
  // covers legacy previews stored with a mismatched extension.
  const sniffed = sniff(data);
  const servedExt = sniffed.ok ? sniffed.kind : ext;

  await logActivity({
    actorType: "CLIENT",
    action: "Document previewed",
    detail: `${document.name}${isFull ? " (full)" : " (watermarked preview)"}`,
    projectId: link.projectId,
    documentId: document.id,
    accessLinkId: link.id,
  });
  await prisma.projectAccessLink
    .update({ where: { id: link.id }, data: { lastAccessedAt: new Date() } })
    .catch(() => undefined);

  const fileName = safeFileName(isFull ? document.originalFileName : `preview-${document.originalFileName}`);
  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": contentTypeFor(servedExt),
      "Content-Length": String(data.length),
      "Content-Disposition": `inline; filename="${fileName}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
