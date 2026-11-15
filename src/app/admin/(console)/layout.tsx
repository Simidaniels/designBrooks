import type { Metadata } from "next";
import { requireAdmin } from "@/lib/server/auth";
import { prisma } from "@/lib/server/db";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata: Metadata = { title: "Admin Console", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const unreadInquiries = await prisma.inquiry.count({
    where: { status: "NEW", isRead: false },
  });
  return (
    <AdminShell adminEmail={admin.email} unreadInquiries={unreadInquiries}>
      {children}
    </AdminShell>
  );
}
