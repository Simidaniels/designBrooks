import {
  PageHeaderSkeleton,
  StatCardSkeleton,
  ProjectCardSkeleton,
  ToolbarSkeleton,
} from "@/components/admin/skeletons";

export default function ProjectsLoading() {
  return (
    <>
      <PageHeaderSkeleton />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <ToolbarSkeleton filters={2} />

      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
