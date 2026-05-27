import type { ExtractedVideoFacts } from "@/lib/extraction/types";

export type TranscriptionProviderId = "openai";

export type TranscriptionProviderDefinition = {
  id: TranscriptionProviderId;
  name: string;
  envKey: string;
  modelEnvKey: string;
  defaultModel: string;
  description: string;
  setupUrl: string;
  capabilityNotes: string[];
};

export type TranscriptionSegment = NonNullable<ExtractedVideoFacts["transcript"]>[number];

export type TranscriptionAdapterInput = {
  apiKey: string;
  model: string;
  audioPath: string;
};

export type TranscriptionAdapter = {
  transcribe(input: TranscriptionAdapterInput): Promise<TranscriptionSegment[]>;
};
