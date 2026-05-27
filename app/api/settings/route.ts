import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { upsertLocalCredentials } from "@/lib/config/local-config";
import { getProviderStatuses } from "@/lib/config/provider-status";

export async function POST(request: Request) {
  if (process.env.VERCEL) {
    return NextResponse.json({
      ok: true,
      storage: "browser",
      message: "Hosted RemixKit stores API keys in the browser, not on the Vercel server."
    });
  }

  const { envKey, value } = await request.json().catch(() => ({ envKey: "", value: "" }));

  if (typeof envKey !== "string" || typeof value !== "string") {
    return NextResponse.json({ error: "Invalid settings payload." }, { status: 400 });
  }

  const statuses = await getProviderStatuses();
  const allowedKeys = new Set(
    [
      ...statuses.analysis,
      ...statuses.generation,
      ...statuses.transcription,
      { envKey: "OPENROUTER_API_KEY" },
    ].map((provider) => provider.envKey)
  );

  if (!allowedKeys.has(envKey)) {
    return NextResponse.json({ error: "Unknown provider key." }, { status: 400 });
  }

  await upsertLocalCredentials({ [envKey]: value });
  revalidatePath("/");
  revalidatePath("/jobs");
  revalidatePath("/settings");

  return NextResponse.json({ ok: true });
}
