import { notFound } from "next/navigation";
import { RemixDashboard } from "@/components/dashboard/remix-dashboard";
import { getDashboardData } from "@/lib/dashboard-data";
import { readJob } from "@/lib/jobs/storage";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JobPage({ params }: PageProps) {
  const { id } = await params;
  const job = await readJob(id);

  if (!job) {
    notFound();
  }

  const dashboardData = await getDashboardData({ initialNav: "workbench", jobId: id });

  return <RemixDashboard {...dashboardData} />;
}
