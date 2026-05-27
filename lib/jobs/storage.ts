import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { list, put } from "@vercel/blob";
import type { RemixJob, RemixJobSummary } from "./types";

export type RemixKitStorageMode = "local" | "vercel-blob";

const storageRoot = path.join(process.cwd(), "storage");
const jobsRoot = path.join(storageRoot, "jobs");

export function getStorageMode(): RemixKitStorageMode {
  if (process.env.REMIXKIT_STORAGE === "vercel-blob") {
    return "vercel-blob";
  }

  if (process.env.VERCEL && process.env.BLOB_READ_WRITE_TOKEN) {
    return "vercel-blob";
  }

  return "local";
}

export function isHostedStorage() {
  return getStorageMode() === "vercel-blob";
}

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
  if (isHostedStorage()) {
    return;
  }

  await mkdir(path.join(getJobDir(jobId), "frames"), { recursive: true });
  await mkdir(path.join(getJobDir(jobId), "audio"), { recursive: true });
  await mkdir(path.join(getJobDir(jobId), "outputs"), { recursive: true });
}

export async function saveUploadedInput(jobId: string, file: File) {
  const extension = path.extname(file.name) || ".mp4";

  if (isHostedStorage()) {
    const blob = await put(blobPath(jobId, `input${extension}`), file, {
      access: "public",
      allowOverwrite: true,
      multipart: true
    });

    return {
      path: blob.pathname,
      url: blob.url
    };
  }

  await ensureJobDir(jobId);
  const sourceVideoPath = getJobInputPath(jobId, extension);
  await writeFile(sourceVideoPath, Buffer.from(await file.arrayBuffer()));

  return {
    path: sourceVideoPath,
    url: undefined
  };
}

export async function saveGeneratedOutput(jobId: string, fileName: string, body: ArrayBuffer) {
  if (isHostedStorage()) {
    const blob = await put(blobPath(jobId, `outputs/${fileName}`), body, {
      access: "public",
      allowOverwrite: true,
      contentType: "video/mp4"
    });

    return {
      path: blob.pathname,
      url: blob.url
    };
  }

  const outputPath = getJobOutputPath(jobId, fileName);
  await writeFile(outputPath, Buffer.from(body));

  return {
    path: outputPath,
    url: undefined
  };
}

export async function saveJob(job: RemixJob) {
  if (isHostedStorage()) {
    await saveBlobJson(blobPath(job.id, "job.json"), job);

    if (job.facts) {
      await saveBlobJson(blobPath(job.id, "metadata.json"), job.facts.metadata);
    }

    if (job.analysis) {
      await saveBlobJson(blobPath(job.id, "analysis.json"), job.analysis);
    }

    if (job.variantPlans) {
      await saveBlobJson(blobPath(job.id, "variant_prompts.json"), job.variantPlans);
      await put(blobPath(job.id, "remix_brief.md"), renderRemixBrief(job), {
        access: "public",
        allowOverwrite: true,
        contentType: "text/markdown; charset=utf-8"
      });
    }

    if (job.generatedVideos) {
      await saveBlobJson(blobPath(job.id, "generated_videos.json"), job.generatedVideos);
    }

    return;
  }

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
  if (isHostedStorage()) {
    return readBlobJson<RemixJob>(blobPath(jobId, "job.json"));
  }

  try {
    const raw = await readFile(path.join(getJobDir(jobId), "job.json"), "utf8");
    return JSON.parse(raw) as RemixJob;
  } catch {
    return null;
  }
}

export async function listJobs(): Promise<RemixJobSummary[]> {
  if (isHostedStorage()) {
    const jobBlobs = await listAllBlobs("jobs/");
    const jobs = await Promise.all(
      jobBlobs
        .filter((blob) => blob.pathname.endsWith("/job.json"))
        .map((blob) => readBlobJsonFromUrl<RemixJob>(blob.url))
    );

    return summarizeJobs(jobs.filter((job): job is RemixJob => Boolean(job)));
  }

  try {
    const entries = await readdir(jobsRoot, { withFileTypes: true });
    const jobs = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => readJob(entry.name))
    );

    return summarizeJobs(jobs.filter((job): job is RemixJob => Boolean(job)));
  } catch {
    return [];
  }
}

function summarizeJobs(jobs: RemixJob[]): RemixJobSummary[] {
  return jobs
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
}

function blobPath(jobId: string, filePath: string) {
  return `jobs/${jobId}/${filePath}`;
}

async function saveBlobJson(pathname: string, value: unknown) {
  await put(pathname, `${JSON.stringify(value, null, 2)}\n`, {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8"
  });
}

async function readBlobJson<T>(pathname: string): Promise<T | null> {
  const blobs = await listAllBlobs(pathname);
  const blob = blobs.find((candidate) => candidate.pathname === pathname);
  return blob ? readBlobJsonFromUrl<T>(blob.url) : null;
}

async function readBlobJsonFromUrl<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function listAllBlobs(prefix: string) {
  const blobs: Awaited<ReturnType<typeof list>>["blobs"] = [];
  let cursor: string | undefined;

  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.cursor;
  } while (cursor);

  return blobs;
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
