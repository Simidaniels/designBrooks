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
     REQUIRED when NODE_ENV === "production". The app fails closed:
     storage operations throw StorageConfigurationError and the server
     registers a startup readiness check (instrumentation.ts) that
     refuses to boot without a valid R2 configuration.
     NO silent fallback to disk — documents would be written to an
     ephemeral, non-private filesystem and lost on redeploy.

   LOCAL DEV   — private local disk (./data/storage, outside the web root):
     Used only when R2_* is not configured, so the app keeps working
     offline without touching production credentials.

   Keys are unguessable random paths, never public URLs, never listed,
   and only ever read through the authorized route handlers
   (preview/download/covers). The browser never talks to R2 directly.
   ───────────────────────────────────────────────── */

export class StorageConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageConfigurationError";
  }
}

export function isStorageConfigurationError(err: unknown): err is StorageConfigurationError {
  return err instanceof StorageConfigurationError;
}

const R2_VAR_NAMES = ["R2_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"] as const;
type R2VarName = (typeof R2_VAR_NAMES)[number];

type R2Config = {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
};

/** Inspect env and report readiness WITHOUT exposing secret values. */
function inspectR2Config(env: NodeJS.ProcessEnv = process.env):
  | { ready: true; config: R2Config }
  | { ready: false; missing: R2VarName[]; invalid: R2VarName[] } {
  const read = (name: R2VarName) => env[name]?.trim() ?? "";

  const endpoint = read("R2_ENDPOINT");
  const accessKeyId = read("R2_ACCESS_KEY_ID");
  const secretAccessKey = read("R2_SECRET_ACCESS_KEY");
  const bucket = read("R2_BUCKET_NAME");

  const values: Record<R2VarName, string> = {
    R2_ENDPOINT: endpoint,
    R2_ACCESS_KEY_ID: accessKeyId,
    R2_SECRET_ACCESS_KEY: secretAccessKey,
    R2_BUCKET_NAME: bucket,
  };

  const missing = R2_VAR_NAMES.filter((name) => values[name].length === 0);
  if (missing.length > 0) return { ready: false, missing, invalid: [] };

  const invalid: R2VarName[] = [];

  // Endpoint must be a valid https URL. http:// is rejected so credentials
  // are never sent in plaintext.
  try {
    const url = new URL(endpoint);
    if (url.protocol !== "https:") invalid.push("R2_ENDPOINT");
  } catch {
    invalid.push("R2_ENDPOINT");
  }

  // Cloudflare R2 / S3 bucket naming: 3–63 chars, lowercase alnum + hyphens,
  // no leading/trailing hyphen.
  if (!/^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])?$/.test(bucket)) {
    invalid.push("R2_BUCKET_NAME");
  }

  // Credentials must be plausible (present + non-trivial length). Values
  // are never logged.
  if (accessKeyId.length < 8) invalid.push("R2_ACCESS_KEY_ID");
  if (secretAccessKey.length < 8) invalid.push("R2_SECRET_ACCESS_KEY");

  if (invalid.length > 0) return { ready: false, missing: [], invalid };
  return { ready: true, config: { endpoint, accessKeyId, secretAccessKey, bucket } };
}

const isProduction = () => process.env.NODE_ENV === "production";

const readiness = inspectR2Config();
const r2Config = readiness.ready ? readiness.config : null;

/** One-time loud signal — names only, never values. */
if (isProduction() && !r2Config) {
  const detail = !readiness.ready
    ? [
        readiness.missing.length ? `missing: ${readiness.missing.join(", ")}` : null,
        readiness.invalid.length ? `invalid: ${readiness.invalid.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join("; ")
    : "";
  console.error(
    `[storage] PRODUCTION is not configured for R2 object storage (${detail}). ` +
      `Document storage will refuse to operate until R2_ENDPOINT, R2_ACCESS_KEY_ID, ` +
      `R2_SECRET_ACCESS_KEY and R2_BUCKET_NAME are set to valid values. Disk fallback is disabled in production.`
  );
}
if (!isProduction() && !r2Config) {
  const detail = !readiness.ready
    ? [
        readiness.missing.length ? `missing: ${readiness.missing.join(", ")}` : null,
        readiness.invalid.length ? `invalid: ${readiness.invalid.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join("; ")
    : "";
  if (detail) {
    console.warn(`[storage] R2 is not configured (${detail}) — using the local disk backend for development.`);
  }
}

const STORAGE_ROOT = process.env.STORAGE_DIR
  ? path.resolve(process.env.STORAGE_DIR)
  : path.join(process.cwd(), "data", "storage");

const r2Client = r2Config
  ? new S3Client({
      region: "auto",
      endpoint: r2Config.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: r2Config.accessKeyId,
        secretAccessKey: r2Config.secretAccessKey,
      },
    })
  : null;

const R2_BUCKET = r2Config?.bucket;

/**
 * Fail-closed gate. In production, storage is unusable without a valid R2
 * configuration — no disk fallback, ever. In development, disk remains
 * available when R2 is not configured.
 */
function assertStorageReady(): void {
  if (r2Config) return;
  if (isProduction()) {
    const detail = !readiness.ready
      ? [
          !readiness.ready && readiness.missing.length ? `missing: ${readiness.missing.join(", ")}` : null,
          !readiness.ready && readiness.invalid.length ? `invalid: ${readiness.invalid.join(", ")}` : null,
        ]
          .filter(Boolean)
          .join("; ")
      : "";
    throw new StorageConfigurationError(
      `R2 object storage is not available (${detail}). The server refuses to fall back to local disk in production. ` +
        `Set R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY and R2_BUCKET_NAME to valid values and restart.`
    );
  }
}

/** Startup readiness check — invoked from instrumentation register(). */
export function checkStorageReadiness(): { ok: boolean; message: string } {
  if (r2Config) return { ok: true, message: "R2 object storage configured." };
  const detail = !readiness.ready
    ? [
        readiness.missing.length ? `missing ${readiness.missing.join(", ")}` : null,
        readiness.invalid.length ? `invalid ${readiness.invalid.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join(", ")
    : "unknown";
  return {
    ok: !isProduction(), // development may run on the disk backend
    message: isProduction()
      ? `R2 object storage is not configured (${detail}). Refusing to start without it in production.`
      : `R2 not configured (${detail}); using local disk storage for development.`,
  };
}

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
  assertStorageReady();
  if (r2Client && R2_BUCKET) {
    await r2Client.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: data }));
    return;
  }
  const full = resolveDiskKey(key);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, data);
}

export async function getObject(key: string): Promise<Buffer> {
  assertStorageReady();
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
  assertStorageReady(); // fail closed in production before any deletion proceeds
  if (r2Client && R2_BUCKET) {
    try {
      await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    } catch (err: unknown) {
      const name = (err as { name?: string })?.name ?? "";
      const status = (err as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;
      // A genuinely absent object is fine — nothing left to protect.
      if (name === "NoSuchKey" || status === 404) return;
      // Anything else (bad credentials, unreachable backend, 5xx) must abort
      // the caller BEFORE the database record is deleted, so storage and
      // database never drift apart. Message carries no secrets.
      console.error("[storage] delete object failed:", name || status || "unknown error");
      throw new StorageConfigurationError(`Storage delete failed (${name || status || "unknown"}). Nothing was deleted.`);
    }
    return;
  }
  // Missing file is fine; permission/IO errors abort the caller's transaction.
  await rm(resolveDiskKey(key), { force: true });
}

export async function readObjectSize(key: string): Promise<number> {
  assertStorageReady();
  if (r2Client && R2_BUCKET) {
    const res = await r2Client.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return res.ContentLength ?? 0;
  }
  const buf = await getObject(key);
  return buf.length;
}

/** True when the error looks like a missing object (for 404 mapping). */
export function isNotFoundStorageError(err: unknown): boolean {
  const name = (err as { name?: string })?.name ?? "";
  const status = (err as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;
  return name === "NoSuchKey" || name === "NotFound" || status === 404;
}

/** Diagnostics — reports which backend is active without leaking credentials. */
export function storageBackend(): "r2" | "disk" | "unavailable" {
  if (r2Client) return "r2";
  return isProduction() ? "unavailable" : "disk";
}
