"use client";

import * as React from "react";
import {
  Building2,
  BellRing,
  Link2,
  Check,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import {
  saveStudioProfileAction,
  saveLinkDefaultsAction,
  saveNotificationPrefsAction,
} from "@/lib/actions/settings";
import { changePasswordAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

type Prefs = { inquiryAlerts: boolean; clientLinkOpened: boolean; downloadCompleted: boolean; weeklyDigest: boolean };
type LinkDefaults = { defaultExpiry: "never" | "7" | "30" | "90"; defaultAccessMode: "RESTRICTED_PREVIEW" | "FULL_ACCESS" };

function Toggle({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-line bg-white/60 p-4 text-left transition hover:border-accent"
    >
      <span>
        <span className="block text-[0.85rem] font-bold text-ink">{label}</span>
        <span className="mt-0.5 block text-[0.72rem] text-muted">{description}</span>
      </span>
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", value ? "bg-success" : "bg-line-strong")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", value ? "left-[22px]" : "left-0.5")} />
      </span>
    </button>
  );
}

function PasswordChangeForm({ adminEmail }: { adminEmail: string }) {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "ok" | "error"; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const result = await changePasswordAction({ currentPassword, newPassword });
    setBusy(false);
    if (result.ok) {
      setMessage({ type: "ok", text: "Password updated. All other sessions were revoked." });
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setMessage({ type: "error", text: result.error });
    }
  };

  return (
    <section className="rounded-2xl border border-line bg-surface-soft p-6 shadow-soft">
      <h2 className="flex items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-muted">
        <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" /> Change password
      </h2>
      <p className="mt-1.5 text-[0.8rem] text-muted">Signed in as <span className="font-bold text-ink">{adminEmail}</span>. Min. 12 characters with upper/lowercase letters and a number.</p>
      <form onSubmit={submit} className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Current password" htmlFor="current-password" required>
          <Input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </Field>
        <Field label="New password" htmlFor="new-password" required hint="≥ 12 chars, mixed case + number">
          <Input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy}>
            {busy ? <><Loader2 className="animate-spin" aria-hidden="true" /> Updating…</> : "Update password"}
          </Button>
          {message && (
            <p role="status" className={cn("mt-2 text-[0.8rem] font-semibold", message.type === "ok" ? "text-success" : "text-danger")}>
              {message.text}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}

export function SettingsClient({
  studio,
  linkDefaults,
  prefs,
  adminEmail,
}: {
  studio: { name: string; email: string; phone: string; locations: string };
  linkDefaults: LinkDefaults;
  prefs: Prefs;
  adminEmail: string;
}) {
  const [studioForm, setStudioForm] = React.useState(studio);
  const [linkForm, setLinkForm] = React.useState(linkDefaults);
  const [prefState, setPrefState] = React.useState(prefs);
  const [saved, setSaved] = React.useState<string | null>(null);

  const flash = (key: string) => {
    setSaved(key);
    window.setTimeout(() => setSaved(null), 1800);
  };

  return (
    <div className="grid max-w-4xl gap-6">
      {/* Studio profile */}
      <section className="rounded-2xl border border-line bg-surface-soft p-6 shadow-soft">
        <h2 className="flex items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-muted"><Building2 className="h-4 w-4 text-accent" aria-hidden="true" /> Studio profile</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Studio name" htmlFor="studio"><Input id="studio" value={studioForm.name} onChange={(e) => setStudioForm({ ...studioForm, name: e.target.value })} /></Field>
          <Field label="Studio email" htmlFor="studio-email"><Input id="studio-email" type="email" value={studioForm.email} onChange={(e) => setStudioForm({ ...studioForm, email: e.target.value })} /></Field>
          <Field label="Phone" htmlFor="studio-phone"><Input id="studio-phone" value={studioForm.phone} onChange={(e) => setStudioForm({ ...studioForm, phone: e.target.value })} /></Field>
          <Field label="Locations" htmlFor="studio-locations"><Input id="studio-locations" value={studioForm.locations} onChange={(e) => setStudioForm({ ...studioForm, locations: e.target.value })} /></Field>
        </div>
        <Button className="mt-4" onClick={async () => { await saveStudioProfileAction(studioForm); flash("studio"); }}>
          {saved === "studio" ? <><Check aria-hidden="true" /> Saved</> : "Save profile"}
        </Button>
      </section>

      {/* Link defaults */}
      <section className="rounded-2xl border border-line bg-surface-soft p-6 shadow-soft">
        <h2 className="flex items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-muted"><Link2 className="h-4 w-4 text-accent" aria-hidden="true" /> Client link defaults</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Default expiry for new links" htmlFor="default-expiry">
            <Select id="default-expiry" value={linkForm.defaultExpiry} onChange={(e) => setLinkForm({ ...linkForm, defaultExpiry: e.target.value as LinkDefaults["defaultExpiry"] })}>
              <option value="never">Never — until revoked</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </Select>
          </Field>
          <Field label="Default document access" htmlFor="default-access" hint="Can be changed per document at upload time.">
            <Select id="default-access" value={linkForm.defaultAccessMode} onChange={(e) => setLinkForm({ ...linkForm, defaultAccessMode: e.target.value as LinkDefaults["defaultAccessMode"] })}>
              <option value="RESTRICTED_PREVIEW">Restricted preview (not paid)</option>
              <option value="FULL_ACCESS">Full access (paid)</option>
            </Select>
          </Field>
        </div>
        <Button className="mt-4" onClick={async () => { await saveLinkDefaultsAction(linkForm); flash("links"); }}>
          {saved === "links" ? <><Check aria-hidden="true" /> Saved</> : "Save defaults"}
        </Button>
      </section>

      {/* Notifications */}
      <section className="rounded-2xl border border-line bg-surface-soft p-6 shadow-soft">
        <h2 className="flex items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-muted">
          <BellRing className="h-4 w-4 text-accent" aria-hidden="true" /> Notification preferences
        </h2>
        <p className="mt-1.5 text-[0.78rem] text-muted">Stored now; email delivery activates when Resend is configured (see README).</p>
        <div className="mt-4 grid gap-3">
          <Toggle label="New inquiry alerts" description="Notify the studio when the public form is submitted." value={prefState.inquiryAlerts} onChange={(v) => { setPrefState({ ...prefState, inquiryAlerts: v }); saveNotificationPrefsAction({ ...prefState, inquiryAlerts: v }); flash("prefs"); }} />
          <Toggle label="Client link opened" description="Notify when a client opens their private project link." value={prefState.clientLinkOpened} onChange={(v) => { setPrefState({ ...prefState, clientLinkOpened: v }); saveNotificationPrefsAction({ ...prefState, clientLinkOpened: v }); flash("prefs"); }} />
          <Toggle label="Download completed" description="Notify when a client downloads a full-access document." value={prefState.downloadCompleted} onChange={(v) => { setPrefState({ ...prefState, downloadCompleted: v }); saveNotificationPrefsAction({ ...prefState, downloadCompleted: v }); flash("prefs"); }} />
          <Toggle label="Weekly studio digest" description="A Sunday summary of uploads, links and inquiries." value={prefState.weeklyDigest} onChange={(v) => { setPrefState({ ...prefState, weeklyDigest: v }); saveNotificationPrefsAction({ ...prefState, weeklyDigest: v }); flash("prefs"); }} />
        </div>
        {saved === "prefs" && <p className="mt-2 text-[0.78rem] font-semibold text-success">Preferences saved.</p>}
      </section>

      <PasswordChangeForm adminEmail={adminEmail} />
    </div>
  );
}
