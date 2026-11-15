"use client";

import * as React from "react";
import {
  Building2,
  CalendarDays,
  ChevronRight,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Lock,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/admin/page-header";
import { PdfViewer } from "@/components/client/pdf-viewer";
import { cn, CATEGORY_LABELS, formatDate } from "@/lib/utils";
import type { DocumentCategory, StudioDocument } from "@/lib/types";

export type PortalProject = {
  name: string;
  reference: string;
  location?: string;
  description?: string;
  clientName: string;
  createdAt: string;
};

export function PortalView({
  project,
  documents,
  token,
}: {
  project: PortalProject;
  documents: StudioDocument[];
  token: string;
}) {
  const [category, setCategory] = React.useState<"all" | DocumentCategory>("all");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [imgZoom, setImgZoom] = React.useState(1);
  const [imgError, setImgError] = React.useState(false);

  const filtered = category === "all" ? documents : documents.filter((d) => d.category === category);
  const selected = documents.find((d) => d.id === selectedId) ?? filtered[0] ?? documents[0];

  React.useEffect(() => {
    if (documents.length && !selectedId) setSelectedId(filtered[0]?.id ?? documents[0].id);
  }, [documents, filtered, selectedId]);

  React.useEffect(() => setImgZoom(1), [selectedId]);
  React.useEffect(() => setImgError(false), [selectedId]);

  const categoryCounts = documents.reduce<Record<string, number>>((acc, d) => {
    acc[d.category] = (acc[d.category] ?? 0) + 1;
    return acc;
  }, {});

  const selectedRestricted = selected?.accessMode === "RESTRICTED_PREVIEW";
  const fileUrl = selected ? `/api/client/documents/${selected.id}/preview?token=${encodeURIComponent(token)}` : null;
  const downloadUrl = selected ? `/api/client/documents/${selected.id}/download?token=${encodeURIComponent(token)}` : null;
  const isPdf = selected?.fileType === "PDF";
  const isImage = selected ? ["JPG", "JPEG", "PNG", "WEBP"].includes(selected.fileType) : false;

  return (
    <>
      {/* Project hero */}
      <section className="border-b border-line bg-ink text-ivory-100">
        <div className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6 sm:py-12">
          <p className="text-[0.64rem] font-extrabold uppercase tracking-[0.24em] text-gold">Private project</p>
          <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.0] text-ivory-50">{project.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8rem] text-ivory-100/75">
            <span className="inline-flex items-center gap-1.5"><Building2 className="h-4 w-4 text-gold/80" aria-hidden="true" />{project.reference}</span>
            {project.location && <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-gold/80" aria-hidden="true" />{project.location}</span>}
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-gold/80" aria-hidden="true" />Since {formatDate(project.createdAt)}</span>
          </div>
          {project.description && <p className="mt-4 max-w-2xl text-[0.92rem] leading-relaxed text-ivory-100/70">{project.description}</p>}
          <p className="mt-5 text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-ivory-100/45">Prepared for {project.clientName}</p>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-[1240px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[400px_1fr]">
        {/* Document list */}
        <section aria-label="Document list" className="h-fit rounded-2xl border border-line bg-surface-soft p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-muted">Released documents · {filtered.length}</h2>
            <FolderOpen className="h-4 w-4 text-faint" aria-hidden="true" />
          </div>

          {/* Category filter chips */}
          <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
            <button
              onClick={() => setCategory("all")}
              aria-pressed={category === "all"}
              className={cn("rounded-full border px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-wide transition", category === "all" ? "border-ink bg-ink text-ivory-50" : "border-line-strong bg-white/60 text-muted hover:text-ink")}
            >
              All · {documents.length}
            </button>
            {Object.entries(categoryCounts).map(([cat, count]) => (
              <button
                key={cat}
                onClick={() => setCategory(cat as DocumentCategory)}
                aria-pressed={category === cat}
                className={cn("rounded-full border px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-wide transition", category === cat ? "border-ink bg-ink text-ivory-50" : "border-line-strong bg-white/60 text-muted hover:text-ink")}
              >
                {CATEGORY_LABELS[cat]} · {count}
              </button>
            ))}
          </div>

          <ul className="mt-4 grid max-h-[560px] gap-2 overflow-y-auto thin-scroll">
            {filtered.length === 0 && (
              <li className="rounded-xl border border-dashed border-line-strong p-6 text-center text-[0.82rem] text-muted">
                No documents in this category yet.
              </li>
            )}
            {filtered.map((doc) => {
              const active = selected?.id === doc.id;
              const restricted = doc.accessMode === "RESTRICTED_PREVIEW";
              return (
                <li key={doc.id}>
                  <button
                    onClick={() => setSelectedId(doc.id)}
                    aria-current={active}
                    className={cn(
                      "w-full rounded-2xl border p-3.5 text-left transition-all duration-200",
                      active ? "border-accent bg-white shadow-soft ring-2 ring-accent/25" : "border-line bg-white/55 hover:border-accent/50"
                    )}
                  >
                    <span className="flex items-start gap-3">
                      <span className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", restricted ? "bg-warning-soft text-warning" : "bg-success-soft text-success")}>
                        {restricted ? <Eye className="h-5 w-5" aria-hidden="true" /> : <FileText className="h-5 w-5" aria-hidden="true" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.85rem] font-bold text-ink">{doc.name}</span>
                        <span className="mt-1 block text-[0.65rem] text-muted">{CATEGORY_LABELS[doc.category]} · {doc.fileType} · {doc.revision} · {formatDate(doc.uploadedAt)}</span>
                        <span className="mt-1.5 inline-flex items-center gap-1.5">
                          {restricted ? (
                            <Badge tone="warning" className="!text-[0.58rem]"><Eye className="h-3 w-3" aria-hidden="true" /> Preview</Badge>
                          ) : (
                            <Badge tone="success" className="!text-[0.58rem]"><Download className="h-3 w-3" aria-hidden="true" /> Available</Badge>
                          )}
                        </span>
                      </span>
                      <ChevronRight className={cn("mt-2 h-4 w-4 shrink-0 transition", active ? "text-accent-dark" : "text-faint")} aria-hidden="true" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-4 flex items-start gap-2 border-t border-line pt-4 text-[0.65rem] leading-relaxed text-faint">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            This portal shows only documents released to this project. Contents are confidential and intended solely for {project.clientName}.
          </p>
        </section>

        {/* Viewer */}
        <section aria-label="Document preview" className="min-w-0">
          {selected ? (
            <>
              <div className="overflow-hidden rounded-2xl border border-line-strong bg-ink-900 shadow-card">
                {/* Title bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-ink-900 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/25 text-gold">
                      {selectedRestricted ? <Lock className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[0.82rem] font-bold text-ivory-50">{selected.name}</p>
                      <p className="truncate text-[0.66rem] uppercase tracking-[0.14em] text-ivory-100/50">
                        {project.reference} · {CATEGORY_LABELS[selected.category]} · {selected.fileType} · {selected.revision}
                      </p>
                    </div>
                  </div>
                  {!selectedRestricted && downloadUrl && (
                    <a
                      href={downloadUrl}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-[0.72rem] font-bold uppercase tracking-wider text-white transition hover:bg-accent-dark"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" /> Download
                    </a>
                  )}
                </div>

                {/* Viewer body */}
                <div className="h-[480px] sm:h-[560px]">
                  {isPdf && fileUrl ? (
                    <PdfViewer url={fileUrl} fileName={selected.fileName} />
                  ) : isImage && fileUrl && !imgError ? (
                    <div className="flex h-full flex-col">
                      <div className="flex items-center gap-1 border-b border-white/10 bg-ink-900 px-3 py-2.5">
                        <button onClick={() => setImgZoom((z) => Math.max(0.4, +(z - 0.25).toFixed(2)))} aria-label="Zoom out" className="rounded-lg p-2 text-ivory-100/70 transition hover:bg-white/10 hover:text-ivory-50">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center text-[0.72rem] font-bold tabular-nums text-ivory-100/80">{Math.round(imgZoom * 100)}%</span>
                        <button onClick={() => setImgZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} aria-label="Zoom in" className="rounded-lg p-2 text-ivory-100/70 transition hover:bg-white/10 hover:text-ivory-50">
                          <Plus className="h-4 w-4" />
                        </button>
                        <button onClick={() => setImgZoom(1)} aria-label="Reset zoom" className="rounded-lg p-2 text-ivory-100/70 transition hover:bg-white/10 hover:text-ivory-50">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex flex-1 items-center justify-center overflow-auto bg-[#2a2620] p-4 thin-scroll">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={fileUrl}
                          alt={selected.name}
                          onError={() => setImgError(true)}
                          style={{ transform: `scale(${imgZoom})` }}
                          className="max-h-full max-w-full origin-center rounded-md object-contain transition-transform duration-150"
                        />
                      </div>
                    </div>
                  ) : selectedRestricted ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#2a2620] p-8 text-center">
                      <Lock className="h-10 w-10 text-gold/60" aria-hidden="true" />
                      <p className="max-w-sm text-[0.9rem] font-semibold leading-relaxed text-ivory-100/75">
                        This {selected.fileType} file cannot be previewed in the browser.
                      </p>
                      <p className="max-w-sm text-[0.75rem] text-ivory-100/45">The studio will release the final file through this portal when ready.</p>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 bg-[#2a2620] p-8 text-center">
                      <FileText className="h-10 w-10 text-ivory-100/40" aria-hidden="true" />
                      <p className="max-w-sm text-[0.9rem] font-semibold leading-relaxed text-ivory-100/75">
                        This format cannot be previewed in the browser.
                      </p>
                      {downloadUrl && (
                        <a href={downloadUrl} className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-[0.8rem] font-bold uppercase tracking-wider text-white transition hover:bg-accent-dark">
                          <Download className="h-4 w-4" aria-hidden="true" /> Download {selected.fileType}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Restricted strip */}
                {selectedRestricted && (
                  <div className="flex items-center justify-center gap-2 border-t border-white/10 bg-ink-900 px-4 py-2.5">
                    <Lock className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ivory-100/60">
                      Preview copy — Design Brooks property · Not for issue
                    </p>
                  </div>
                )}
              </div>

              {/* Below-viewer meta bar */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface-soft px-5 py-4 shadow-soft">
                <div className="min-w-0">
                  <p className="truncate text-[0.85rem] font-extrabold text-ink">{selected.name}</p>
                  <p className="mt-0.5 text-[0.68rem] text-muted">{selected.fileName} · {selected.fileType} · {selected.revision} · uploaded {formatDate(selected.uploadedAt)}</p>
                </div>
                {selectedRestricted ? (
                  <p className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-warning"><Eye className="h-4 w-4" aria-hidden="true" /> Preview only</p>
                ) : (
                  downloadUrl && (
                    <a href={downloadUrl} className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-[0.8rem] font-bold text-ivory-50 transition hover:bg-accent-dark">
                      <Download className="h-4 w-4" aria-hidden="true" /> Download released file
                    </a>
                  )
                )}
              </div>

              {/* Restricted advisory */}
              {selectedRestricted && (
                <p className="mt-3 flex items-start gap-2 rounded-2xl border border-warning/30 bg-warning-soft/70 px-4 py-3 text-[0.72rem] leading-relaxed text-warning">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  This sheet is a watermarked review preview issued for coordination. Final issue drawings will appear here automatically once released by the studio.
                </p>
              )}
            </>
          ) : (
            <EmptyState title="No documents yet" body="The studio hasn't released any documents to this project." />
          )}
        </section>
      </div>
    </>
  );
}
