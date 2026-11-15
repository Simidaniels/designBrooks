"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { createClientAction } from "@/lib/actions/clients";

export function ClientForm({ existingEmails }: { existingEmails: string[] }) {
  const router = useRouter();
  const [values, setValues] = React.useState({
    fullName: "", email: "", phone: "", company: "", location: "", internalNotes: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [duplicate, setDuplicate] = React.useState<string | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = { ...values, [k]: e.target.value };
    setValues(v);
    if (k === "email") {
      const norm = e.target.value.trim().toLowerCase();
      setDuplicate(norm.length > 4 && existingEmails.includes(norm) ? norm : null);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const next: Record<string, string> = {};
    if (values.fullName.trim().length < 2) next.fullName = "Full name is required.";
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) next.email = "Enter a valid email address.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    const result = await createClientAction(values);
    setBusy(false);
    if (!result.ok) {
      setServerError(result.error);
      return;
    }
    router.push(`/admin/clients/${result.clientId}`);
    router.refresh();
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-5">
      <div className="grid gap-5 rounded-2xl border border-line bg-surface-soft p-6 shadow-soft sm:grid-cols-2">
        <Field label="Full name" htmlFor="fullName" required error={errors.fullName} className="sm:col-span-2">
          <Input id="fullName" placeholder="Adaeze Okafor" autoComplete="name" value={values.fullName} onChange={set("fullName")} aria-invalid={!!errors.fullName} />
        </Field>
        <Field label="Email (optional, recommended)" htmlFor="email" error={errors.email}>
          <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" value={values.email} onChange={set("email")} aria-invalid={!!errors.email} />
          {duplicate && (
            <p role="status" className="mt-2 flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-soft px-3 py-2 text-[0.74rem] font-semibold text-warning">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              A client with this email already exists. You can still save, or open the existing record.
            </p>
          )}
        </Field>
        <Field label="Phone (optional)" htmlFor="phone">
          <Input id="phone" type="tel" placeholder="+234 …" autoComplete="tel" value={values.phone} onChange={set("phone")} />
        </Field>
        <Field label="Company / organization (optional)" htmlFor="company">
          <Input id="company" placeholder="Okafor Family / Whitfield Group…" value={values.company} onChange={set("company")} />
        </Field>
        <Field label="Address / location (optional)" htmlFor="location">
          <Input id="location" placeholder="Ikoyi, Lagos" value={values.location} onChange={set("location")} />
        </Field>
        <Field label="Internal notes — admin only" htmlFor="internalNotes" className="sm:col-span-2" hint="Never visible to the client or in the portal.">
          <Textarea id="internalNotes" rows={4} placeholder="Budget signals, preferred channels, site notes…" value={values.internalNotes} onChange={set("internalNotes")} />
        </Field>
      </div>

      {serverError && <p role="alert" className="text-[0.82rem] font-semibold text-danger">{serverError}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? <><Loader2 className="animate-spin" aria-hidden="true" /> Saving…</> : <><UserPlus aria-hidden="true" /> Save client</>}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
