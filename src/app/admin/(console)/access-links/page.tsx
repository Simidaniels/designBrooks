import type { Metadata } from "next";
import { Link2, MousePointerClick, ShieldCheck, ShieldX } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { AccessLinksBrowser, type ProjectLinkRow } from "@/components/admin/access-links-browser";
import { prisma } from "@/lib/server/db";

export const metadata: Metadata = { title: "Access links" };
export const dynamic = "force-dynamic";

export default async function AccessLinksPage() {
  const [projectRows, linkRows] = await Promise.all([
    prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { client: { select: { fullName: true } } },
    }),
    prisma.projectAccessLink.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const linksByProject = new Map<string, (typeof linkRows)[number]>();
  for (const link of linkRows) {
    if (!linksByProject.has(link.projectId)) linksByProject.set(link.projectId, link); // newest per project
  }

  const projects: ProjectLinkRow[] = projectRows.map((p) => {
    const link = linksByProject.get(p.id);
    return {
      id: p.id,
      name: p.name,
      reference: p.reference ?? "—",
      clientName: p.client.fullName,
      link: link
        ? {
            id: link.id,
            projectId: link.projectId,
            status: link.status as "ACTIVE" | "REVOKED" | "EXPIRED",
            createdAt: link.createdAt.toISOString(),
            expiresAt: link.expiresAt?.toISOString() ?? null,
            lastAccessedAt: link.lastAccessedAt?.toISOString() ?? null,
            openCount: link.openCount,
          }
        : null,
    };
  });

  const activeCount = projects.filter((p) => p.link?.status === "ACTIVE").length;
  const totalOpens = projects.reduce((sum, p) => sum + (p.link?.openCount ?? 0), 0);
  const inactiveCount = projects.filter((p) => p.link && p.link.status !== "ACTIVE").length;

  return (
    <>
      <PageHeader
        eyebrow="Access links"
        title="Private project links"
        description="One reusable link per project. Documents added later travel through the same link with their own access settings."
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Active links" value={activeCount} icon={Link2} />
        <StatCard label="Projects covered" value={activeCount} icon={ShieldCheck} hint={`of ${projects.length} projects`} />
        <StatCard label="Total opens" value={totalOpens} icon={MousePointerClick} hint="across all links" />
        <StatCard label="Revoked / expired" value={inactiveCount} icon={ShieldX} />
      </div>

      <AccessLinksBrowser projects={projects} />
    </>
  );
}
