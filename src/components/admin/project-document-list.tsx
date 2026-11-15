"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  FolderOpen,
  UploadCloud,
  Trash2,
  ShieldCheck,
  ShieldX,
  Check,
  Loader2,
  FileWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/admin/page-header";
import { AccessModeBadge } from "@/components/admin/status-badge";
import { setDocumentAccessAction, deleteDocumentAction } from "@/lib/actions/documents";
import { CATEGORY_LABELS, formatBytes, timeAgo } from "@/lib/utils";
import type { StudioDocument } from "@/lib/types";

export function ProjectDocumentList({ projectId, documents }: { projectId: string; documents: StudioDocument[] }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<string | null>(null);
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const toggleAccess = async (id: string, mode: "RESTRICTED_PREVIEW" | "FULL_ACCESS") => {
    setBusy(id);
    setError(null);
    const result = await setDocumentAccessAction(id, mode);
    setBusy(null);
    if (!result.ok) setError(result.error);
    else router.refresh();
  };

  const remove = async (id: string) => {
    setBusy(id);
    setError(null);
    const result = await deleteDocumentAction(id);
    setBusy(null);
    setConfirmId(null);
    if (!result.ok) setError(result.error);
    else router.refresh();
  };

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={<FolderOpen className="h-10 w-10" />}
        title="No documents released yet"
        body="Upload the first drawing, select its access setting, then generate the project's private link."
        action={
          <Link href={`/admin/documents/upload?project=${projectId}`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-[0.82rem] font-bold text-ivory-50 transition hover:bg-accent-dark">
            <UploadCloud aria-hidden="true" /> Upload document
          </Link>
        }
      />
    );
  }

  return (
    <div>
      {error && <p role="alert" className="mb-2 text-[0.78rem] font-semibold text-danger">{error}</p>}
      <ul className="grid gap-3">
        {documents.map((doc) => (
          <li key={doc.id} className="rounded-2xl border border-line bg-white/70 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[0.88rem] font-extrabold text-ink">
                  <FileText className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <span className="truncate">{doc.name}</span>
                </p>
                <p className="mt-1 text-[0.68rem] text-muted">
                  {doc.fileName} · {formatBytes(doc.fileSize)} · {CATEGORY_LABELS[doc.category]} · {doc.revision} · {timeAgo(doc.uploadedAt)}
                  {doc.status === "processing" && <span className="ml-2 font-bold text-warning">· preview processing</span>}
                </p>
              </div>
              <AccessModeBadge mode={doc.accessMode} />
            </div>

            {doc.status === "failed" && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-danger-soft px-2.5 py-1.5 text-[0.68rem] font-semibold text-danger">
                <FileWarning className="h-3.5 w-3.5" aria-hidden="true" /> Preview could not be generated — full-access clients can still download.
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
              <div className="inline-flex overflow-hidden rounded-xl border border-line-strong" role="group" aria-label={`Access mode for ${doc.name}`}>
                <button
                  onClick={() => toggleAccess(doc.id, "RESTRICTED_PREVIEW")}
                  aria-pressed={doc.accessMode === "RESTRICTED_PREVIEW"}
                  disabled={busy === doc.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-[0.7rem] font-extrabold uppercase tracking-wide transition disabled:opacity-60 ${doc.accessMode === "RESTRICTED_PREVIEW" ? "bg-warning text-white" : "bg-white/60 text-muted hover:text-ink"}`}
                >
                  <ShieldX className="h-3.5 w-3.5" aria-hidden="true" /> Not paid
                </button>
                <button
                  onClick={() => toggleAccess(doc.id, "FULL_ACCESS")}
                  aria-pressed={doc.accessMode === "FULL_ACCESS"}
                  disabled={busy === doc.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 text-[0.7rem] font-extrabold uppercase tracking-wide transition disabled:opacity-60 ${doc.accessMode === "FULL_ACCESS" ? "bg-success text-white" : "bg-white/60 text-muted hover:text-ink"}`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Paid
                </button>
              </div>

              {busy === doc.id ? (
                <Loader2 className="h-5 w-5 animate-spin text-faint" aria-hidden="true" />
              ) : confirmId === doc.id ? (
                <span className="inline-flex items-center gap-2">
                  <span className="text-[0.72rem] font-bold text-danger">Delete?</span>
                  <Button size="sm" variant="danger" onClick={() => remove(doc.id)}>Yes</Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>No</Button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmId(doc.id)}
                  aria-label={`Delete ${doc.name}`}
                  title="Delete document"
                  className="rounded-lg p-2 text-faint transition hover:bg-danger-soft hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-center gap-2 text-[0.7rem] text-faint">
        <Check className="h-4 w-4 text-success" aria-hidden="true" />
        One private link per project — all documents above travel together through it.
      </p>
    </div>
  );
}
