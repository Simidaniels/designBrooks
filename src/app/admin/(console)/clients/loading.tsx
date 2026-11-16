import {
  PageHeaderSkeleton,
  ToolbarSkeleton,
  TableSkeleton,
} from "@/components/admin/skeletons";

export default function ClientsLoading() {
  return (
    <>
      <PageHeaderSkeleton />
      <ToolbarSkeleton filters={1} />
      <TableSkeleton rows={7} columns={6} />
    </>
  );
}
