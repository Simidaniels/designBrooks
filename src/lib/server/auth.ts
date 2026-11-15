import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { prisma } from "./db";

/* ————— Password hashing: scrypt (Node built-in, no native deps) ————— */
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };
export const SESSION_COOKIE = "db_admin_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days, rolling

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, n, r, p, saltB64, hashB64] = stored.split("$");
    if (scheme !== "scrypt") return false;
    const N = Number(n), rr = Number(r), pp = Number(p);
    if (!Number.isFinite(N) || !Number.isFinite(rr) || !Number.isFinite(pp)) return false;
    const salt = Buffer.from(saltB64, "base64");
    const expected = Buffer.from(hashB64, "base64");
    const actual = scryptSync(password, salt, expected.length, { N, r: rr, p: pp });
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

/* ————— Session lifecycle ————— */
export async function createSession(adminId: string) {
  const rawToken = randomBytes(32).toString("base64url");
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { tokenHash, adminId, expiresAt } });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (raw) {
    await prisma.session.deleteMany({ where: { tokenHash: sha256(raw) } });
  }
  jar.delete(SESSION_COOKIE);
}

export type SessionAdmin = { id: string; email: string; name: string };

export async function getSessionAdmin(): Promise<SessionAdmin | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const tokenHash = sha256(raw);
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { admin: { select: { id: true, email: true, name: true } } },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }

  // Rolling refresh (once per hour at most, to avoid a write on every render)
  if (Date.now() - session.lastSeenAt.getTime() > 60 * 60 * 1000) {
    await prisma.session
      .update({ where: { id: session.id }, data: { lastSeenAt: new Date(), expiresAt: new Date(Date.now() + SESSION_TTL_MS) } })
      .catch(() => undefined);
  }
  return session.admin;
}

/** Server component guard — redirects to /admin/login when unauthenticated. */
export async function requireAdmin(): Promise<SessionAdmin> {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** Action/route-handler guard — throws instead of redirecting. */
export async function requireAdminOrThrow(): Promise<SessionAdmin> {
  const admin = await getSessionAdmin();
  if (!admin) throw new Error("UNAUTHENTICATED");
  return admin;
}

/* ————— Project link tokens ————— */
export function generateRawToken(): string {
  return randomBytes(32).toString("base64url");
}
export function hashToken(token: string): string {
  return sha256(token);
}
