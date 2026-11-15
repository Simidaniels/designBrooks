"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Loader2, UploadCloud, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { createProjectAction } from "@/lib/actions/projects";
import type { ProjectStatus, ProjectType } from "@/lib/types";

export type ClientOption = { id: string; fullName: string; company?: string };

const ACCEPTED_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_COVER_BYTES = 10 * 1024 * 1024;

export function NewProjectForm({ clients, presetClient = "" }: { clients: ClientOption[]; presetClient?: string }) {
  const router = useRouter();
  const [coverUrl, setCoverUrl] = React.useState<string | null>(null);
  const [coverUploading, setCoverUploading] = React.useState(false);
  const [coverDragging, setCoverDragging] = React.useState(false);
  const [coverError, setCoverError] = React.useState<string | null>(null);
  const [values, setValues] = React.useState({
    clientId: presetClient,
    name: "",
    reference: "",
    type: "residential" as ProjectType,
    location: "",
    description: "",
    status: "DRAFT" as ProjectStatus,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const set = (k: keyof typeof values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setValues({ ...values, [k]: e.target.value });

  const pickCover = async (f: File | null) => {
    setCoverError(null);
    if (!f) return;
    if (!ACCEPTED_COVER_TYPES.includes(f.type)) {
      setCoverError("Cover must be a JPG, PNG or WebP image.");
      return;
    }
    if (f.size > MAX_COVER_BYTES) {
      setCoverError("Cover exceeds the 10 MB limit.");
      return;
    }
    setCoverUploading(true);
    try {
      const body = new FormData();
      body.set("file", f);
      const res = await fetch("/api/admin/projects/cover", { method: "POST", body });
      const payload = await res.json();
      if (!res.ok || !payload.ok) {
        setCoverError(payload.error ?? "Cover upload failed.");
        return;
      }
      setCoverUrl(payload.url as string);
    } catch {
      setCoverError("Cover upload failed — please try again.");
    } finally {
      setCoverUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const next: Record<string, string> = {};
    if (!values.clientId) next.clientId = "Select a client.";
    if (values.name.trim().length < 2) next.name = "Project name is required.";
    setErrors(next);
    if (Object.keys(next).length) return;
    if (coverUploading) {
      setServerError("Wait for the cover image to finish uploading.");
      return;
    }

    setBusy(true);
    const result = await createProjectAction({ ...values, coverImage: coverUrl ?? "" });
    setBusy(false);
    if (!result.ok) { setServerError(result.error); return; }
    router.push(`/admin/projects/${result.projectId}`);
    router.refresh();
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <div className="grid gap-5 rounded-2xl border border-line bg-surface-soft p-6 shadow-soft sm:grid-cols-2">
        <Field label="Client" htmlFor="clientId" required error={errors.clientId} className="sm:col-span-2">
          <Select id="clientId" value={values.clientId} onChange={set("clientId")} aria-invalid={!!errors.clientId}>
            <option value="" disabled>Select a client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.fullName}{c.company ? ` — ${c.company}` : ""}</option>
            ))}
          </Select>
        </Field>

        <Field label="Project name" htmlFor="name" required error={errors.name} className="sm:col-span-2">
          <Input id="name" placeholder="Ikoyi Duplex House" value={values.name} onChange={set("name")} aria-invalid={!!errors.name} />
        </Field>

        <Field label="Project reference / code (optional)" htmlFor="reference" hint="Auto-generated if left blank; unique when supplied.">
          <Input id="reference" placeholder="DB-2026-014" value={values.reference} onChange={set("reference")} />
        </Field>
        <Field label="Location (optional)" htmlFor="location">
          <Input id="location" placeholder="Ikoyi, Lagos" value={values.location} onChange={set("location")} />
        </Field>

        <Field label="Project type" htmlFor="type" required>
          <Select id="type" value={values.type} onChange={set("type")}>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="interior_design">Interior Design</option>
            <option value="renovation">Renovation</option>
            <option value="other">Other</option>
          </Select>
        </Field>
        <Field label="Status" htmlFor="status" required>
          <Select id="status" value={values.status} onChange={set("status")}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </Field>

        <Field label="Description (optional)" htmlFor="description" className="sm:col-span-2">
          <Textarea id="description" rows={3} placeholder="Brief, scope, ambition…" value={values.description} onChange={set("description")} />
        </Field>

        <fieldset className="sm:col-span-2">
          <legend className="text-[0.8rem] font-extrabold tracking-wide text-ink/90">Cover image (optional)</legend>
          <input
            id="cover-input"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="sr-only"
            onChange={(e) => pickCover(e.target.files?.[0] ?? null)}
          />
          {coverUrl ? (
            <div className="relative mt-2 overflow-hidden rounded-2xl border border-line shadow-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt="Project cover preview" className="h-44 w-full object-cover" />
              <button
                type="button"
                onClick={() => setCoverUrl(null)}
                aria-label="Remove cover image"
                className="absolute right-3 top-3 rounded-full bg-ink-900/70 p-2 text-ivory-50 backdrop-blur transition hover:bg-danger"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="cover-input"
              onDragOver={(e) => { e.preventDefault(); setCoverDragging(true); }}
              onDragLeave={() => setCoverDragging(false)}
              onDrop={(e) => { e.preventDefault(); setCoverDragging(false); pickCover(e.dataTransfer.files?.[0] ?? null); }}
              className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-6 text-center transition ${coverDragging ? "border-accent bg-accent/5" : "border-line-strong bg-white/50 hover:border-accent"}`}
            >
              {coverUploading ? (
                <><Loader2 className="h-7 w-7 animate-spin text-accent" aria-hidden="true" /><span className="mt-2 text-[0.82rem] font-semibold text-muted">Uploading &amp; optimising…</span></>
              ) : (
                <>
                  <UploadCloud className="h-7 w-7 text-accent" aria-hidden="true" />
                  <span className="mt-2 text-[0.82rem] font-bold text-ink">Drop a photo here, or <span className="text-accent-dark underline underline-offset-2">browse</span></span>
                  <span className="mt-1 text-[0.68rem] text-muted">JPG, PNG or WebP · max 10 MB · resized automatically</span>
                </>
              )}
            </label>
          )}
          {coverError && <p role="alert" className="mt-2 text-[0.74rem] font-semibold text-danger">{coverError}</p>}
          <p className="mt-2 flex items-center gap-1.5 text-[0.66rem] text-faint"><ImageIcon className="h-3.5 w-3.5" aria-hidden="true" /> Used on the project card and project header.</p>
        </fieldset>
      </div>

      {serverError && <p role="alert" className="text-[0.82rem] font-semibold text-danger">{serverError}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? <><Loader2 className="animate-spin" aria-hidden="true" /> Creating…</> : <><Building2 aria-hidden="true" /> Create project</>}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Link href="/admin/projects" className="text-[0.82rem] font-semibold text-muted hover:text-ink">Back to projects</Link>
      </div>
    </form>
  );
}
