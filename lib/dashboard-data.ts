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

  const falStatus = statuses.generation.find((provider) => provider.id === "fal");
  const falOpenRouterStatus = statuses.analysis.find((provider) => provider.id === "fal-openrouter");
  const openRouterStatus = statuses.analysis.find((provider) => provider.id === "openrouter");
  const replicateStatus = statuses.generation.find((provider) => provider.id === "replicate");

  const analysisModels = [
    {
      id: "fal-openrouter-gemini",
      name: "Gemini 2.5 Flash",
      provider: "via fal/OpenRouter",
      providerId: "fal-openrouter",
      configured: Boolean(falOpenRouterStatus?.configured),
      tags: ["aggregator", "analysis"],
    },
    {
      id: "fal-openrouter-claude",
      name: "Claude Sonnet",
      provider: "via fal/OpenRouter",
      providerId: "fal-openrouter",
      configured: Boolean(falOpenRouterStatus?.configured),
      tags: ["aggregator", "analysis"],
    },
    {
      id: "fal-openrouter-openai",
      name: "OpenAI GPT",
      provider: "via fal/OpenRouter",
      providerId: "fal-openrouter",
      configured: Boolean(falOpenRouterStatus?.configured),
      tags: ["aggregator", "analysis"],
    },
    {
      id: "fal-openrouter-deepseek",
      name: "DeepSeek",
      provider: "via fal/OpenRouter",
      providerId: "fal-openrouter",
      configured: Boolean(falOpenRouterStatus?.configured),
      tags: ["aggregator", "analysis"],
    },
    {
      id: "openrouter-gemini",
      name: "Gemini 2.5 Flash",
      provider: "via OpenRouter",
      providerId: "openrouter",
      configured: Boolean(openRouterStatus?.configured),
      tags: ["aggregator", "analysis"],
    },
    ...statuses.analysis.filter((provider) => !["fal-openrouter", "openrouter"].includes(provider.id)).map((provider) => ({
      id: provider.id,
      name: provider.name,
      provider: "official",
      providerId: provider.id,
      configured: provider.configured,
      tags: ["official", provider.configured ? "ready" : "needs key"],
    })),
  ];

  const videoProviders = [
    {
      id: "fal-seedance-2",
      name: "Seedance 2",
      provider: "via fal",
      providerId: "fal",
      configured: Boolean(falStatus?.configured),
      tags: ["aggregator", "video reference", "fast trial"],
      status: "new" as const,
    },
    {
      id: "fal-sora-2",
      name: "Sora 2",
      provider: "via fal",
      providerId: "fal",
      configured: Boolean(falStatus?.configured),
      tags: ["aggregator", "experimental"],
      status: "beta" as const,
    },
    {
      id: "fal-kling",
      name: "Kling",
      provider: "via fal",
      providerId: "fal",
      configured: Boolean(falStatus?.configured),
      tags: ["aggregator", "image-to-video"],
      status: "beta" as const,
    },
    {
      id: "replicate-seedance",
      name: "Seedance",
      provider: "via Replicate",
      providerId: "replicate",
      configured: Boolean(replicateStatus?.configured),
      tags: ["aggregator", "prediction"],
      status: "beta" as const,
    },
    ...statuses.generation.filter((provider) => !["fal", "replicate"].includes(provider.id)).map((provider) => ({
      id: provider.id,
      name: provider.name,
      provider: "official",
      providerId: provider.id,
      configured: provider.configured,
      tags: ["official", provider.configured ? "ready" : "needs key"],
      status: provider.configured ? "ready" as const : provider.id === "veo" ? "new" as const : "beta" as const,
    })),
  ];

  return {
    initialNav: options.initialNav ?? "workbench",
    keyStorageMode: process.env.VERCEL ? "browser" : "server",
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
    providerConfigs: buildProviderConfigs(statuses),
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

type ProviderStatuses = Awaited<ReturnType<typeof getProviderStatuses>>;
type ProviderStatus = ProviderStatuses["analysis"][number];

function buildProviderConfigs(statuses: ProviderStatuses): DashboardPageProps["providerConfigs"] {
  const fal = statuses.generation.find((provider) => provider.id === "fal");
  const replicate = statuses.generation.find((provider) => provider.id === "replicate");
  const openRouter = statuses.analysis.find((provider) => provider.id === "openrouter");

  return [
    fal
      ? providerToConfig(
          {
            ...fal,
            name: "fal",
            description: "Quick-start aggregator for OpenRouter analysis models and video models such as Seedance 2 and Sora 2.",
          },
          "aggregator"
        )
      : null,
    openRouter ? providerToConfig(openRouter, "aggregator") : null,
    replicate
      ? providerToConfig(
          {
            ...replicate,
            name: "Replicate",
            description: "Aggregator for selected video, image, and prediction-based generation models.",
          },
          "aggregator"
        )
      : null,
    ...statuses.analysis
      .filter((provider) => !["fal-openrouter", "openrouter"].includes(provider.id))
      .map((provider) => providerToConfig(provider, "official")),
    ...statuses.generation
      .filter((provider) => provider.id !== "fal" && provider.id !== "replicate")
      .map((provider) => providerToConfig(provider, "official")),
    ...statuses.transcription.map((provider) => providerToConfig(provider, "official")),
  ].filter((provider): provider is DashboardPageProps["providerConfigs"][number] => Boolean(provider))
    .filter(uniqueByEnvKey);
}

function uniqueByEnvKey(
  provider: DashboardPageProps["providerConfigs"][number],
  index: number,
  providers: DashboardPageProps["providerConfigs"]
) {
  return providers.findIndex((candidate) => candidate.apiKeyPlaceholder === provider.apiKeyPlaceholder) === index;
}

function providerToConfig(
  provider: ProviderStatus,
  category: DashboardPageProps["providerConfigs"][number]["category"]
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
