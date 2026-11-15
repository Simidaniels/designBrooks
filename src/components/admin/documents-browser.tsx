"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Plus, Search, FileStack, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/admin/page-header";
import { AccessModeBadge } from "@/components/admin/status-badge";
import { setDocumentAccessAction } from "@/lib/actions/documents";
import { CATEGORY_LABELS, formatBytes, timeAgo } from "@/lib/utils";
import type { DocumentCategory, StudioDocument } from "@/lib/types";

export type DocumentRow = StudioDocument & {
  projectName: string;
  clientName: string;
};

export function DocumentsBrowser({ documents, projects }: { documents: DocumentRow[]; projects: { id: string; name: string }[] }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<"all" | DocumentCategory>("all");
  const [access, setAccess] = React.useState<"all" | "RESTRICTED_PREVIEW" | "FULL_ACCESS">("all");
  const [projectId, setProjectId] = React.useState<"all" | string>("all");
  const [busy, setBusy] = React.useState<string | null>(null);

  const filtered = documents.filter((doc) => {
    if (category !== "all" && doc.category !== category) return false;
    if (access !== "all" && doc.accessMode !== access) return false;
    if (projectId !== "all" && doc.projectId !== projectId) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [doc.name, doc.fileName, doc.revision, doc.projectName, doc.clientName]
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const toggle = async (doc: DocumentRow) => {
    setBusy(doc.id);
    await setDocumentAccessAction(doc.id, doc.accessMode === "FULL_ACCESS" ? "RESTRICTED_PREVIEW" : "FULL_ACCESS");
    setBusy(null);
    router.refresh();
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search document, file, project…" aria-label="Search documents" className="pl-11" />
        </div>
        <div className="grid grid-cols-3 gap-3 sm:flex">
          <Select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} aria-label="Filter by category" className="sm:w-40">
            <option value="all">All categories</option>
            <option value="architectural">Architectural</option>
            <option value="structural">Structural</option>
            <option value="electrical">Electrical</option>
            <option value="plumbing">Plumbing</option>
            <option value="3d-render">3D Render</option>
            <option value="other">Other</option>
          </Select>
          <Select value={access} onChange={(e) => setAccess(e.target.value as typeof access)} aria-label="Filter by access" className="sm:w-40">
            <option value="all">All access</option>
            <option value="FULL_ACCESS">Paid · Full</option>
            <option value="RESTRICTED_PREVIEW">Not paid · Restricted</option>
          </Select>
          <Select value={projectId} onChange={(e) => setProjectId(e.target.value)} aria-label="Filter by project" className="sm:w-48">
            <option value="all">All projects</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<FileStack className="h-10 w-10" />} title="No documents match" body="Clear the filters, or upload a new document to a project." action={<Link href="/admin/documents/upload" className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-[0.82rem] font-bold text-ivory-50"><Plus aria-hidden="true" /> Upload document</Link>} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface-soft shadow-soft thin-scroll">
          <table className="data-table w-full min-w-[820px] border-collapse">
            <thead>
              <tr>
                <th>Document</th>
                <th>Project</th>
                <th>Category</th>
                <th>Size</th>
                <th>Access (admin only)</th>
                <th>Uploaded</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <span className="flex items-center gap-2 font-bold text-ink"><FileText className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" /><span className="max-w-[260px] truncate">{doc.name}</span></span>
                    <span className="mt-0.5 block pl-6 text-[0.68rem] text-faint">{doc.fileName} · {doc.revision}{doc.status === "processing" ? " · processing" : ""}{doc.status === "failed" ? " · preview failed" : ""}</span>
                  </td>
                  <td>
                    <Link href={`/admin/projects/${doc.projectId}`} className="font-semibold text-ink hover:text-accent-dark hover:underline">{doc.projectName}</Link>
                    <span className="block text-[0.68rem] text-muted">{doc.clientName}</span>
                  </td>
                  <td className="text-muted">{CATEGORY_LABELS[doc.category]}</td>
                  <td className="tabular-nums text-muted">{formatBytes(doc.fileSize)}</td>
                  <td>
                    <button onClick={() => toggle(doc)} disabled={busy === doc.id} title="Click to toggle access" className="inline-flex items-center gap-1.5 transition hover:opacity-80 disabled:opacity-60">
                      <AccessModeBadge mode={doc.accessMode} />
                      {busy === doc.id && <Loader2 className="h-3.5 w-3.5 animate-spin text-faint" aria-hidden="true" />}
                    </button>
                  </td>
                  <td className="text-muted">{timeAgo(doc.uploadedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-[0.7rem] text-faint">{filtered.length} of {documents.length} documents · persisted in PostgreSQL · click an access badge to flip it instantly.</p>
    </>
  );
}
