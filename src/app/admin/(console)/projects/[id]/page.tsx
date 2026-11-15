import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, UploadCloud } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/admin/page-header";
import { ProjectStatusBadge } from "@/components/admin/status-badge";
import { ProjectStatusSelect, DeleteProjectButton } from "@/components/admin/project-controls";
import { ProjectDocumentList } from "@/components/admin/project-document-list";
import { LinkManager } from "@/components/admin/link-manager";
import { prisma } from "@/lib/server/db";
import { mapProject, mapDocument, mapAccessLink } from "@/lib/server/queries";
import { formatDate, PROJECT_TYPE_LABELS } from "@/lib/utils";

export const metadata: Metadata = { title: "Project" };
export const dynamic = "force-dynamic";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [projectRow, documentRows, linkRow] = await Promise.all([
    prisma.project.findUnique({ where: { id }, include: { client: true } }),
    prisma.document.findMany({ where: { projectId: id, archivedAt: null }, orderBy: { createdAt: "desc" } }),
    prisma.projectAccessLink.findFirst({ where: { projectId: id, status: "ACTIVE" }, orderBy: { createdAt: "desc" } }),
  ]);

  if (!projectRow) {
    return (
      <EmptyState
        title="Project not found"
        body="This project may have been deleted."
        action={<Link href="/admin/projects" className="inline-flex h-11 items-center rounded-xl bg-ink px-5 text-[0.82rem] font-bold text-ivory-50">Back to projects</Link>}
      />
    );
  }

  const project = mapProject(projectRow);
  const client = projectRow.client;
  const documents = documentRows.map(mapDocument);
  const link = linkRow ? mapAccessLink(linkRow) : null;

  return (
    <>
      <PageHeader
        eyebrow={`Project · ${project.reference}`}
        title={project.name}
        description={`${PROJECT_TYPE_LABELS[project.type]} · ${project.location ?? "Location not set"} · Created ${formatDate(project.createdAt)}`}
        actions={
          <>
            <Link href="/admin/projects" className="inline-flex h-11 items-center gap-2 rounded-xl border border-line-strong bg-white/60 px-4 text-[0.82rem] font-bold text-ink transition hover:border-accent">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All projects
            </Link>
            <Link href={`/admin/documents/upload?project=${project.id}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-[0.82rem] font-bold text-ivory-50 transition hover:bg-accent-dark">
              <UploadCloud aria-hidden="true" /> Upload document
            </Link>
          </>
        }
      />

      {/* Project hero strip */}
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-line shadow-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={project.coverImage} alt={project.name} className="h-44 w-full object-cover sm:h-52" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-900/80 via-ink-900/40 to-transparent" />
        <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.22em] text-gold">Client</p>
            <Link href={`/admin/clients/${client.id}`} className="group mt-1 inline-flex items-center gap-1.5 font-display text-2xl font-semibold text-ivory-50">
              {client.fullName}
              <ArrowUpRight className="h-4 w-4 opacity-60 transition group-hover:opacity-100" aria-hidden="true" />
            </Link>
            <p className="mt-0.5 text-[0.75rem] text-ivory-100/70">{client.company}{client.location ? ` · ${client.location}` : ""}</p>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.25fr]">
        {/* Left rail — project facts + status + link */}
        <div className="grid h-fit gap-6">
          <section className="rounded-2xl border border-line bg-surface-soft p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-muted">Project details</h2>
            </div>
            <dl className="mt-4 grid gap-3 text-[0.84rem]">
              {[
                ["Reference", project.reference],
                ["Type", PROJECT_TYPE_LABELS[project.type]],
                ["Location", project.location ?? "—"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line pb-2.5">
                  <dt className="text-[0.68rem] font-extrabold uppercase tracking-wider text-faint">{k}</dt>
                  <dd className="font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[0.84rem] leading-relaxed text-muted">{project.description ?? "No description yet."}</p>
            <ProjectStatusSelect projectId={project.id} current={project.status} />
            <div className="mt-4 border-t border-line pt-4">
              <DeleteProjectButton projectId={project.id} projectName={project.name} />
            </div>
          </section>

          <LinkManager projectId={project.id} projectName={project.name} initialLink={link} />
        </div>

        {/* Right — documents */}
        <section className="rounded-2xl border border-line bg-surface-soft p-6 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-muted">Documents · {documents.length}</h2>
            <p className="text-[0.7rem] text-faint">Per-document access — change without re-uploading</p>
          </div>
          <div className="mt-4">
            <ProjectDocumentList projectId={project.id} documents={documents} />
          </div>
        </section>
      </div>
    </>
  );
}
