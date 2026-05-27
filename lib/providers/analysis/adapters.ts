import type { AnalysisProviderId } from "./types";
import type { AnalysisAdapter } from "./adapter";
import { anthropicAnalysisAdapter } from "./anthropic";
import { deepSeekAnalysisAdapter } from "./deepseek";
import { geminiAnalysisAdapter } from "./gemini";
import { openAIAnalysisAdapter } from "./openai";

export const analysisAdapters: Record<AnalysisProviderId, AnalysisAdapter> = {
  openai: openAIAnalysisAdapter,
  gemini: geminiAnalysisAdapter,
  anthropic: anthropicAnalysisAdapter,
  deepseek: deepSeekAnalysisAdapter
};
