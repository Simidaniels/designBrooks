import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { InquiriesBoard } from "@/components/admin/inquiries-board";
import { prisma } from "@/lib/server/db";
import { mapInquiry } from "@/lib/server/queries";

export const metadata: Metadata = { title: "Inquiries" };
export const dynamic = "force-dynamic";

export default async function InquiriesPage() {
  const rows = await prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const inquiries = rows.map(mapInquiry);

  return (
    <>
      <PageHeader
        eyebrow="Inquiries"
        title="Public inquiries"
        description="Everything submitted through the website contact and consultation forms, with its status."
      />
      <InquiriesBoard inquiries={inquiries} />
    </>
  );
}
