import {
  PageHeaderSkeleton,
  ToolbarSkeleton,
  ActivityFeedSkeleton,
} from "@/components/admin/skeletons";

export default function ActivityLoading() {
  return (
    <>
      <PageHeaderSkeleton withAction={false} />
      <ToolbarSkeleton filters={1} />
      <ActivityFeedSkeleton groups={2} rowsPerGroup={4} />
    </>
  );
}
