import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { prisma } from "@/lib/server/db";
import { mapActivity } from "@/lib/server/queries";

export const metadata: Metadata = { title: "Activity log" };
export const dynamic = "force-dynamic";

export default async function ActivityPage() {
  const rows = await prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  const events = rows.map(mapActivity);

  return (
    <>
      <PageHeader
        eyebrow="Activity"
        title="Activity log"
        description="Uploads, access-setting changes, link lifecycle and client opens — everything in one audit trail."
      />
      <ActivityFeed events={events} />
    </>
  );
}
