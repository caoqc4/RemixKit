import { NextResponse } from "next/server";
import { readCredentialsFromFormData } from "@/lib/config/request-credentials";
import { runWithRequestCredentials } from "@/lib/config/local-config";
import { createLocalRemixJob, createRemoteRemixJob } from "@/lib/jobs/create";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const credentials = readCredentialsFromFormData(formData);
  const video = formData.get("video");
  const sourceUrl = normalizeSourceUrl(formData.get("sourceUrl"));

  if (video instanceof File && video.size > 0) {
    const job = await runWithRequestCredentials(credentials, () =>
      createLocalRemixJob({
        video,
        goal: formData.get("goal"),
        analysisProvider: formData.get("analysisProvider"),
        generationProvider: formData.get("generationProvider")
      })
    );

    return NextResponse.redirect(new URL(`/jobs/${job.id}`, request.url), 303);
  }

  if (!sourceUrl) {
    return NextResponse.json(
      { error: "Upload a reference video or provide a public source video URL." },
      { status: 400 }
    );
  }

  const job = await runWithRequestCredentials(credentials, () =>
    createRemoteRemixJob({
      sourceVideoUrl: sourceUrl,
      goal: formData.get("goal"),
      analysisProvider: formData.get("analysisProvider"),
      generationProvider: formData.get("generationProvider")
    })
  );

  return NextResponse.redirect(new URL(`/jobs/${job.id}`, request.url), 303);
}

function normalizeSourceUrl(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}
