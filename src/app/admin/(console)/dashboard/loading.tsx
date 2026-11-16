import {
  PageHeaderSkeleton,
  StatCardSkeleton,
  Skeleton,
} from "@/components/admin/skeletons";

export default function DashboardLoading() {
  return (
    <>
      <PageHeaderSkeleton />

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Left column */}
        <div className="grid gap-6">
          {/* Active projects */}
          <section className="rounded-2xl border border-line bg-surface-soft p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-2.5 w-28 rounded-full" />
              <Skeleton className="h-3 w-16 rounded-full" />
            </div>
            <ul className="mt-4 divide-y divide-line">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-14 w-20 shrink-0 rounded-lg" />
                  <span className="min-w-0 flex-1">
                    <Skeleton className="h-3.5 w-44 max-w-full" />
                    <Skeleton className="mt-1.5 h-2.5 w-32 max-w-full" />
                  </span>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </li>
              ))}
            </ul>
          </section>

          {/* Upload rhythm chart */}
          <section className="rounded-2xl border border-line bg-surface-soft p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-2.5 w-44 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-full" />
            </div>
            <div className="mt-4 grid h-36 grid-cols-7 items-end gap-2">
              {[56, 78, 34, 92, 64, 48, 70].map((height, i) => (
                <div key={i} className="flex h-full flex-col items-center justify-end gap-1.5">
                  <Skeleton className="h-2 w-4 rounded-full" />
                  <div className="flex w-full items-end" style={{ height: `${height}%` }}>
                    <Skeleton className="h-full w-full rounded-t-md" />
                  </div>
                  <Skeleton className="h-2 w-8 rounded-full" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="grid gap-6">
          {/* Recent activity (dark panel) */}
          <section className="rounded-2xl border border-line bg-ink p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-2.5 w-28 rounded-full bg-white/10" />
              <Skeleton className="h-3 w-16 rounded-full bg-white/10" />
            </div>
            <ol className="mt-4 grid gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <Skeleton className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/15" />
                  <span className="min-w-0 flex-1">
                    <Skeleton className="h-3 w-48 max-w-full bg-white/10" />
                    <Skeleton className="mt-1.5 h-2.5 w-40 max-w-full bg-white/10" />
                    <Skeleton className="mt-2 h-2 w-24 rounded-full bg-white/10" />
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Recent inquiries */}
          <section className="rounded-2xl border border-line bg-surface-soft p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-2.5 w-28 rounded-full" />
              <Skeleton className="h-3 w-16 rounded-full" />
            </div>
            <ul className="mt-3 divide-y divide-line">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <Skeleton className="h-3.5 w-36 max-w-full" />
                    <Skeleton className="mt-1.5 h-2.5 w-48 max-w-full" />
                  </span>
                  <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
                </li>
              ))}
            </ul>
          </section>

          {/* Recent uploads */}
          <section className="rounded-2xl border border-line bg-surface-soft p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-2.5 w-28 rounded-full" />
              <Skeleton className="h-3 w-20 rounded-full" />
            </div>
            <ul className="mt-3 divide-y divide-line">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0 flex-1">
                    <Skeleton className="h-3.5 w-40 max-w-full" />
                    <Skeleton className="mt-1.5 h-2.5 w-44 max-w-full" />
                  </span>
                  <Skeleton className="h-5 w-14 shrink-0 rounded-full" />
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
