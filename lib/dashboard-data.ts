import type { DashboardPageProps } from "@/components/dashboard/remix-dashboard";
import { getProviderStatuses } from "@/lib/config/provider-status";
import { getStorageMode, listJobs, readJob } from "@/lib/jobs/storage";
import type { RemixJob, RemixJobStatus, RemixJobSummary } from "@/lib/jobs/types";

type DashboardDataOptions = {
  initialNav?: DashboardPageProps["initialNav"];
  jobId?: string;
};

export async function getDashboardData(options: DashboardDataOptions = {}): Promise<DashboardPageProps> {
  const statuses = await getProviderStatuses();
  const summaries = await listJobs();
  const selectedJob = options.jobId
    ? await readJob(options.jobId)
    : summaries[0]
      ? await readJob(summaries[0].id)
      : null;

  const analysisModels = statuses.analysis.map((provider) => ({
    id: provider.id,
    name: provider.name,
    provider: provider.name,
  }));

  const videoProviders = statuses.generation.map((provider) => ({
    id: provider.id,
    name: provider.name,
    status: provider.configured ? "ready" as const : provider.id === "veo" ? "new" as const : "beta" as const,
  }));

  return {
    initialNav: options.initialNav ?? "workbench",
    storageMode: getStorageMode() === "vercel-blob" ? "cloud" : "local",
    providers: [
      ...statuses.analysis.map((provider) => ({
        id: `analysis-${provider.id}`,
        name: provider.name,
        type: "analysis" as const,
        configured: provider.configured,
      })),
      ...statuses.generation.map((provider) => ({
        id: `video-${provider.id}`,
        name: provider.name,
        type: "video" as const,
        configured: provider.configured,
      })),
      ...statuses.transcription.map((provider) => ({
        id: `transcription-${provider.id}`,
        name: provider.name,
        type: "storage" as const,
        configured: provider.configured,
      })),
    ],
    providerConfigs: [
      ...statuses.analysis.map((provider) => providerToConfig(provider, "analysis" as const)),
      ...statuses.generation.map((provider) => providerToConfig(provider, "video" as const)),
      ...statuses.transcription.map((provider) => providerToConfig(provider, "transcription" as const)),
    ],
    recentJobs: summaries.map(summaryToRecentJob),
    artifacts: selectedJob ? jobToArtifacts(selectedJob) : [],
    jobDetail: selectedJob ? jobToDetail(selectedJob) : undefined,
    metrics: selectedJob ? jobToMetrics(selectedJob) : emptyMetrics(),
    generatedVideos: selectedJob ? jobToGeneratedVideos(selectedJob) : [],
    warnings: selectedJob ? selectedJob.warnings.map((message) => ({ type: "warning" as const, message })) : [],
    analysisModels,
    videoProviders,
  };
}

type ProviderStatus = Awaited<ReturnType<typeof getProviderStatuses>>["analysis"][number];

function providerToConfig(
  provider: ProviderStatus,
  category: "analysis" | "video" | "transcription"
): DashboardPageProps["providerConfigs"][number] {
  return {
    id: `${category}-${provider.id}`,
    name: provider.name,
    category,
    configured: provider.configured,
    apiKeyPlaceholder: provider.envKey,
    docsUrl: provider.setupUrl,
    description: provider.description,
  };
}

function summaryToRecentJob(job: RemixJobSummary): DashboardPageProps["recentJobs"][number] {
  return {
    id: job.id,
    name: job.sourceFileName,
    status: mapStatus(job.status),
    createdAt: formatDate(job.createdAt),
  };
}

function jobToDetail(job: RemixJob): DashboardPageProps["jobDetail"] {
  return {
    id: job.id,
    name: job.sourceFileName,
    status: mapStatus(job.status),
    createdAt: formatDate(job.createdAt),
    sourceFile: job.sourceFileName,
    analysisModel: job.analysisModel ?? job.resolvedAnalysisProvider ?? job.analysisProvider,
    videoProvider: job.generationModel ?? job.resolvedGenerationProvider ?? job.generationProvider,
    progress: statusProgress(job.status),
  };
}

function jobToMetrics(job: RemixJob): DashboardPageProps["metrics"] {
  return [
    { label: "生成变体", value: job.generatedVideos?.length ?? job.variantPlans?.length ?? 0 },
    { label: "处理时长", value: formatDuration(job.facts?.metadata.durationSeconds) },
    { label: "镜头证据", value: job.facts?.frames.length ?? 0 },
    { label: "转写片段", value: job.facts?.transcript?.length ?? 0 },
  ];
}

function emptyMetrics(): DashboardPageProps["metrics"] {
  return [
    { label: "生成变体", value: 0 },
    { label: "处理时长", value: "待分析" },
    { label: "镜头证据", value: 0 },
    { label: "转写片段", value: 0 },
  ];
}

function jobToGeneratedVideos(job: RemixJob): DashboardPageProps["generatedVideos"] {
  return (job.generatedVideos ?? []).map((video) => ({
    id: `${video.provider}-${video.variantId}-${video.createdAt}`,
    name: video.variantId,
    duration: formatDuration(job.facts?.metadata.durationSeconds),
    status: video.status === "completed" ? "ready" as const : video.status === "failed" ? "error" as const : "processing" as const,
  }));
}

function jobToArtifacts(job: RemixJob): DashboardPageProps["artifacts"] {
  const artifacts: DashboardPageProps["artifacts"] = [];

  if (job.facts) {
    artifacts.push({ id: `${job.id}-facts`, type: "json", name: "镜头证据", createdAt: formatDate(job.updatedAt) });
  }
  if (job.analysis) {
    artifacts.push({ id: `${job.id}-analysis`, type: "json", name: "创意解读", createdAt: formatDate(job.updatedAt) });
  }
  if (job.variantPlans?.length) {
    artifacts.push({ id: `${job.id}-brief`, type: "json", name: "变体方案", createdAt: formatDate(job.updatedAt) });
  }
  for (const video of job.generatedVideos ?? []) {
    artifacts.push({
      id: `${job.id}-${video.variantId}`,
      type: "video",
      name: video.variantId,
      createdAt: formatDate(video.createdAt),
    });
  }

  return artifacts;
}

function mapStatus(status: RemixJobStatus): DashboardPageProps["recentJobs"][number]["status"] {
  if (status === "failed") return "failed";
  if (status === "generating" || status === "analyzing") return "running";
  if (status === "created" || status === "analysis_pending") return "queued";
  return "completed";
}

function statusProgress(status: RemixJobStatus) {
  const progress: Record<RemixJobStatus, number> = {
    created: 5,
    extracted: 25,
    analyzing: 45,
    analyzed: 65,
    generating: 82,
    generated: 100,
    analysis_pending: 30,
    failed: 100,
  };

  return progress[status];
}

function formatDuration(value: number | undefined) {
  if (value === undefined) return "待分析";
  const minutes = Math.floor(value / 60);
  const seconds = Math.round(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
