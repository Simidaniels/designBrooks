import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { NewProjectForm } from "@/components/admin/new-project-form";
import { prisma } from "@/lib/server/db";

export const metadata: Metadata = { title: "Create project" };
export const dynamic = "force-dynamic";

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const { client: presetClient } = await searchParams;
  const rows = await prisma.client.findMany({
    where: { archivedAt: null },
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true, company: true },
  });
  const clients = rows.map((r) => ({ id: r.id, fullName: r.fullName, company: r.company ?? undefined }));

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Create project"
        description="Every project belongs to one client. A private project link is generated after the first document upload."
        actions={
          <Link href="/admin/projects" className="inline-flex h-11 items-center gap-2 rounded-xl border border-line-strong bg-white/60 px-4 text-[0.82rem] font-bold text-ink transition hover:border-accent">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All projects
          </Link>
        }
      />
      <div className="max-w-3xl">
        <NewProjectForm clients={clients} presetClient={presetClient ?? ""} />
      </div>
    </>
  );
}
