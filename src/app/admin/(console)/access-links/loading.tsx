import {
  PageHeaderSkeleton,
  StatCardSkeleton,
  Skeleton,
} from "@/components/admin/skeletons";

export default function AccessLinksLoading() {
  return (
    <>
      <PageHeaderSkeleton withAction={false} />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_1fr]">
        {/* Link register */}
        <div className="overflow-hidden rounded-2xl border border-line bg-surface-soft shadow-soft">
          <div className="border-b border-line px-5 py-4">
            <Skeleton className="h-2.5 w-28 rounded-full" />
          </div>
          <ul className="divide-y divide-line">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
                <span className="min-w-0 flex-1">
                  <Skeleton className="h-3.5 w-40 max-w-full" />
                  <Skeleton className="mt-1.5 h-2.5 w-48 max-w-full" />
                  <Skeleton className="mt-2 h-2 w-56 max-w-full rounded-full" />
                </span>
                <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
              </li>
            ))}
          </ul>
        </div>

        {/* Selected project link manager */}
        <div className="h-fit xl:sticky xl:top-20">
          <div className="rounded-2xl border border-line bg-surface-soft p-5 shadow-soft">
            <Skeleton className="h-2.5 w-20 rounded-full" />
            <Skeleton className="mt-2 h-7 w-48 max-w-full" />
            <Skeleton className="mt-2 h-2.5 w-36 rounded-full" />
            <div className="mt-5 grid gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
            <Skeleton className="mt-5 h-11 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </>
  );
}
