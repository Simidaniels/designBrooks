import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { UploadDocumentForm } from "@/components/admin/upload-document-form";
import { prisma } from "@/lib/server/db";

export const metadata: Metadata = { title: "Upload document" };
export const dynamic = "force-dynamic";

export default async function UploadDocumentPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const { project: presetProject } = await searchParams;

  const clients = await prisma.client.findMany({
    where: { archivedAt: null },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      company: true,
      projects: { orderBy: { createdAt: "desc" }, select: { id: true, name: true, reference: true } },
    },
  });

  const options = clients.map((c) => ({
    id: c.id,
    fullName: c.fullName,
    company: c.company,
    projects: c.projects.map((p) => ({ id: p.id, name: p.name, reference: p.reference ?? "—" })),
  }));

  // Derive the preset client from ?project= when arriving from a project page
  let presetClient = "";
  if (presetProject) {
    const owner = options.find((c) => c.projects.some((p) => p.id === presetProject));
    presetClient = owner?.id ?? "";
  }

  return (
    <>
      <PageHeader
        eyebrow="Documents"
        title="Upload document"
        description="Sequence: client → project → document → file → access setting. The client never sees the setting you choose — only the result."
        actions={
          <Link href="/admin/documents" className="inline-flex h-11 items-center gap-2 rounded-xl border border-line-strong bg-white/60 px-4 text-[0.82rem] font-bold text-ink transition hover:border-accent">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Document library
          </Link>
        }
      />
      <UploadDocumentForm clients={options} presetClient={presetClient} presetProject={presetProject ?? ""} />
    </>
  );
}
