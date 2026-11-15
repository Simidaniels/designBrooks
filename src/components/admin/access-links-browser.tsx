"use client";

import * as React from "react";
import { Link2, MousePointerClick, ShieldCheck, ShieldX, Clock } from "lucide-react";
import { LinkStatusBadge } from "@/components/admin/status-badge";
import { LinkManager } from "@/components/admin/link-manager";
import { cn, formatDateTime, timeAgo } from "@/lib/utils";
import type { AccessLink } from "@/lib/types";

export type LinkRow = Omit<AccessLink, "token">;
export type ProjectLinkRow = {
  id: string;
  name: string;
  reference: string;
  clientName: string;
  link: LinkRow | null;
};

export function AccessLinksBrowser({ projects }: { projects: ProjectLinkRow[] }) {
  const [selectedId, setSelectedId] = React.useState(projects[0]?.id ?? "");
  const selected = projects.find((p) => p.id === selectedId) ?? projects[0];

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_1fr]">
      {/* Link register */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface-soft shadow-soft">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-muted">Link register</h2>
        </div>
        <ul className="divide-y divide-line">
          {projects.map((project) => {
            const active = selected?.id === project.id;
            return (
              <li key={project.id}>
                <button
                  onClick={() => setSelectedId(project.id)}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-center gap-4 px-5 py-4 text-left transition",
                    active ? "bg-accent/10" : "hover:bg-white/60"
                  )}
                >
                  <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", project.link?.status === "ACTIVE" ? "bg-success/12 text-success" : "bg-ink/5 text-faint")}>
                    <Link2 className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.86rem] font-extrabold text-ink">{project.name}</span>
                    <span className="mt-0.5 block text-[0.68rem] text-muted">{project.clientName} · {project.reference}</span>
                    {project.link && (
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[0.62rem] text-faint">
                        <span className="inline-flex items-center gap-1"><MousePointerClick className="h-3 w-3" />{project.link.openCount} opens</span>
                        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{project.link.lastAccessedAt ? `last ${timeAgo(project.link.lastAccessedAt)}` : "never opened"}</span>
                        {project.link.expiresAt && <span>expires {formatDateTime(project.link.expiresAt)}</span>}
                      </span>
                    )}
                  </span>
                  {project.link ? <LinkStatusBadge status={project.link.status} /> : <span className="text-[0.68rem] font-bold uppercase tracking-wider text-faint">No link</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Selected project link manager */}
      {selected ? (
        <div className="h-fit xl:sticky xl:top-20">
          <div className="rounded-2xl border border-line bg-surface-soft p-5 shadow-soft">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-accent">Managing</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink">{selected.name}</h2>
            <p className="mt-0.5 text-[0.75rem] text-muted">{selected.reference} · {selected.clientName}</p>
            <div className="mt-4">
              <LinkManager projectId={selected.id} projectName={selected.name} initialLink={selected.link} />
            </div>
          </div>
        </div>
      ) : (
        <p className="p-6 text-muted">Create a project first — then generate its link here.</p>
      )}
    </div>
  );
}
