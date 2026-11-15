import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Hammer, CheckCircle2, FileText } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { ProjectsGrid } from "@/components/admin/projects-grid";
import { prisma } from "@/lib/server/db";
import { mapProject } from "@/lib/server/queries";

export const metadata: Metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const [rows, clientRows, docCounts] = await Promise.all([
    prisma.project.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.client.findMany({ select: { id: true, fullName: true } }),
    prisma.document.groupBy({ by: ["projectId"], where: { archivedAt: null }, _count: { _all: true } }),
  ]);

  const projects = rows.map(mapProject);
  const clientNames = Object.fromEntries(clientRows.map((c) => [c.id, c.fullName]));
  const docCountMap = Object.fromEntries(docCounts.map((d) => [d.projectId, d._count._all]));

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Project management"
        description="Every project belongs to one client. Statuses: draft → active → completed, or archived."
        actions={
          <Link href="/admin/projects/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-[0.82rem] font-bold text-ivory-50 transition hover:bg-accent-dark">
            New project
          </Link>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total" value={rows.length} icon={Building2} />
        <StatCard label="Active" value={rows.filter((p) => p.status === "ACTIVE").length} icon={Hammer} />
        <StatCard label="Completed" value={rows.filter((p) => p.status === "COMPLETED").length} icon={CheckCircle2} />
        <StatCard label="Documents" value={Object.values(docCountMap).reduce((a, b) => a + b, 0)} icon={FileText} />
      </div>

      <ProjectsGrid projects={projects} clientNames={clientNames} docCounts={docCountMap} />
    </>
  );
}
