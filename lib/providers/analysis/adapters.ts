import type { AnalysisProviderId } from "./types";
import type { AnalysisAdapter } from "./adapter";
import { anthropicAnalysisAdapter } from "./anthropic";
import { deepSeekAnalysisAdapter } from "./deepseek";
import { geminiAnalysisAdapter } from "./gemini";
import { openAIAnalysisAdapter } from "./openai";
import { falOpenRouterAnalysisAdapter, openRouterAnalysisAdapter } from "./openrouter";

export const analysisAdapters: Record<AnalysisProviderId, AnalysisAdapter> = {
  openai: openAIAnalysisAdapter,
  gemini: geminiAnalysisAdapter,
  anthropic: anthropicAnalysisAdapter,
  deepseek: deepSeekAnalysisAdapter,
  "fal-openrouter": falOpenRouterAnalysisAdapter,
  openrouter: openRouterAnalysisAdapter
};
