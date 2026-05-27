import type { TranscriptionProviderId, TranscriptionAdapter } from "./types";
import { openAITranscriptionAdapter } from "./openai";

export const transcriptionAdapters: Record<TranscriptionProviderId, TranscriptionAdapter> = {
  openai: openAITranscriptionAdapter
};

