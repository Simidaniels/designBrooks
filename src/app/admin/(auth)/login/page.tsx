"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { loginAction } from "@/lib/actions/auth";

export default function AdminLoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await loginAction({ email, password });
      // loginAction redirects on success; only failure returns here
      if (result && !result.ok) {
        setError(result.error);
      }
    } catch (err) {
      // Next.js redirect() throws a NEXT_REDIRECT signal — rethrow it
      if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw err;
      setError("Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src="/images/office.webp"
          alt="Design Brooks studio model table"
          fill
          priority
          sizes="50vw"
          className="object-cover object-[58%_40%]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900/85 via-ink-900/45 to-ink-900/10" />
        <div className="absolute bottom-10 left-10 max-w-md text-ivory-100">
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.24em] text-gold">Admin Console</p>
          <p className="mt-3 font-display text-4xl font-semibold leading-[1.05] text-ivory-50">
            One studio. Every client, project and drawing — in order.
          </p>
          <p className="mt-4 text-[0.85rem] leading-relaxed text-ivory-100/75">
            Authorized Design Brooks personnel only. All sessions are private and audited.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-ivory-100 px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/loggoo.webp" alt="Design Brooks logo" width={48} height={48} className="h-12 w-12 rounded-xl object-cover shadow-soft" />
            <span className="text-[0.75rem] font-extrabold uppercase leading-tight tracking-[0.18em] text-ink">Design<br />Brooks</span>
          </Link>

          <h1 className="mt-8 font-display text-4xl font-semibold leading-[1.02] text-ink">Studio sign-in</h1>
          <p className="mt-2 text-[0.88rem] text-muted">Authorized Design Brooks personnel only.</p>

          <form onSubmit={submit} noValidate className="mt-6 grid gap-4">
            <Field label="Admin email" htmlFor="email" required>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
                <Input id="email" type="email" autoComplete="username" placeholder="admin@designbrooks.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-11" required />
              </div>
            </Field>
            <Field label="Password" htmlFor="password" required error={error ?? undefined}>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted transition hover:text-ink"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>

            {error && (
              <p role="alert" className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-[0.82rem] font-semibold text-danger">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> {error}
              </p>
            )}

            <Button type="submit" size="lg" disabled={busy} className="mt-1 w-full">
              {busy ? <><Loader2 className="animate-spin" aria-hidden="true" /> Signing in…</> : "Sign in to console"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[0.75rem] text-faint">
            Not the studio? <Link href="/client-access" className="font-semibold text-accent-dark hover:underline">Client document access</Link>
          </p>
          <p className="mt-3 text-center text-[0.65rem] text-faint/70">
            Powered by{" "}
            <a
              href="https://simidaniels.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-muted transition-colors hover:text-accent-dark hover:underline underline-offset-2"
            >
              Simidaniels
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
