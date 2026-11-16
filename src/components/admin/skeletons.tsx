import { cn } from "@/lib/utils";

/**
 * Skeleton primitives for admin route loading states.
 * Server-component safe (no hooks, no client APIs).
 * Pulse is the default Tailwind 2s ease — calm and unobtrusive.
 */

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-ink/[0.08]", className)} />;
}

export function SkeletonText({ className }: { className?: string }) {
  return <Skeleton className={cn("h-3 rounded-full", className)} />;
}

/** Mirrors <PageHeader/> proportions: eyebrow, title, description, actions. */
export function PageHeaderSkeleton({ withAction = true }: { withAction?: boolean }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div className="w-full max-w-2xl">
        <Skeleton className="h-2.5 w-20 rounded-full" />
        <Skeleton className="mt-3 h-8 w-72 max-w-full" />
        <Skeleton className="mt-3 h-3 w-96 max-w-full" />
        <Skeleton className="mt-1.5 h-3 w-64 max-w-full" />
      </div>
      {withAction && <Skeleton className="h-11 w-36 rounded-xl" />}
    </div>
  );
}

/** Mirrors <StatCard/>. */
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-line bg-surface-soft p-5 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-2.5 w-20 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="mt-4 h-9 w-16" />
      <Skeleton className="mt-2.5 h-2.5 w-24 rounded-full" />
    </div>
  );
}

/** Search + filter toolbar row used by most list pages. */
export function ToolbarSkeleton({ filters = 2 }: { filters?: number }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
      <Skeleton className="h-11 flex-1 rounded-xl" />
      {Array.from({ length: filters }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-40 rounded-xl" />
      ))}
    </div>
  );
}

/** Table skeleton inside the standard rounded panel. */
export function TableSkeleton({ rows = 6, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface-soft shadow-soft">
      <div className="flex gap-4 border-b border-line-strong bg-ivory-100 px-4 py-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className={cn("h-2.5 rounded-full", i === 0 ? "w-28" : "w-16")} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex items-center gap-4 border-b border-line px-4 py-4 last:border-0">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="mt-1.5 h-2.5 w-56 max-w-full" />
          </div>
          <Skeleton className="hidden h-2.5 w-24 rounded-full sm:block" />
          <Skeleton className="hidden h-2.5 w-12 rounded-full md:block" />
          <Skeleton className="hidden h-2.5 w-20 rounded-full lg:block" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-4 rounded-md" />
        </div>
      ))}
    </div>
  );
}

/** Project card skeleton mirroring the projects grid (cover image + body). */
export function ProjectCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface-soft shadow-soft">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex-1">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="mt-2 h-2.5 w-52 max-w-full" />
        </div>
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  );
}

/** Document list row skeleton inside the documents browser panel. */
export function DocumentListSkeleton({ rows = 7 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface-soft shadow-soft">
      <div className="border-b border-line px-5 py-4">
        <Skeleton className="h-2.5 w-28 rounded-full" />
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3.5 w-48 max-w-full" />
              <Skeleton className="mt-1.5 h-2.5 w-64 max-w-full" />
            </div>
            <Skeleton className="hidden h-5 w-20 rounded-full sm:block" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Activity feed group skeleton (day heading + rows with icon dots). */
export function ActivityFeedSkeleton({ groups = 2, rowsPerGroup = 4 }: { groups?: number; rowsPerGroup?: number }) {
  return (
    <div className="grid gap-6">
      {Array.from({ length: groups }).map((_, g) => (
        <div key={g}>
          <Skeleton className="h-2.5 w-40 rounded-full" />
          <div className="mt-2 overflow-hidden rounded-2xl border border-line bg-surface-soft shadow-soft">
            {Array.from({ length: rowsPerGroup }).map((_, i) => (
              <div key={i} className="flex items-start gap-4 border-b border-line px-5 py-4 last:border-0">
                <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-3.5 w-56 max-w-full" />
                  <Skeleton className="mt-1.5 h-2.5 w-72 max-w-full" />
                  <Skeleton className="mt-2 h-2 w-28 rounded-full" />
                </div>
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Inquiry list row skeleton. */
export function InquiryListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface-soft shadow-soft">
      <div className="flex items-center gap-2 border-b border-line px-5 py-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="divide-y divide-line">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3.5 w-44" />
              <Skeleton className="mt-1.5 h-2.5 w-64 max-w-full" />
              <Skeleton className="mt-1.5 h-2.5 w-52 max-w-full" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-4 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Settings section card skeleton (title + field grid). */
export function SettingsSectionSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-soft p-6 shadow-soft">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-1.5 h-2.5 w-56 max-w-full" />
        </div>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-2.5 w-24 rounded-full" />
            <Skeleton className="mt-2 h-11 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <Skeleton className="mt-5 h-11 w-32 rounded-xl" />
    </div>
  );
}

/** Generic panel skeleton for detail/secondary routes. */
export function PanelSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-line bg-surface-soft p-6 shadow-soft", className)}>
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-3 h-2.5 w-64 max-w-full" />
      <div className="mt-5 grid gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
