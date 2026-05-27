import { RemixDashboard } from "@/components/dashboard/remix-dashboard";
import { getDashboardData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function JobsPage() {
  const dashboardData = await getDashboardData({ initialNav: "jobs" });

  return <RemixDashboard {...dashboardData} />;
}
