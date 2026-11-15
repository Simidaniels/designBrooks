import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { ClientsTable } from "@/components/admin/clients-table";
import { prisma } from "@/lib/server/db";
import { mapClient } from "@/lib/server/queries";

export const metadata: Metadata = { title: "Clients" };
export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const rows = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
  const clients = rows.map(mapClient);

  const counts = await prisma.project.groupBy({ by: ["clientId"], _count: { _all: true } });
  const projectCounts = Object.fromEntries(counts.map((c) => [c.clientId, c._count._all]));

  return (
    <>
      <PageHeader
        eyebrow="Clients"
        title="Client management"
        description="Search, filter and manage every client relationship. One client can hold many projects."
        actions={
          <Link href="/admin/clients/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-[0.82rem] font-bold text-ivory-50 transition hover:bg-accent-dark">
            Add client
          </Link>
        }
      />
      <ClientsTable clients={clients} projectCounts={projectCounts} />
    </>
  );
}
