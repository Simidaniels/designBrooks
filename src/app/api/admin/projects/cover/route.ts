import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { randomBytes } from "node:crypto";
import { requireAdminOrThrow } from "@/lib/server/auth";
import { putObject } from "@/lib/server/storage";
import { sniff, IMAGE_KINDS } from "@/lib/server/file-sniff";
import { logActivity } from "@/lib/server/activity";

export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB for covers

/**
 * Upload + resize a project cover image to WebP (max 2000 px) and store it
 * privately. The returned URL is the admin-only /api/covers path —
 * cover images are served only to signed-in admins.
 */
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

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Choose an image to upload." }, { status: 400 });
  }
  if (file.size === 0) return NextResponse.json({ ok: false, error: "The file is empty." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "Cover exceeds the 10 MB limit." }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const sniffed = sniff(buffer);
  if (!sniffed.ok || !IMAGE_KINDS.has(sniffed.kind)) {
    return NextResponse.json({ ok: false, error: "Cover must be a JPG, PNG or WebP image." }, { status: 400 });
  }

  let webp: Buffer;
  try {
    webp = await sharp(buffer)
      .rotate() // honour EXIF orientation
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    return NextResponse.json({ ok: false, error: "The image could not be processed." }, { status: 400 });
  }

  const name = `${randomBytes(16).toString("hex")}.webp`;
  const key = `covers/${name}`;
  await putObject(key, webp);

  await logActivity({
    actorType: "ADMIN",
    adminId: admin.id,
    action: "Cover image uploaded",
    detail: `${file.name} → ${key}`,
  });

  return NextResponse.json({ ok: true, url: `/api/covers/${name}`, size: webp.length });
}
