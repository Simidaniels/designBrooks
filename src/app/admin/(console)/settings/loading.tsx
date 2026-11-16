import {
  PageHeaderSkeleton,
  SettingsSectionSkeleton,
} from "@/components/admin/skeletons";

export default function SettingsLoading() {
  return (
    <>
      <PageHeaderSkeleton withAction={false} />
      <div className="grid gap-5">
        <SettingsSectionSkeleton fields={4} />
        <SettingsSectionSkeleton fields={2} />
        <SettingsSectionSkeleton fields={4} />
      </div>
    </>
  );
}
