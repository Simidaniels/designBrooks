"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Field, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { setProjectStatusAction, deleteProjectAction } from "@/lib/actions/projects";
import type { ProjectStatus } from "@/lib/types";

export function ProjectStatusSelect({ projectId, current }: { projectId: string; current: ProjectStatus }) {
  const router = useRouter();
  const [value, setValue] = React.useState(current);
  const [busy, setBusy] = React.useState(false);

  const change = async (status: ProjectStatus) => {
    setValue(status);
    setBusy(true);
    await setProjectStatusAction(projectId, status);
    setBusy(false);
    router.refresh();
  };

  return (
    <Field label="Status" htmlFor="status" className="mt-4">
      <Select id="status" value={value} disabled={busy} onChange={(e) => change(e.target.value as ProjectStatus)}>
        <option value="DRAFT">Draft</option>
        <option value="ACTIVE">Active</option>
        <option value="COMPLETED">Completed</option>
        <option value="ARCHIVED">Archived</option>
      </Select>
    </Field>
  );
}

export function DeleteProjectButton({ projectId, projectName }: { projectId: string; projectName: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const remove = async () => {
    setBusy(true);
    setError(null);
    const result = await deleteProjectAction(projectId);
    if (!result.ok) { setBusy(false); setError(result.error); return; }
    router.push("/admin/projects");
    router.refresh();
  };

  if (confirm) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger-soft p-4">
        <p className="text-[0.78rem] font-bold leading-snug text-danger">
          Delete “{projectName}” and every document in it? This cannot be undone.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" variant="danger" disabled={busy} onClick={remove}>
            {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Trash2 aria-hidden="true" />} Delete project
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>Cancel</Button>
        </div>
        {error && <p role="alert" className="mt-2 text-[0.75rem] font-semibold text-danger">{error}</p>}
      </div>
    );
  }

  return (
    <button onClick={() => setConfirm(true)} className="text-[0.78rem] font-bold text-danger underline-offset-4 hover:underline">
      Delete project…
    </button>
  );
}
