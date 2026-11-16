import {
  PageHeaderSkeleton,
  ToolbarSkeleton,
  InquiryListSkeleton,
} from "@/components/admin/skeletons";

export default function InquiriesLoading() {
  return (
    <>
      <PageHeaderSkeleton withAction={false} />
      <ToolbarSkeleton filters={0} />
      <InquiryListSkeleton rows={7} />
    </>
  );
}
