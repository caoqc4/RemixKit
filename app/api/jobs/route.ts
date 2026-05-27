import { NextResponse } from "next/server";
import { createLocalRemixJob } from "@/lib/jobs/create";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const video = formData.get("video");

  if (!(video instanceof File) || video.size === 0) {
    return NextResponse.json({ error: "Upload a reference video before creating a remix job." }, { status: 400 });
  }

  const job = await createLocalRemixJob({
    video,
    goal: formData.get("goal"),
    analysisProvider: formData.get("analysisProvider"),
    generationProvider: formData.get("generationProvider")
  });

  return NextResponse.redirect(new URL(`/jobs/${job.id}`, request.url), 303);
}

