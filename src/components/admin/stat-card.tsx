import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  delta,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  delta?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface-soft p-5 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.18em] text-muted">{label}</p>
        <span className="rounded-xl bg-accent/10 p-2 text-accent-dark">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 font-display text-[2.4rem] font-semibold leading-none text-ink">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-[0.7rem] text-muted">
        {delta && (
          <span className="inline-flex items-center gap-1 font-bold text-success">
            <TrendingUp className="h-3 w-3" aria-hidden="true" /> {delta}
          </span>
        )}
        {hint && <span className="truncate">{hint}</span>}
      </div>
    </div>
  );
}
