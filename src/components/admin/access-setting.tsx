"use client";

import { Check, Lock, Unlock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccessMode } from "@/lib/types";

/* ─────────────────────────────────────────────────
   ADMIN-ONLY control. The payment labels below must
   NEVER appear in the client-facing portal.
   ───────────────────────────────────────────────── */
export function AccessSettingSelect({
  value,
  onChange,
}: {
  value: AccessMode;
  onChange: (mode: AccessMode) => void;
}) {
  const options: Array<{
    mode: AccessMode;
    icon: typeof Lock;
    title: string;
    explanation: string;
    clientEffect: string;
    tone: "locked" | "open";
  }> = [
    {
      mode: "RESTRICTED_PREVIEW",
      icon: Lock,
      title: "CLIENT HAS NOT PAID",
      explanation:
        "Client gets a restricted, watermarked preview. Downloading and printing are restricted.",
      clientEffect: "Client sees a watermarked preview only — no download or print controls.",
      tone: "locked",
    },
    {
      mode: "FULL_ACCESS",
      icon: Unlock,
      title: "CLIENT HAS PAID",
      explanation:
        "Client gets full authorized viewing and document downloads.",
      clientEffect: "Client can view the full document and download the released file.",
      tone: "open",
    },
  ];

  return (
    <fieldset>
      <legend className="flex items-center gap-2 text-[0.8rem] font-extrabold uppercase tracking-[0.14em] text-ink/90">
        Access setting
        <span className="rounded-md bg-warning-soft px-2 py-0.5 text-[0.58rem] font-extrabold uppercase tracking-[0.16em] text-warning">
          Admin only
        </span>
      </legend>
      <p className="mt-1.5 flex items-start gap-1.5 text-[0.72rem] leading-snug text-muted">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" aria-hidden="true" />
        Never shown to the client. The portal only reflects the resulting permissions.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Access setting">
        {options.map(({ mode, icon: Icon, title, explanation, clientEffect, tone }) => {
          const selected = value === mode;
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(mode)}
              className={cn(
                "group relative rounded-2xl border-2 p-4 text-left transition-all duration-200",
                tone === "locked"
                  ? selected
                    ? "border-warning bg-warning-soft shadow-[0_0_0_4px_rgba(138,106,29,0.15)]"
                    : "border-line bg-white/60 hover:border-warning/50"
                  : selected
                    ? "border-success bg-success-soft shadow-[0_0_0_4px_rgba(61,107,79,0.15)]"
                    : "border-line bg-white/60 hover:border-success/50"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    tone === "locked" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border-2 transition",
                    selected
                      ? tone === "locked"
                        ? "border-warning bg-warning text-white"
                        : "border-success bg-success text-white"
                      : "border-line-strong text-transparent"
                  )}
                >
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-ink">{title}</p>
              <p className="mt-1.5 text-[0.78rem] leading-snug text-ink/85">
                <span className="font-bold">Admin view: </span>{explanation}
              </p>
              <p className="mt-1.5 text-[0.72rem] leading-snug text-muted">{clientEffect}</p>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
