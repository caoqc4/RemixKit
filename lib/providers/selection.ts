import { hasCredential } from "@/lib/config/local-config";
import { analysisProviders } from "./analysis/registry";
import type { AnalysisProviderId } from "./analysis/types";
import { videoProviders } from "./video/registry";
import type { VideoProviderCapabilities, VideoProviderId } from "./video/types";

export type ProviderChoice<TProviderId extends string> = TProviderId | "auto";

export async function selectAnalysisProvider(
  choice: ProviderChoice<AnalysisProviderId>
): Promise<AnalysisProviderId | null> {
  if (choice !== "auto") {
    return (await hasCredential(analysisProviders.find((provider) => provider.id === choice)?.envKey ?? ""))
      ? choice
      : null;
  }

  for (const provider of analysisProviders) {
    if (await hasCredential(provider.envKey)) {
      return provider.id;
    }
  }

  return null;
}

export async function selectVideoProvider(
  choice: ProviderChoice<VideoProviderId>,
  required: Partial<VideoProviderCapabilities> = { supportsVideoToVideo: true }
): Promise<VideoProviderId | null> {
  if (choice !== "auto") {
    const provider = videoProviders.find((candidate) => candidate.id === choice);
    if (!provider || !providerSatisfies(provider.capabilities, required)) {
      return null;
    }

    return (await hasCredential(provider.envKey)) ? choice : null;
  }

  for (const provider of videoProviders) {
    if (providerSatisfies(provider.capabilities, required) && (await hasCredential(provider.envKey))) {
      return provider.id;
    }
  }

  return null;
}

function providerSatisfies(
  capabilities: VideoProviderCapabilities,
  required: Partial<VideoProviderCapabilities>
) {
  return Object.entries(required).every(([key, value]) => {
    if (!value) {
      return true;
    }

    return capabilities[key as keyof VideoProviderCapabilities] === value;
  });
}

