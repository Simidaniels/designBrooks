import {
  PageHeaderSkeleton,
  PanelSkeleton,
} from "@/components/admin/skeletons";

/**
 * Fallback for admin console segments without their own loading.tsx
 * (detail pages, create forms, upload). Segment-level loading files
 * take precedence over this one.
 */
export default function ConsoleLoading() {
  return (
    <>
      <PageHeaderSkeleton withAction={false} />
      <div className="grid gap-5">
        <PanelSkeleton />
      </div>
    </>
  );
}
