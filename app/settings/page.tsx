import { RemixDashboard } from "@/components/dashboard/remix-dashboard";
import { getDashboardData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const dashboardData = await getDashboardData({ initialNav: "providers" });

  return <RemixDashboard {...dashboardData} />;
}
