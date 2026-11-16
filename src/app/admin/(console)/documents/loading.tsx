import {
  PageHeaderSkeleton,
  ToolbarSkeleton,
  DocumentListSkeleton,
} from "@/components/admin/skeletons";

export default function DocumentsLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <ToolbarSkeleton filters={3} />
      <DocumentListSkeleton rows={8} />
    </>
  );
}
