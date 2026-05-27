import { getConfigValue, getCredential } from "@/lib/config/local-config";
import type { ExtractedVideoFacts } from "@/lib/extraction/types";
import { transcriptionAdapters } from "@/lib/providers/transcription/adapters";
import { transcriptionProviders } from "@/lib/providers/transcription/registry";

export async function transcribeExtractedAudio(input: {
  facts: ExtractedVideoFacts;
}): Promise<{ transcript: NonNullable<ExtractedVideoFacts["transcript"]>; warning?: string }> {
  if (!input.facts.audio) {
    return { transcript: [], warning: "No extracted audio file is available for transcription." };
  }

  const provider = transcriptionProviders[0];
  const apiKey = await getCredential(provider.envKey);
  if (!apiKey) {
    return {
      transcript: [],
      warning: "OpenAI transcription skipped because OPENAI_API_KEY is not configured."
    };
  }

  const model = (await getConfigValue(provider.modelEnvKey)) ?? provider.defaultModel;
  const adapter = transcriptionAdapters[provider.id];

  try {
    return {
      transcript: await adapter.transcribe({
        apiKey,
        model,
        audioPath: input.facts.audio.path
      })
    };
  } catch (error) {
    return {
      transcript: [],
      warning: error instanceof Error ? `OpenAI transcription failed: ${error.message}` : "OpenAI transcription failed."
    };
  }
}

