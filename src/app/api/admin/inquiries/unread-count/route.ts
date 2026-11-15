import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { requireAdminOrThrow } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Unread (NEW and unread flag) inquiry count for the admin sidebar badge. */
export async function GET() {
  try {
    await requireAdminOrThrow();
  } catch {
    return NextResponse.json({ count: 0 }, { status: 401 });
  }
  const count = await prisma.inquiry.count({ where: { status: "NEW", isRead: false } });
  return NextResponse.json(
    { count },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
