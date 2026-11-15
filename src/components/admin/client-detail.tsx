"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Building2, Check, Pencil, Plus, UserRound, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { ProjectStatusBadge } from "@/components/admin/status-badge";
import { updateClientAction, archiveClientAction, deleteClientAction } from "@/lib/actions/clients";
import { PROJECT_TYPE_LABELS, formatDate } from "@/lib/utils";
import type { Client, Project } from "@/lib/types";

export function ClientDetail({ client, projects }: { client: Client; projects: Project[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState({
    fullName: client.fullName,
    email: client.email ?? "",
    phone: client.phone ?? "",
    company: client.company ?? "",
    location: client.location ?? "",
    internalNotes: client.internalNotes ?? "",
  });
  const [saved, setSaved] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const save = async () => {
    setServerError(null);
    setBusy(true);
    const result = await updateClientAction(client.id, draft);
    setBusy(false);
    if (!result.ok) { setServerError(result.error); return; }
    setEditing(false);
    setSaved(true);
    router.refresh();
    window.setTimeout(() => setSaved(false), 2000);
  };

  const remove = async () => {
    setBusy(true);
    const result = await deleteClientAction(client.id);
    if (!result.ok) { setBusy(false); setServerError(result.error); return; }
    router.push("/admin/clients");
    router.refresh();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
      {/* Profile card */}
      <section className="h-fit rounded-2xl border border-line bg-surface-soft p-6 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-muted">Profile</h2>
          <div className="flex items-center gap-2">
            {client.archived ? <Badge tone="danger">Archived</Badge> : saved ? <Badge tone="success">Saved ✓</Badge> : <Badge tone="success">Active</Badge>}
            <Button size="sm" variant={editing ? "accent" : "outline"} onClick={() => (editing ? save() : setEditing(true))} disabled={busy}>
              {editing ? <><Check aria-hidden="true" /> Save</> : <><Pencil aria-hidden="true" /> Edit</>}
            </Button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 border-b border-line pb-5">
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/12 text-accent-dark">
            <UserRound className="h-8 w-8" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold text-ink">{client.fullName}</p>
            <p className="truncate text-[0.82rem] text-muted">{client.email ?? "No email on file"}</p>
          </div>
        </div>

        {editing ? (
          <div className="mt-5 grid gap-4">
            <Field label="Full name" required><Input value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} /></Field>
            <Field label="Email"><Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></Field>
            <Field label="Phone"><Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></Field>
            <Field label="Company / organization"><Input value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} /></Field>
            <Field label="Address / location"><Input value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} /></Field>
            <Field label="Internal notes — admin only"><Textarea rows={4} value={draft.internalNotes} onChange={(e) => setDraft({ ...draft, internalNotes: e.target.value })} /></Field>
          </div>
        ) : (
          <dl className="mt-5 grid gap-3 text-[0.86rem]">
            {[
              ["Email", client.email ?? "—"],
              ["Phone", client.phone ?? "—"],
              ["Company", client.company ?? "—"],
              ["Location", client.location ?? "—"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line pb-2.5">
                <dt className="text-[0.7rem] font-extrabold uppercase tracking-wider text-faint">{k}</dt>
                <dd className="text-right font-semibold text-ink">{v}</dd>
              </div>
            ))}
            <div>
              <dt className="text-[0.7rem] font-extrabold uppercase tracking-wider text-faint">Internal notes</dt>
              <dd className="mt-1.5 rounded-xl border border-warning/25 bg-warning-soft/60 p-3 text-[0.8rem] leading-relaxed text-warning">
                {client.internalNotes?.trim() ? client.internalNotes : "No internal notes yet."}
              </dd>
            </div>
          </dl>
        )}

        {serverError && <p role="alert" className="mt-3 text-[0.78rem] font-semibold text-danger">{serverError}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <button
            onClick={async () => { setBusy(true); await archiveClientAction(client.id); setBusy(false); router.refresh(); }}
            disabled={busy}
            className="text-[0.78rem] font-bold text-warning underline-offset-4 hover:underline disabled:opacity-50"
          >
            {client.archived ? "Restore client" : "Archive client"}
          </button>
          {confirmDelete ? (
            <span className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2">
              <span className="text-[0.74rem] font-bold text-danger">Delete client and ALL their projects &amp; files?</span>
              <Button size="sm" variant="danger" disabled={busy} onClick={remove}>Delete forever</Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </span>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1.5 text-[0.78rem] font-bold text-danger underline-offset-4 hover:underline">
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete client
            </button>
          )}
        </div>
      </section>

      {/* Associated projects */}
      <section className="rounded-2xl border border-line bg-surface-soft p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-muted">Projects · {projects.length}</h2>
          <Link href={`/admin/projects/new?client=${client.id}`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-[0.78rem] font-bold text-ivory-50 transition hover:bg-accent-dark">
            <Plus className="h-4 w-4" aria-hidden="true" /> New project
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line-strong bg-ivory-100/50 px-6 py-12 text-center">
            <Building2 className="mx-auto h-9 w-9 text-sand" aria-hidden="true" />
            <h3 className="mt-3 font-display text-2xl font-semibold text-ink">No projects yet</h3>
            <p className="mt-1 text-[0.85rem] text-muted">Create the first project for this client — the private link comes after the first document upload.</p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3">
            {projects.map((project) => (
              <li key={project.id}>
                <Link href={`/admin/projects/${project.id}`} className="group flex items-center gap-4 rounded-2xl border border-line bg-white/60 p-4 transition hover:border-accent hover:shadow-soft">
                  <div className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-[0.92rem] font-extrabold text-ink transition group-hover:text-accent-dark">{project.name}</span>
                      <ProjectStatusBadge status={project.status} />
                    </span>
                    <span className="mt-1 block text-[0.7rem] text-muted">{project.reference} · {PROJECT_TYPE_LABELS[project.type]} · {project.location ?? "No location"}</span>
                  </div>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-faint transition group-hover:text-accent-dark" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
