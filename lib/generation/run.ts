import { getCredential, getConfigValue } from "@/lib/config/local-config";
import { readJob, saveGeneratedOutput, saveJob } from "@/lib/jobs/storage";
import type { RemixJob } from "@/lib/jobs/types";
import { selectVideoProvider } from "@/lib/providers/selection";
import { videoAdapters } from "@/lib/providers/video/adapters";
import { refreshRunwayGeneratedVideo } from "@/lib/providers/video/refresh";
import { getVideoProvider } from "@/lib/providers/video/registry";
import type { GeneratedVideo, VideoProviderId } from "@/lib/providers/video/types";

const maxVariantsPerRun = 3;

export async function generateRemixJobVideos(jobId: string): Promise<RemixJob> {
  const job = await readJob(jobId);
  if (!job) {
    throw new Error("Job not found.");
  }
  if (!job.variantPlans?.length) {
    throw new Error("Run creative analysis before generating videos.");
  }

  const providerId = await selectVideoProvider(job.generationProvider, {
    supportsVideoToVideo: true,
    supportsLocalFileUpload: job.generationProvider === "auto" && !job.sourceVideoUrl
  });
  if (!providerId) {
    throw new Error("No configured video provider is available for this remix workflow.");
  }

  const provider = getVideoProvider(providerId);
  if (!provider) {
    throw new Error(`Unknown video provider: ${providerId}`);
  }

  const adapter = videoAdapters[providerId as VideoProviderId];
  if (!adapter) {
    throw new Error(`${provider.name} generation is not implemented yet.`);
  }

  const apiKey = await getCredential(provider.envKey);
  if (!apiKey) {
    throw new Error(`${provider.name} is not configured.`);
  }

  const model = (await getConfigValue(provider.modelEnvKey)) ?? defaultVideoModel(providerId);
  const generatingJob: RemixJob = {
    ...job,
    status: "generating",
    updatedAt: new Date().toISOString(),
    resolvedGenerationProvider: providerId,
    generationModel: model,
    error: undefined
  };
  await saveJob(generatingJob);

  try {
    const generatedVideos: GeneratedVideo[] = [];
    for (const variant of job.variantPlans.slice(0, maxVariantsPerRun)) {
      const generated = await adapter.generate({
        apiKey,
        model,
        jobId,
        variantId: variant.id,
        prompt: variant.providerPrompt,
        sourceVideoPath: job.sourceVideoPath,
        sourceVideoUrl: job.sourceVideoUrl
      });
      generatedVideos.push(generated);
    }

    const generatedJob: RemixJob = {
      ...generatingJob,
      status: "generated",
      updatedAt: new Date().toISOString(),
      generatedVideos: [...(job.generatedVideos ?? []), ...generatedVideos]
    };
    await saveJob(generatedJob);
    return generatedJob;
  } catch (error) {
    const failedJob: RemixJob = {
      ...generatingJob,
      status: "failed",
      updatedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Video generation failed."
    };
    await saveJob(failedJob);
    throw error;
  }
}

function defaultVideoModel(providerId: VideoProviderId) {
  if (providerId === "luma") {
    return "ray-flash-2";
  }
  if (providerId === "runway") {
    return "gen4_aleph";
  }
  return "default";
}

export async function refreshGeneratedVideos(jobId: string): Promise<RemixJob> {
  const job = await readJob(jobId);
  if (!job) {
    throw new Error("Job not found.");
  }
  if (!job.generatedVideos?.length) {
    throw new Error("No generated video tasks to refresh.");
  }

  const refreshed: GeneratedVideo[] = [];
  for (const video of job.generatedVideos) {
    if (video.status !== "submitted") {
      refreshed.push(video);
      continue;
    }

    if (video.provider === "runway") {
      const apiKey = await getCredential("RUNWAY_API_KEY");
      if (!apiKey) {
        throw new Error("Runway is not configured.");
      }
      refreshed.push(await refreshRunwayGeneratedVideo({ apiKey, generatedVideo: video }));
      continue;
    }

    refreshed.push(video);
  }

  const downloaded = await Promise.all(refreshed.map((video) => downloadGeneratedVideo(jobId, video)));
  const nextJob: RemixJob = {
    ...job,
    status: downloaded.some((video) => video.status === "completed") ? "generated" : job.status,
    updatedAt: new Date().toISOString(),
    generatedVideos: downloaded
  };
  await saveJob(nextJob);
  return nextJob;
}

async function downloadGeneratedVideo(jobId: string, video: GeneratedVideo): Promise<GeneratedVideo> {
  if (video.status !== "completed" || !video.outputUrl || video.outputPath) {
    return video;
  }

  const response = await fetch(video.outputUrl);
  if (!response.ok) {
    return {
      ...video,
      error: `Could not download generated video: ${response.status} ${response.statusText}`
    };
  }

  const savedOutput = await saveGeneratedOutput(
    jobId,
    `${video.variantId}-${video.provider}.mp4`,
    await response.arrayBuffer()
  );
  return {
    ...video,
    outputPath: savedOutput.path,
    outputUrl: savedOutput.url ?? video.outputUrl
  };
}
