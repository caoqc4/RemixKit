import { NextResponse } from "next/server";
import { analyzeRemixJob } from "@/lib/analysis/run";
import { runWithRequestCredentials } from "@/lib/config/local-config";
import { readCredentialsFromRequest } from "@/lib/config/request-credentials";

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
    const job = await runWithRequestCredentials(credentials, () => analyzeRemixJob(id));
    return NextResponse.redirect(new URL(`/jobs/${job.id}`, request.url), 303);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed." },
      { status: 400 }
    );
  }
}
