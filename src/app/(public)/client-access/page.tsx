"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KeyRound, Link2, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

/* Client document access entry point — validates the *shape* of the private
   Link is verified server-side when the portal opens. */
export default function ClientAccessPage() {
  const router = useRouter();
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const open = (raw: string) => {
    setError(null);
    let token = raw.trim();
    // Accept a full URL, a /client/project/<token> path, or a bare token
    const match = token.match(/(?:\/client\/project\/|\/project\/)([A-Za-z0-9-]+)\/?$/);
    if (match) token = match[1];
    token = token.replace(/^\/+|\/+$/g, "");
    if (!token) {
      setError("Paste the private link your studio sent you, or the link code it contains.");
      return;
    }
    router.push(`/client/project/${encodeURIComponent(token)}`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    open(value);
  };

  return (
    <>
      {/* Split hero */}
      <section className="mx-auto grid w-full max-w-[1180px] items-center gap-10 px-5 py-14 sm:px-7 lg:grid-cols-2 lg:py-20">
        <div>
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-accent">Client Document Access</p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,5vw,4.2rem)] font-semibold leading-[1.0] tracking-tight text-ink">
            Your project, one private link away.
          </h1>
          <p className="mt-5 max-w-md text-[1rem] leading-relaxed text-muted">
            Design Brooks delivers drawings through a private, expiring link — no account needed.
            Paste the link from your invitation email or WhatsApp message to open your project documents.
          </p>
          <ul className="mt-8 grid gap-3 text-[0.9rem] text-ink/85">
            {[
              [ShieldCheck, "Only people with the link can open your project"],
              [KeyRound, "Links can expire and can be revoked by the studio"],
              [Link2, "One link per project — every released drawing arrives there"],
            ].map(([Icon, text], i) => {
              const I = Icon as typeof ShieldCheck;
              return (
                <li key={i} className="flex items-center gap-3">
                  <I className="h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                  {text as string}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-[2rem] border border-line bg-surface-soft p-8 shadow-soft backdrop-blur sm:p-10">
          <h2 className="font-display text-2xl font-semibold text-ink">Open your project</h2>
          <form onSubmit={submit} className="mt-5 grid gap-4">
            <Field label="Private project link or code" htmlFor="link" error={error ?? undefined}>
              <Input
                id="link"
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(null); }}
                placeholder="https://designbrooks.netlify.app/client/project/…"
                autoComplete="off"
                spellCheck={false}
                aria-invalid={!!error}
              />
            </Field>
            <Button type="submit" size="lg" className="w-full">
              Open project documents <ArrowRight aria-hidden="true" />
            </Button>
          </form>
          {error && (
            <p role="alert" className="mt-3 flex items-start gap-2 text-[0.8rem] font-semibold text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {error}
            </p>
          )}

        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-5 py-10 text-center text-[0.85rem] text-muted sm:px-7">
        Lost your link? Ask your project lead to re-send it, or <Link href="/contact" className="font-semibold text-accent-dark underline-offset-2 hover:underline">contact the studio</Link>.
      </section>
    </>
  );
}
