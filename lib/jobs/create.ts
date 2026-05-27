import { randomUUID } from "node:crypto";
import { extractVideoFacts } from "@/lib/extraction/extract";
import { getStorageMode, saveJob, saveUploadedInput } from "@/lib/jobs/storage";
import type { RemixJob } from "@/lib/jobs/types";
import type { AnalysisProviderId } from "@/lib/providers/analysis/types";
import type { VideoProviderId } from "@/lib/providers/video/types";

const analysisProviderIds = new Set(["auto", "openai", "gemini", "anthropic", "deepseek"]);
const generationProviderIds = new Set(["auto", "luma", "runway", "veo", "fal", "replicate"]);

export async function createLocalRemixJob(input: {
  video: File;
  goal: FormDataEntryValue | null;
  analysisProvider: FormDataEntryValue | null;
  generationProvider: FormDataEntryValue | null;
}) {
  const jobId = randomUUID();
  const now = new Date().toISOString();
  const analysisProvider = normalizeProvider(
    input.analysisProvider,
    analysisProviderIds,
    "auto"
  ) as AnalysisProviderId | "auto";
  const generationProvider = normalizeProvider(
    input.generationProvider,
    generationProviderIds,
    "auto"
  ) as VideoProviderId | "auto";

  const savedInput = await saveUploadedInput(jobId, input.video);
  const extraction = await extractVideoFacts({
    jobId,
    sourceVideoPath: savedInput.path,
    sourceVideoUrl: savedInput.url
  });

  const job: RemixJob = {
    id: jobId,
    createdAt: now,
    updatedAt: new Date().toISOString(),
    status: "extracted",
    sourceFileName: input.video.name,
    sourceVideoPath: savedInput.path,
    sourceVideoUrl: savedInput.url,
    storageMode: getStorageMode(),
    goal: String(input.goal ?? "").trim(),
    analysisProvider,
    generationProvider,
    facts: extraction.facts,
    warnings: extraction.warnings
  };

  await saveJob(job);
  return job;
}

export async function createRemoteRemixJob(input: {
  sourceVideoUrl: string;
  goal: FormDataEntryValue | null;
  analysisProvider: FormDataEntryValue | null;
  generationProvider: FormDataEntryValue | null;
}) {
  const jobId = randomUUID();
  const now = new Date().toISOString();
  const analysisProvider = normalizeProvider(
    input.analysisProvider,
    analysisProviderIds,
    "auto"
  ) as AnalysisProviderId | "auto";
  const generationProvider = normalizeProvider(
    input.generationProvider,
    generationProviderIds,
    "auto"
  ) as VideoProviderId | "auto";
  const sourceFileName = getRemoteFileName(input.sourceVideoUrl);
  const extraction = await extractVideoFacts({
    jobId,
    sourceVideoPath: input.sourceVideoUrl,
    sourceVideoUrl: input.sourceVideoUrl
  });

  const job: RemixJob = {
    id: jobId,
    createdAt: now,
    updatedAt: new Date().toISOString(),
    status: "extracted",
    sourceFileName,
    sourceVideoPath: input.sourceVideoUrl,
    sourceVideoUrl: input.sourceVideoUrl,
    storageMode: getStorageMode(),
    goal: String(input.goal ?? "").trim(),
    analysisProvider,
    generationProvider,
    facts: extraction.facts,
    warnings: extraction.warnings
  };

  await saveJob(job);
  return job;
}

function normalizeProvider(value: FormDataEntryValue | null, allowed: Set<string>, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  return allowed.has(value) ? value : fallback;
}

function getRemoteFileName(sourceVideoUrl: string) {
  try {
    const parsed = new URL(sourceVideoUrl);
    const name = parsed.pathname.split("/").filter(Boolean).pop();
    return name || parsed.hostname || "remote-video";
  } catch {
    return "remote-video";
  }
}
