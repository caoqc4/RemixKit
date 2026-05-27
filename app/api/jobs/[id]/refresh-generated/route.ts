import { NextResponse } from "next/server";
import { runWithRequestCredentials } from "@/lib/config/local-config";
import { readCredentialsFromRequest } from "@/lib/config/request-credentials";
import { refreshGeneratedVideos } from "@/lib/generation/run";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const credentials = readCredentialsFromRequest(request);

  try {
    const job = await runWithRequestCredentials(credentials, () => refreshGeneratedVideos(id));
    return NextResponse.redirect(new URL(`/jobs/${job.id}`, request.url), 303);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not refresh generated videos." },
      { status: 400 }
    );
  }
}
