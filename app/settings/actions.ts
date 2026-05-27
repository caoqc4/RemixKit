"use server";

import { revalidatePath } from "next/cache";
import { analysisProviders } from "@/lib/providers/analysis/registry";
import { transcriptionProviders } from "@/lib/providers/transcription/registry";
import { videoProviders } from "@/lib/providers/video/registry";
import { upsertLocalCredentials } from "@/lib/config/local-config";

export async function saveProviderSettings(formData: FormData) {
  const allowedKeys = new Set([
    ...analysisProviders.map((provider) => provider.envKey),
    ...transcriptionProviders.map((provider) => provider.envKey),
    ...videoProviders.map((provider) => provider.envKey)
  ]);

  const keys: Record<string, string> = {};

  for (const key of allowedKeys) {
    const value = formData.get(key);
    if (typeof value === "string" && value.trim()) {
      keys[key] = value;
    }
  }

  await upsertLocalCredentials(keys);
  revalidatePath("/");
  revalidatePath("/settings");
}
