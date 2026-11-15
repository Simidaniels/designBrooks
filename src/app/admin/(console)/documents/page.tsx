import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { DocumentsBrowser, type DocumentRow } from "@/components/admin/documents-browser";
import { prisma } from "@/lib/server/db";
import { mapDocument } from "@/lib/server/queries";

export const metadata: Metadata = { title: "Documents" };
export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const rows = await prisma.document.findMany({
    where: { archivedAt: null },
    orderBy: { createdAt: "desc" },
    include: { project: { select: { name: true, client: { select: { fullName: true } } } } },
  });

  const documents: DocumentRow[] = rows.map((row) => ({
    ...mapDocument(row),
    projectName: row.project.name,
    clientName: row.project.client.fullName,
  }));

  const projects = await prisma.project.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <>
      <PageHeader
        eyebrow="Documents"
        title="Document library"
        description="Every file released to a project, with its access setting. Changing access here never re-uploads anything."
        actions={
          <Link href="/admin/documents/upload" className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-[0.82rem] font-bold text-ivory-50 transition hover:bg-accent-dark">
            <Plus aria-hidden="true" /> Upload document
          </Link>
        }
      />
      <DocumentsBrowser documents={documents} projects={projects} />
    </>
  );
}
