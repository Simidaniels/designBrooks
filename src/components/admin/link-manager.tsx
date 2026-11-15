"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Copy,
  ExternalLink,
  Link2,
  Mail,
  MessageCircle,
  RefreshCw,
  Share2,
  ShieldCheck,
  ShieldX,
  TriangleAlert,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Select } from "@/components/ui/field";
import { LinkStatusBadge } from "@/components/admin/status-badge";
import {
  generateLinkAction,
  revokeLinkAction,
  regenerateLinkAction,
  setLinkExpiryAction,
} from "@/lib/actions/links";
import { formatDateTime } from "@/lib/utils";
import type { LinkExpiryInput } from "@/lib/validation";
import type { AccessLink } from "@/lib/types";

type LinkState = Omit<AccessLink, "token">;

export function LinkManager({
  projectId,
  projectName,
  initialLink,
}: {
  projectId: string;
  projectName?: string;
  initialLink: LinkState | null;
}) {
  const router = useRouter();
  const [link, setLink] = React.useState<LinkState | null>(initialLink);
  // Fresh token exists only in memory right after generate/regenerate — never persisted.
  const [fresh, setFresh] = React.useState<{ id: string; token: string } | null>(null);
  const [expiry, setExpiry] = React.useState<LinkExpiryInput>("never");
  const [copied, setCopied] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [confirm, setConfirm] = React.useState<"revoke" | "regenerate" | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [origin, setOrigin] = React.useState(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");

  React.useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  React.useEffect(() => {
    setLink(initialLink);
    // Keep the freshly generated link visible across the post-generate
    // refresh; drop it once the page is revisited or the underlying link changed.
    setFresh((current) => (current && initialLink && current.id === initialLink.id ? current : null));
  }, [initialLink]);

  const url = fresh ? `${origin}/client/project/${fresh.token}` : null;
  const active = link?.status === "ACTIVE";

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const shareText = url ? `Your Design Brooks project documents are ready: ${url}` : "";
  const shareWhatsApp = () =>
    url && window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank", "noopener,noreferrer");
  const shareEmail = () => {
    if (!url) return;
    window.location.href = `mailto:?subject=${encodeURIComponent(
      `Design Brooks — ${projectName ?? "project"} documents`
    )}&body=${encodeURIComponent(`${shareText}\n\nOpen the link to view the documents released to you.`)}`;
  };
  const shareLink = async () => {
    if (!url) return;
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title: `Design Brooks — ${projectName ?? "project"} documents`, text: shareText, url });
        return;
      } catch {
        // user dismissed or share failed — fall back to clipboard
      }
    }
    await copy();
  };

  const handleGenerate = async () => {
    setBusy("generate");
    setError(null);
    const result = await generateLinkAction(projectId, expiry);
    setBusy(null);
    if (!result.ok) { setError(result.error); return; }
    setFresh(result.token && result.linkId ? { id: result.linkId, token: result.token } : null);
    setLink({ id: result.linkId!, projectId, status: "ACTIVE", createdAt: new Date().toISOString(), expiresAt: result.expiresAt, lastAccessedAt: null, openCount: 0 });
    router.refresh();
  };

  const handleRevoke = async () => {
    setBusy("revoke");
    setError(null);
    const result = await revokeLinkAction(projectId);
    setBusy(null);
    setConfirm(null);
    if (!result.ok) { setError(result.error); return; }
    setLink((l) => (l ? { ...l, status: "REVOKED" } : l));
    setFresh(null);
    router.refresh();
  };

  const handleRegenerate = async () => {
    setBusy("regenerate");
    setError(null);
    const result = await regenerateLinkAction(projectId, expiry);
    setBusy(null);
    setConfirm(null);
    if (!result.ok) { setError(result.error); return; }
    setFresh(result.token && result.linkId ? { id: result.linkId, token: result.token } : null);
    setLink({ id: result.linkId!, projectId, status: "ACTIVE", createdAt: new Date().toISOString(), expiresAt: result.expiresAt, lastAccessedAt: null, openCount: 0 });
    router.refresh();
  };

  const handleExpiry = async (value: LinkExpiryInput) => {
    setExpiry(value);
    if (!link || link.status !== "ACTIVE") return;
    setBusy("expiry");
    setError(null);
    const result = await setLinkExpiryAction(projectId, value);
    setBusy(null);
    if (!result.ok) { setError(result.error); return; }
    setLink((l) => (l ? { ...l, expiresAt: result.expiresAt ?? null } : l));
    router.refresh();
  };

  /* ————— No active link state ————— */
  if (!link || !active) {
    return (
      <div className="rounded-2xl border border-line bg-ivory-100/60 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded-xl bg-accent/10 p-2.5 text-accent-dark">
              <Link2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="flex items-center gap-2 text-[0.92rem] font-extrabold text-ink">
                Client access link
                {link && <LinkStatusBadge status={link.status} />}
              </h3>
              <p className="mt-1 max-w-md text-[0.8rem] leading-snug text-muted">
                {link
                  ? link.status === "REVOKED"
                    ? "The previous link was revoked. Documents remain attached to the project — generate a fresh link to restore client access."
                    : "The previous link expired. Generate a fresh link to restore client access."
                  : "No link exists yet. Generate one private, reusable link for this project — every document you add will be reachable through it."}
              </p>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={busy === "generate"} className="shrink-0">
            {busy === "generate" ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Link2 aria-hidden="true" />}
            {link ? "Regenerate Client Link" : "Generate Client Link"}
          </Button>
        </div>
        <div className="mt-4 max-w-xs border-t border-line pt-4">
          <Field label="Link expiry" htmlFor="gen-expiry">
            <Select id="gen-expiry" value={expiry} onChange={(e) => setExpiry(e.target.value as LinkExpiryInput)}>
              <option value="never">Never — until revoked</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </Select>
          </Field>
        </div>
        {error && <p role="alert" className="mt-2 text-[0.78rem] font-semibold text-danger">{error}</p>}
      </div>
    );
  }

  /* ————— Active link state ————— */
  return (
    <div className="rounded-2xl border border-success/30 bg-success-soft/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-success/15 p-2.5 text-success">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-[0.92rem] font-extrabold text-ink">Private client link — active</h3>
            <p className="mt-0.5 text-[0.72rem] text-muted">
              One link per project · {link.openCount} opens · last accessed {formatDateTime(link.lastAccessedAt)}
              {link.expiresAt ? ` · expires ${formatDateTime(link.expiresAt)}` : " · no expiry"}
            </p>
          </div>
        </div>
        <LinkStatusBadge status="ACTIVE" />
      </div>

      {/* URL display + copy + share — token only exists right after generation/regeneration */}
      {url ? (
        <div className="mt-4 rounded-2xl border border-success/40 bg-white/90 p-4 shadow-soft">
          <p className="flex items-center gap-2 text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-success">
            <Share2 className="h-4 w-4" aria-hidden="true" /> Link ready — copy or share it now
          </p>
          <div className="mt-2 flex flex-col gap-2 lg:flex-row">
            <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap rounded-xl border border-success/25 bg-ivory-100/60 px-4 py-3 text-[0.8rem] text-ink thin-scroll">
              {url}
            </code>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button onClick={copy} variant={copied ? "accent" : "dark"} className="shrink-0">
                {copied ? <><Check aria-hidden="true" /> Copied</> : <><Copy aria-hidden="true" /> Copy link</>}
              </Button>
              <Button onClick={shareLink} variant="dark" className="shrink-0">
                <Share2 aria-hidden="true" /> Share link
              </Button>
            </div>
          </div>
          <p className="mt-2.5 flex items-start gap-2 rounded-xl border border-warning/30 bg-warning-soft/60 px-3 py-2 text-[0.74rem] leading-snug text-warning">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span><span className="font-bold">Save this link before leaving the page.</span> It is shown only once — after a refresh or when you revisit this page, the original link can no longer be displayed and can only be replaced with Regenerate.</span>
          </p>
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-line bg-white/70 px-4 py-3 text-[0.78rem] leading-relaxed text-muted">
          The link is stored as a secure hash — it cannot be shown again after this page was loaded.
          Use <button className="font-bold text-accent-dark underline underline-offset-2" onClick={() => setConfirm("regenerate")}>Regenerate</button> to issue a fresh link, or share it via the buttons available right after generation.
        </div>
      )}

      {/* Share + manage actions */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={shareWhatsApp} disabled={!url} title={url ? "Share via WhatsApp" : "Available right after generating a link"}>
          <MessageCircle aria-hidden="true" /> WhatsApp
        </Button>
        <Button size="sm" variant="outline" onClick={shareEmail} disabled={!url} title={url ? "Share via email" : "Available right after generating a link"}>
          <Mail aria-hidden="true" /> Email
        </Button>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-line-strong bg-white/60 px-3.5 text-[0.8rem] font-semibold text-ink transition hover:border-accent hover:text-accent-dark"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> Open as client
          </a>
        )}

        <span className="mx-1 hidden h-5 w-px bg-line-strong sm:block" aria-hidden="true" />

        {confirm === null ? (
          <>
            <Button size="sm" variant="dangerOutline" onClick={() => setConfirm("revoke")} disabled={busy !== null}>
              <ShieldX aria-hidden="true" /> Revoke
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirm("regenerate")} disabled={busy !== null}>
              <RefreshCw aria-hidden="true" /> Regenerate
            </Button>
          </>
        ) : (
          <span className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-danger/30 bg-danger-soft px-3 py-2">
            <span className="text-[0.75rem] font-bold text-danger">
              {confirm === "revoke" ? "Revoke this link? Clients lose access immediately." : "Regenerate? The current link stops working."}
            </span>
            <Button size="sm" variant="danger" disabled={busy !== null} onClick={confirm === "revoke" ? handleRevoke : handleRegenerate}>
              {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : "Confirm"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
          </span>
        )}
      </div>

      {/* Expiry control */}
      <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-success/20 pt-4">
        <Field label="Expiry" htmlFor="link-expiry" className="min-w-[180px]">
          <Select
            id="link-expiry"
            value={link.expiresAt ? "custom" : "never"}
            onChange={(e) => {
              const v = e.target.value as LinkExpiryInput | "custom";
              if (v !== "custom") handleExpiry(v);
            }}
          >
            {link.expiresAt && <option value="custom">Custom — {formatDateTime(link.expiresAt)}</option>}
            <option value="never">Never — until revoked</option>
            <option value="7">7 days from now</option>
            <option value="30">30 days from now</option>
            <option value="90">90 days from now</option>
          </Select>
        </Field>
        <p className="max-w-md text-[0.7rem] leading-snug text-muted">
          Additional documents added to this project appear through the same link — no new link is needed per document.
          Revoking or regenerating invalidates the link immediately.
        </p>
      </div>

      {error && <p role="alert" className="mt-2 text-[0.78rem] font-semibold text-danger">{error}</p>}
    </div>
  );
}
