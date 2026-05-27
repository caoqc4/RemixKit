import type { TranscriptionProviderDefinition, TranscriptionProviderId } from "./types";

export const transcriptionProviders: TranscriptionProviderDefinition[] = [
  {
    id: "openai",
    name: "OpenAI Transcription",
    envKey: "OPENAI_API_KEY",
    modelEnvKey: "OPENAI_TRANSCRIPTION_MODEL",
    defaultModel: "gpt-4o-transcribe",
    description: "Transcribes extracted audio into text evidence for creative analysis.",
    setupUrl: "https://platform.openai.com/settings/organization/api-keys",
    capabilityNotes: ["Evidence extraction only.", "Does not affect analysis provider selection."]
  }
];

export function getTranscriptionProvider(id: TranscriptionProviderId) {
  return transcriptionProviders.find((provider) => provider.id === id);
}
