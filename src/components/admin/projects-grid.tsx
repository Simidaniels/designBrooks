"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Building2, Plus, Search, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/admin/page-header";
import { ProjectStatusBadge } from "@/components/admin/status-badge";
import { PROJECT_TYPE_LABELS, formatDate } from "@/lib/utils";
import type { Project, ProjectStatus, ProjectType } from "@/lib/types";

type StatusFilter = "ALL" | ProjectStatus;
type TypeFilter = "ALL" | ProjectType;

export function ProjectsGrid({ projects, clientNames, docCounts }: { projects: Project[]; clientNames: Record<string, string>; docCounts: Record<string, number> }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("ALL");
  const [type, setType] = React.useState<TypeFilter>("ALL");

  const filtered = projects.filter((p) => {
    if (status !== "ALL" && p.status !== status) return false;
    if (type !== "ALL" && p.type !== type) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [p.name, p.reference, p.location, clientNames[p.clientId]]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(q));
  });

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search project, reference, client…" aria-label="Search projects" className="pl-11" />
        </div>
        <div className="flex gap-3">
          <Select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} aria-label="Filter by status" className="w-40">
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
          <Select value={type} onChange={(e) => setType(e.target.value as TypeFilter)} aria-label="Filter by type" className="w-44">
            <option value="ALL">All types</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="interior_design">Interior Design</option>
            <option value="renovation">Renovation</option>
            <option value="other">Other</option>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Building2 className="h-10 w-10" />} title="No projects match" body="Adjust the filters or create a new project." action={<Button onClick={() => router.push("/admin/projects/new")}><Plus aria-hidden="true" /> New project</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((project) => (
            <Link key={project.id} href={`/admin/projects/${project.id}`} className="group overflow-hidden rounded-2xl border border-line bg-surface-soft shadow-soft transition hover:-translate-y-1 hover:shadow-card">
              <div className="relative h-40 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.coverImage} alt={project.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-ink-900/20 to-transparent" />
                <span className="absolute left-4 top-4"><ProjectStatusBadge status={project.status} /></span>
                <span className="absolute bottom-3 left-4 right-4">
                  <span className="block text-[0.6rem] font-extrabold uppercase tracking-[0.18em] text-gold">{PROJECT_TYPE_LABELS[project.type]} · {project.location ?? "No location"}</span>
                  <span className="mt-1 block font-display text-2xl font-semibold leading-tight text-ivory-50">{project.name}</span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0 text-[0.75rem] text-muted">
                  <span className="block truncate font-bold text-ink">{clientNames[project.clientId] ?? "—"}</span>
                  <span className="mt-0.5 block">{project.reference} · {docCounts[project.id] ?? 0} document{(docCounts[project.id] ?? 0) === 1 ? "" : "s"} · {formatDate(project.createdAt)}</span>
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-faint transition group-hover:text-accent-dark" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
