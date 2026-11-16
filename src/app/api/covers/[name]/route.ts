import { NextRequest, NextResponse } from "next/server";
import { getObject, isNotFoundStorageError } from "@/lib/server/storage";
import { getSessionAdmin } from "@/lib/server/auth";

export const runtime = "nodejs";

const NAME_PATTERN = /^[a-f0-9]{32}\.webp$/;

/**
 * Admin-only serving route for project cover images.
 * Covers live in private storage and are served only to signed-in admins.
 * No directory listing, single fixed format, strict headers.
 */
export async function GET(_request: NextRequest, context: { params: Promise<{ name: string }> }) {
  const admin = await getSessionAdmin();
  if (!admin) {
    return new NextResponse(null, { status: 401 });
  }

  const { name } = await context.params;
  if (!NAME_PATTERN.test(name)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let data: Buffer;
  try {
    data = await getObject(`covers/${name}`);
  } catch (err) {
    if (isNotFoundStorageError(err)) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }
    console.error("[covers] storage error:", (err as { name?: string })?.name ?? "unknown");
    return NextResponse.json({ error: "Document storage is unavailable." }, { status: 503 });
  }

  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": String(data.length),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
