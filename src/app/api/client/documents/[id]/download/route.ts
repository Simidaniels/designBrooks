import { NextRequest, NextResponse } from "next/server";
import { authorizedDocument, resolveClientToken } from "@/lib/server/client-links";
import { getObject, isNotFoundStorageError } from "@/lib/server/storage";
import { logActivity } from "@/lib/server/activity";
import { contentTypeFor, safeFileName } from "@/lib/server/mime";
import { prisma } from "@/lib/server/db";

export const runtime = "nodejs";

/* A document is downloadable ONLY in FULL_ACCESS mode — permission is
   checked here on every request, never trusted from the client. */
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
  if (document.accessMode !== "FULL_ACCESS") {
    return NextResponse.json({ error: "This document is not downloadable." }, { status: 403 });
  }

  let data: Buffer;
  try {
    data = await getObject(document.storageKey);
  } catch (err) {
    if (isNotFoundStorageError(err)) {
      return NextResponse.json({ error: "File unavailable." }, { status: 404 });
    }
    console.error("[download] storage error:", (err as { name?: string })?.name ?? "unknown");
    return NextResponse.json({ error: "Document storage is unavailable." }, { status: 503 });
  }

  await logActivity({
    actorType: "CLIENT",
    action: "Document downloaded",
    detail: document.name,
    projectId: link.projectId,
    documentId: document.id,
    accessLinkId: link.id,
  });
  await prisma.projectAccessLink
    .update({ where: { id: link.id }, data: { lastAccessedAt: new Date() } })
    .catch(() => undefined);

  const ext = document.storageKey.split(".").pop()?.toLowerCase() ?? "bin";
  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": contentTypeFor(ext),
      "Content-Length": String(data.length),
      "Content-Disposition": `attachment; filename="${safeFileName(document.originalFileName)}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
