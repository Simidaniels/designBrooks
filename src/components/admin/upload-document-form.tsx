"use client";

import * as React from "react";
import {
  CheckCircle2,
  CloudUpload,
  FileText,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import { AccessSettingSelect } from "@/components/admin/access-setting";
import { LinkManager } from "@/components/admin/link-manager";
import { AccessModeBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { CATEGORY_LABELS, formatBytes } from "@/lib/utils";
import type { AccessMode, DocumentCategory, StudioDocument, AccessLink } from "@/lib/types";

export type ClientOption = {
  id: string;
  fullName: string;
  company: string | null;
  projects: { id: string; name: string; reference: string }[];
};
type LinkState = Omit<AccessLink, "token">;

const ACCEPTED = ["pdf", "jpg", "jpeg", "png", "webp", "dwg", "dxf", "zip"];
const MAX_BYTES = 25 * 1024 * 1024;
const extOf = (name: string) => name.split(".").pop()?.toLowerCase() ?? "";

export function UploadDocumentForm({
  clients,
  presetClient = "",
  presetProject = "",
}: {
  clients: ClientOption[];
  presetClient?: string;
  presetProject?: string;
}) {
  const [clientId, setClientId] = React.useState(presetClient);
  const [projectId, setProjectId] = React.useState(presetProject);
  const [docName, setDocName] = React.useState("");
  const [category, setCategory] = React.useState<DocumentCategory>("architectural");
  const [revision, setRevision] = React.useState("Rev A");
  const [accessMode, setAccessMode] = React.useState<AccessMode>("RESTRICTED_PREVIEW");
  const [file, setFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [busy, setBusy] = React.useState(false);
  const [uploaded, setUploaded] = React.useState<StudioDocument | null>(null);
  const [uploadedLink, setUploadedLink] = React.useState<LinkState | null>(null);
  const [formKey, setFormKey] = React.useState(0);

  const projects = React.useMemo(
    () => clients.find((c) => c.id === clientId)?.projects ?? [],
    [clients, clientId]
  );

  React.useEffect(() => {
    setProjectId((current) => (projects.some((p) => p.id === current) ? current : ""));
  }, [projects]);

  const pickFile = (f: File | null) => {
    setFileError(null);
    if (!f) return;
    const ext = extOf(f.name);
    if (!ACCEPTED.includes(ext)) {
      setFile(null);
      setFileError(`.${ext || "?"} files aren't accepted. Use PDF, JPG, PNG, WebP, DWG, DXF or ZIP.`);
      return;
    }
    if (f.size > MAX_BYTES) {
      setFile(null);
      setFileError(`File is ${formatBytes(f.size)} — the limit is 25 MB.`);
      return;
    }
    setFile(f);
    if (!docName.trim()) setDocName(f.name.replace(/\.[^.]+$/, ""));
  };

  const useSampleFile = async () => {
    setFileError(null);
    try {
      const res = await fetch("/sample-documents/design-brooks-sample-drawing.pdf");
      const blob = await res.blob();
      setFile(new File([blob], "DB-sample-drawing.pdf", { type: "application/pdf" }));
      if (!docName.trim()) setDocName("Sample Architectural Drawing");
    } catch {
      setFileError("Could not load the sample file.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!clientId) next.client = "Select a client.";
    if (!projectId) next.project = "Select the client's project.";
    if (docName.trim().length < 3) next.name = "Document name must be at least 3 characters.";
    if (!file) next.file = "Choose a file (or use the sample).";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      const body = new FormData();
      body.set("projectId", projectId);
      body.set("name", docName.trim());
      body.set("category", category);
      body.set("revision", revision.trim() || "Rev A");
      body.set("accessMode", accessMode);
      body.set("file", file!);

      const res = await fetch("/api/admin/documents/upload", { method: "POST", body });
      const payload = await res.json();
      if (!res.ok || !payload.ok) {
        setErrors({ submit: payload.error ?? "Upload failed." });
        return;
      }
      setUploaded(payload.document as StudioDocument);
      setUploadedLink((payload.link ?? null) as LinkState | null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setErrors({ submit: "Upload failed — please try again." });
    } finally {
      setBusy(false);
    }
  };

  const resetForm = () => {
    setUploaded(null);
    setUploadedLink(null);
    setDocName("");
    setFile(null);
    setRevision("Rev A");
    setAccessMode("RESTRICTED_PREVIEW");
    setErrors({});
    setFormKey((k) => k + 1);
  };

  return (
    <div>
      {/* ————— Success state ————— */}
      {uploaded && (
        <div className="mb-6 overflow-hidden rounded-2xl border border-success/30 bg-success-soft shadow-soft">
          <div className="flex flex-wrap items-start gap-4 p-6 pb-4">
            <CheckCircle2 className="mt-1 h-8 w-8 shrink-0 text-success" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl font-semibold text-ink">Document saved.</h2>
              <p className="mt-1 text-[0.85rem] text-muted">
                <span className="font-bold text-ink">{uploaded.name}</span> · {uploaded.fileType} · {formatBytes(uploaded.fileSize)} · {CATEGORY_LABELS[uploaded.category]} · {uploaded.revision}
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-[0.8rem] font-semibold text-ink/85">
                Access setting: <AccessModeBadge mode={uploaded.accessMode} />
                {uploaded.status === "failed" && <span className="text-danger">· preview generation failed</span>}
              </p>
              <p className="mt-2 text-[0.75rem] text-muted">
                {uploaded.accessMode === "RESTRICTED_PREVIEW"
                  ? "The client will see a watermarked restricted preview — no download or print controls."
                  : "The client can view the full document and download the released file."}
              </p>
            </div>
            <Button variant="outline" onClick={resetForm}>Upload another</Button>
          </div>

          {/* Link generation — appears after upload */}
          <div className="border-t border-success/25 bg-white/40 p-6 pt-5">
            <p className="mb-3 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-success">
              {uploadedLink?.status === "ACTIVE" ? "This project has an active client link — share it" : "Generate the project's private client link"}
            </p>
            <LinkManager projectId={uploaded.projectId} projectName={projects.find((p) => p.id === uploaded.projectId)?.name ?? clients.flatMap((c) => c.projects).find((p) => p.id === uploaded.projectId)?.name} initialLink={uploadedLink} />
          </div>
        </div>
      )}

      {/* ————— Upload form ————— */}
      <form key={formKey} onSubmit={submit} noValidate className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        {/* Left column — steps 1–4 */}
        <div className="grid gap-5">
          <section className="rounded-2xl border border-line bg-surface-soft p-6 shadow-soft">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-accent">Step 1 — Client</p>
            <div className="mt-3">
              <Field label="Select client" htmlFor="client" required error={errors.client}>
                <Select id="client" value={clientId} onChange={(e) => setClientId(e.target.value)} aria-invalid={!!errors.client}>
                  <option value="">Choose a client…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.fullName}{c.company ? ` — ${c.company}` : ""}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <p className="mt-6 text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-accent">Step 2 — Project</p>
            <div className="mt-3">
              <Field label="Select project" htmlFor="project" required error={errors.project} hint={clientId ? `${projects.length} project${projects.length === 1 ? "" : "s"} for this client` : "Pick a client first"}>
                <Select id="project" value={projectId} onChange={(e) => setProjectId(e.target.value)} disabled={!clientId} aria-invalid={!!errors.project}>
                  <option value="">{clientId ? "Choose a project…" : "Select a client first"}</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} · {p.reference}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <p className="mt-6 text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-accent">Step 3 — Document</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field label="Document name" htmlFor="docName" required error={errors.name} className="sm:col-span-2">
                <Input id="docName" value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="Architectural Floor Plan — Ground & First" aria-invalid={!!errors.name} />
              </Field>
              <Field label="Category" htmlFor="category">
                <Select id="category" value={category} onChange={(e) => setCategory(e.target.value as DocumentCategory)}>
                  <option value="architectural">Architectural</option>
                  <option value="structural">Structural</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="3d-render">3D Render</option>
                  <option value="other">Other</option>
                </Select>
              </Field>
              <Field label="Revision" htmlFor="revision">
                <Input id="revision" value={revision} onChange={(e) => setRevision(e.target.value)} placeholder="Rev A" />
              </Field>
            </div>
          </section>

          {/* Step 4 — file */}
          <section className="rounded-2xl border border-line bg-surface-soft p-6 shadow-soft">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-accent">Step 4 — File</p>
            <input
              id="file-input"
              type="file"
              className="sr-only"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.dwg,.dxf,.zip"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
            <label
              htmlFor="file-input"
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0] ?? null); }}
              className={`mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition ${dragging ? "border-accent bg-accent/5" : "border-line-strong bg-white/50 hover:border-accent"}`}
            >
              <UploadCloud className="h-9 w-9 text-accent" aria-hidden="true" />
              <span className="mt-3 text-[0.9rem] font-bold text-ink">Drop the file here, or <span className="text-accent-dark underline underline-offset-2">browse</span></span>
              <span className="mt-1.5 text-[0.72rem] text-muted">PDF, JPG, PNG, WebP, DWG, DXF, ZIP · max 25 MB</span>
            </label>
            {errors.file && <p role="alert" className="mt-2 text-[0.74rem] font-semibold text-danger">{errors.file}</p>}
            {fileError && <p role="alert" className="mt-2 text-[0.74rem] font-semibold text-danger">{fileError}</p>}

            {file ? (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-white/80 p-3">
                <FileText className="h-8 w-8 shrink-0 text-accent-dark" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.85rem] font-bold text-ink">{file.name}</p>
                  <p className="text-[0.7rem] text-muted">{formatBytes(file.size)} · ready to upload</p>
                </div>
                <button type="button" onClick={() => setFile(null)} aria-label="Remove file" className="rounded-lg p-2 text-faint transition hover:bg-ink/5 hover:text-danger">
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={useSampleFile} className="mt-3 text-[0.75rem] font-bold text-accent-dark underline-offset-4 hover:underline">
                No file handy? Upload the sample drawing →
              </button>
            )}
          </section>
        </div>

        {/* Right column — steps 5–6 */}
        <div className="grid h-fit gap-5">
          <section className="rounded-2xl border border-line bg-surface-soft p-6 shadow-soft">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-accent">Step 5 — Access setting</p>
            <div className="mt-4">
              <AccessSettingSelect value={accessMode} onChange={setAccessMode} />
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-ink p-6 text-ivory-100 shadow-soft">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-gold">Step 6 — Save</p>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-ivory-100/75">
              Saving uploads the file to private storage and — for restricted documents — generates the server-side watermarked preview immediately.
            </p>
            <Button type="submit" size="lg" disabled={busy} className="mt-4 w-full bg-gold text-ink-900 hover:bg-ivory-50">
              {busy ? <><Loader2 className="animate-spin" aria-hidden="true" /> Uploading &amp; preparing preview…</> : <><CloudUpload aria-hidden="true" /> Upload &amp; save document</>}
            </Button>
            {errors.submit && <p role="alert" className="mt-2 text-[0.8rem] font-semibold text-danger-soft">{errors.submit}</p>}
            <div className="mt-4 grid gap-1.5 text-[0.68rem] text-ivory-100/45">
              <p>· File type &amp; magic bytes are verified server-side (25 MB cap)</p>
              <p>· Restricted documents get a generated watermarked preview</p>
              <p>· Payment status is stored here only — never sent to the client</p>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
