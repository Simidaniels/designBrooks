import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
        )}
        <h1 className="mt-1.5 font-display text-[2rem] font-semibold leading-[1.05] text-ink">{title}</h1>
        {description && <p className="mt-1.5 text-[0.86rem] leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-ivory-100/50 px-6 py-14 text-center">
      {icon && <div className="mb-4 text-sand">{icon}</div>}
      <h3 className="font-display text-2xl font-semibold text-ink">{title}</h3>
      {body && <p className="mt-2 max-w-md text-[0.86rem] leading-relaxed text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
