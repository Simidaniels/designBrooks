import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/server/auth";

/** If already signed in, skip the login screen. */
export default async function AuthAdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getSessionAdmin();
  if (admin) redirect("/admin/dashboard");
  return <>{children}</>;
}
