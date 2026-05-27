import { RemixDashboard } from "@/components/dashboard/remix-dashboard";
import { getDashboardData } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const dashboardData = await getDashboardData({ initialNav: "workbench" });

  return <RemixDashboard {...dashboardData} />;
}
