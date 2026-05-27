import { getCredential, getConfigValue } from "@/lib/config/local-config";
import { loadFrameImageEvidence } from "@/lib/analysis/frame-evidence";
import { readJob, saveJob } from "@/lib/jobs/storage";
import type { RemixJob } from "@/lib/jobs/types";
import { analysisAdapters } from "@/lib/providers/analysis/adapters";
import { getAnalysisProvider } from "@/lib/providers/analysis/registry";
import type { AnalysisProviderId } from "@/lib/providers/analysis/types";
import { selectAnalysisProvider } from "@/lib/providers/selection";
import { getVideoProvider } from "@/lib/providers/video/registry";

export async function analyzeRemixJob(jobId: string): Promise<RemixJob> {
  const job = await readJob(jobId);
  if (!job) {
    throw new Error("Job not found.");
  }
  if (!job.facts) {
    throw new Error("Job has no extracted facts yet.");
  }

  const providerId = await selectAnalysisProvider(job.analysisProvider);
  if (!providerId) {
    throw new Error("No configured analysis provider is available. Add an API key in Settings or .env.local.");
  }

  const provider = getAnalysisProvider(providerId);
  if (!provider) {
    throw new Error(`Unknown analysis provider: ${providerId}`);
  }

  const apiKey = await getCredential(provider.envKey);
  if (!apiKey) {
    throw new Error(`${provider.name} is not configured.`);
  }

  const model = (await getConfigValue(provider.modelEnvKey)) ?? provider.defaultModel;
  const adapter = analysisAdapters[providerId as AnalysisProviderId];
  const frameImages = provider.capabilities.supportsImages ? await loadFrameImageEvidence(job.facts) : [];
  const videoProvider =
    job.generationProvider === "auto" ? undefined : getVideoProvider(job.generationProvider)?.capabilities;

  const analyzingJob: RemixJob = {
    ...job,
    status: "analyzing",
    updatedAt: new Date().toISOString(),
    resolvedAnalysisProvider: providerId,
    analysisModel: model,
    error: undefined
  };
  await saveJob(analyzingJob);

  try {
    const analysis = await adapter.analyzeCreative({
      apiKey,
      model,
      goal: job.goal,
      facts: job.facts,
      frameImages
    });
    const variantPlans = await adapter.planVariants({
      apiKey,
      model,
      goal: job.goal,
      analysis,
      videoProviderCapabilities: videoProvider
    });

    const analyzedJob: RemixJob = {
      ...analyzingJob,
      status: "analyzed",
      updatedAt: new Date().toISOString(),
      analysis,
      variantPlans
    };
    await saveJob(analyzedJob);
    return analyzedJob;
  } catch (error) {
    const failedJob: RemixJob = {
      ...analyzingJob,
      status: "failed",
      updatedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Analysis failed."
    };
    await saveJob(failedJob);
    throw error;
  }
}
