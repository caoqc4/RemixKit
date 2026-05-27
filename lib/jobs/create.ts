import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { extractVideoFacts } from "@/lib/extraction/extract";
import { ensureJobDir, getJobInputPath, saveJob } from "@/lib/jobs/storage";
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
  const extension = path.extname(input.video.name) || ".mp4";
  const sourceVideoPath = getJobInputPath(jobId, extension);
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

  await ensureJobDir(jobId);
  await writeFile(sourceVideoPath, Buffer.from(await input.video.arrayBuffer()));

  const extraction = await extractVideoFacts({ jobId, sourceVideoPath });

  const job: RemixJob = {
    id: jobId,
    createdAt: now,
    updatedAt: new Date().toISOString(),
    status: "extracted",
    sourceFileName: input.video.name,
    sourceVideoPath,
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

