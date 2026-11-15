import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { ClientDetail } from "@/components/admin/client-detail";
import { prisma } from "@/lib/server/db";
import { mapClient, mapProject } from "@/lib/server/queries";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Client" };
export const dynamic = "force-dynamic";

export default async function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row, projectRows] = await Promise.all([
    prisma.client.findUnique({ where: { id } }),
    prisma.project.findMany({ where: { clientId: id }, orderBy: { createdAt: "desc" } }),
  ]);
  if (!row) notFound();

  const client = mapClient(row);
  const projects = projectRows.map(mapProject);

  return (
    <>
      <PageHeader
        eyebrow="Client"
        title={client.fullName}
        description={`${client.company ?? "Private client"}${client.location ? ` · ${client.location}` : ""} · Client since ${formatDate(client.createdAt)}`}
        actions={
          <Link href="/admin/clients" className="inline-flex h-11 items-center gap-2 rounded-xl border border-line-strong bg-white/60 px-4 text-[0.82rem] font-bold text-ink transition hover:border-accent">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All clients
          </Link>
        }
      />
      <ClientDetail client={client} projects={projects} />
    </>
  );
}
