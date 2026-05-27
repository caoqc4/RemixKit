import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { RemixJob, RemixJobSummary } from "./types";

const storageRoot = path.join(process.cwd(), "storage");
const jobsRoot = path.join(storageRoot, "jobs");

export function getJobDir(jobId: string) {
  return path.join(jobsRoot, jobId);
}

export function getJobInputPath(jobId: string, extension: string) {
  return path.join(getJobDir(jobId), `input${extension}`);
}

export function getJobOutputPath(jobId: string, fileName: string) {
  return path.join(getJobDir(jobId), "outputs", fileName);
}

export async function ensureJobDir(jobId: string) {
  await mkdir(path.join(getJobDir(jobId), "frames"), { recursive: true });
  await mkdir(path.join(getJobDir(jobId), "audio"), { recursive: true });
  await mkdir(path.join(getJobDir(jobId), "outputs"), { recursive: true });
}

export async function saveJob(job: RemixJob) {
  await ensureJobDir(job.id);
  await writeFile(path.join(getJobDir(job.id), "job.json"), `${JSON.stringify(job, null, 2)}\n`, "utf8");

  if (job.facts) {
    await writeFile(
      path.join(getJobDir(job.id), "metadata.json"),
      `${JSON.stringify(job.facts.metadata, null, 2)}\n`,
      "utf8"
    );
  }

  if (job.analysis) {
    await writeFile(
      path.join(getJobDir(job.id), "analysis.json"),
      `${JSON.stringify(job.analysis, null, 2)}\n`,
      "utf8"
    );
  }

  if (job.variantPlans) {
    await writeFile(
      path.join(getJobDir(job.id), "variant_prompts.json"),
      `${JSON.stringify(job.variantPlans, null, 2)}\n`,
      "utf8"
    );
    await writeFile(path.join(getJobDir(job.id), "remix_brief.md"), renderRemixBrief(job), "utf8");
  }

  if (job.generatedVideos) {
    await writeFile(
      path.join(getJobDir(job.id), "generated_videos.json"),
      `${JSON.stringify(job.generatedVideos, null, 2)}\n`,
      "utf8"
    );
  }
}

export async function readJob(jobId: string): Promise<RemixJob | null> {
  try {
    const raw = await readFile(path.join(getJobDir(jobId), "job.json"), "utf8");
    return JSON.parse(raw) as RemixJob;
  } catch {
    return null;
  }
}

export async function listJobs(): Promise<RemixJobSummary[]> {
  try {
    const entries = await readdir(jobsRoot, { withFileTypes: true });
    const jobs = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => readJob(entry.name))
    );

    return jobs
      .filter((job): job is RemixJob => Boolean(job))
      .map((job) => ({
        id: job.id,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        status: job.status,
        sourceFileName: job.sourceFileName,
        goal: job.goal,
        analysisProvider: job.analysisProvider,
        generationProvider: job.generationProvider,
        warnings: job.warnings
      }))
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  } catch {
    return [];
  }
}

function renderRemixBrief(job: RemixJob) {
  const lines = [
    `# Remix Brief: ${job.sourceFileName}`,
    "",
    `Analysis provider: ${job.resolvedAnalysisProvider ?? job.analysisProvider}`,
    `Analysis model: ${job.analysisModel ?? "unknown"}`,
    "",
    "## Creative Summary",
    "",
    job.analysis?.creativeSummary ?? "",
    "",
    "## Compliance Risk",
    "",
    ...(job.analysis?.complianceRisk.map((risk) => `- ${risk}`) ?? []),
    "",
    "## Variant Plans",
    ""
  ];

  for (const variant of job.variantPlans ?? []) {
    lines.push(`### ${variant.name}`, "", `Angle: ${variant.angle}`, "", variant.providerPrompt, "");
  }

  return `${lines.join("\n")}\n`;
}
