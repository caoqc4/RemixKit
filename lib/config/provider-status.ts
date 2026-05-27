import { analysisProviders } from "@/lib/providers/analysis/registry";
import { transcriptionProviders } from "@/lib/providers/transcription/registry";
import { videoProviders } from "@/lib/providers/video/registry";
import { hasCredential } from "./local-config";

type ProviderStatus = {
  id: string;
  name: string;
  envKey: string;
  description: string;
  setupUrl: string;
  capabilityNotes: string[];
  configured: boolean;
};

export async function getProviderStatuses(): Promise<{
  analysis: ProviderStatus[];
  transcription: ProviderStatus[];
  generation: ProviderStatus[];
}> {
  const analysis = await Promise.all(
    analysisProviders.map(async (provider) => ({
      id: provider.id,
      name: provider.name,
      envKey: provider.envKey,
      description: provider.description,
      setupUrl: provider.setupUrl,
      capabilityNotes: provider.capabilityNotes,
      configured: await hasCredential(provider.envKey)
    }))
  );

  const generation = await Promise.all(
    videoProviders.map(async (provider) => ({
      id: provider.id,
      name: provider.name,
      envKey: provider.envKey,
      description: provider.description,
      setupUrl: provider.setupUrl,
      capabilityNotes: provider.capabilityNotes,
      configured: await hasCredential(provider.envKey)
    }))
  );

  const transcription = await Promise.all(
    transcriptionProviders.map(async (provider) => ({
      id: provider.id,
      name: provider.name,
      envKey: provider.envKey,
      description: provider.description,
      setupUrl: provider.setupUrl,
      capabilityNotes: provider.capabilityNotes,
      configured: await hasCredential(provider.envKey)
    }))
  );

  return { analysis, transcription, generation };
}
