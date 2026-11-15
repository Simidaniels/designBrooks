import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

/* ─────────────────────────────────────────────────
   Private object storage.

   PRODUCTION  — Cloudflare R2 (S3-compatible, private bucket):
     Active when R2_ENDPOINT + R2_ACCESS_KEY_ID + R2_SECRET_ACCESS_KEY
     + R2_BUCKET_NAME are all set. Keys are unguessable UUID paths,
     never public URLs, never listed, and only ever read through the
     authorized route handlers (preview/download/covers).

   LOCAL DEV   — private local disk (./data/storage, outside the web root):
     Used only when R2_* is not configured, so the app keeps working
     offline without touching production credentials.

   Swap between backends by changing env vars only — zero code changes.
   ───────────────────────────────────────────────── */

const hasR2 = Boolean(
  process.env.R2_ENDPOINT &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME
);

const STORAGE_ROOT = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.join(process.cwd(), "data", "storage");

const r2Client = hasR2
  ? new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

const R2_BUCKET = process.env.R2_BUCKET_NAME;

function resolveDiskKey(key: string): string {
  const full = path.normalize(path.join(STORAGE_ROOT, key));
  if (!full.startsWith(STORAGE_ROOT + path.sep) && full !== STORAGE_ROOT) {
    throw new Error("Invalid storage key");
  }
  return full;
}

export function newStorageKey(projectId: string, extension: string): string {
  const ext = extension.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${projectId}/${randomBytes(20).toString("hex")}.${ext || "bin"}`;
}

export async function putObject(key: string, data: Buffer): Promise<void> {
  if (r2Client && R2_BUCKET) {
    await r2Client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: data }));
    return;
  }
  const full = resolveDiskKey(key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, data);
}

export async function getObject(key: string): Promise<Buffer> {
  if (r2Client && R2_BUCKET) {
    const res = await r2Client.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    const body = res.Body as NodeJS.ReadableStream | undefined;
    if (!body) throw new Error("Empty object from storage");
    const chunks: Buffer[] = [];
    for await (const chunk of body as AsyncIterable<Buffer | Uint8Array | string>) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }
  return readFile(resolveDiskKey(key));
}

export async function deleteObject(key: string | null | undefined): Promise<void> {
  if (!key) return;
  if (r2Client && R2_BUCKET) {
    await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key })).catch(() => undefined);
    return;
  }
  await rm(resolveDiskKey(key), { force: true }).catch(() => undefined);
}

export async function readObjectSize(key: string): Promise<number> {
  if (r2Client && R2_BUCKET) {
    const res = await r2Client.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return res.ContentLength ?? 0;
  }
  const buf = await getObject(key);
  return buf.length;
}

/** Diagnostics — reports which backend is active without leaking credentials. */
export function storageBackend(): "r2" | "disk" {
  return r2Client ? "r2" : "disk";
}
