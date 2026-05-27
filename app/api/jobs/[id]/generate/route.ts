import { NextResponse } from "next/server";
import { generateRemixJobVideos } from "@/lib/generation/run";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const job = await generateRemixJobVideos(id);
    return NextResponse.redirect(new URL(`/jobs/${job.id}`, request.url), 303);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Video generation failed." },
      { status: 400 }
    );
  }
}
