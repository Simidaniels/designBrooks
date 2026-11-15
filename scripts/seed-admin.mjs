/**
 * Design Brooks — one-time administrator seed.
 * Creates the single admin account. Idempotent: if the account exists it is NOT modified.
 *
 * Usage:
 *   node scripts/seed-admin.mjs
 *   ADMIN_EMAIL=you@studio.com ADMIN_NAME="Studio Owner" node scripts/seed-admin.mjs
 *   ADMIN_PASSWORD="explicit-temp-password" node scripts/seed-admin.mjs   (otherwise a strong one is generated)
 */
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const email = (process.env.ADMIN_EMAIL || "admin@designbrooks.com").trim().toLowerCase();
const name = (process.env.ADMIN_NAME || "Design Brooks Studio").trim();
const providedPassword = process.env.ADMIN_PASSWORD;

// ————— scrypt helpers (must match src/lib/server/auth.ts) —————
const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, SCRYPT.keylen, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

function generatePassword() {
  // 18 chars from a strong alphabet — unambiguous, no quotes/backslashes/spaces
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#%&*-+?";
  const bytes = randomBytes(18);
  let out = "";
  for (let i = 0; i < 18; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

const prisma = new PrismaClient();

try {
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin account already exists for ${email} — not modified.`);
    console.log("If you need to rotate the password, delete the row and re-run, or use the in-app reset (Settings).");
    process.exit(0);
  }

  const password = providedPassword || generatePassword();
  const passwordHash = hashPassword(password);

  await prisma.adminUser.create({ data: { email, name, passwordHash } });

  console.log("═══════════════════════════════════════════════");
  console.log("  Design Brooks — administrator created");
  console.log("═══════════════════════════════════════════════");
  console.log(`  Login URL:        ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/login`);
  console.log(`  Email:            ${email}`);
  console.log(`  Temporary password: ${password}`);
  console.log("═══════════════════════════════════════════════");
  console.log("  Store this password now — it will not be shown again.");
  console.log("  Change it in Admin → Settings after first sign-in.");
  process.exit(0);
} catch (err) {
  console.error("Seed failed:", err.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
