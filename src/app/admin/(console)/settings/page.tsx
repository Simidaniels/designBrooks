import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { SettingsClient } from "@/components/admin/settings-client";
import { requireAdmin } from "@/lib/server/auth";
import { getSetting } from "@/lib/server/settings-store";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();

  const [studio, linkDefaults, prefs] = await Promise.all([
    getSetting("studio.profile", {
      name: "Design Brooks",
      email: "hello@designbrooks.com",
      phone: "+234 803 976 4433",
      locations: "Lagos, Nigeria · Remote and Onsite Collaborations",
    }),
    getSetting("links.defaults", { defaultExpiry: "never" as const, defaultAccessMode: "RESTRICTED_PREVIEW" as const }),
    getSetting("notifications.prefs", {
      inquiryAlerts: true,
      clientLinkOpened: false,
      downloadCompleted: true,
      weeklyDigest: false,
    }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Studio settings"
        description="Profile, link defaults, notifications and account security — persisted in the database."
      />
      <SettingsClient studio={studio} linkDefaults={linkDefaults} prefs={prefs} adminEmail={admin.email} />
    </>
  );
}
