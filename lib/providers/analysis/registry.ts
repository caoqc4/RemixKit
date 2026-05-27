import type { AnalysisProviderDefinition, AnalysisProviderId } from "./types";

export const analysisProviders: AnalysisProviderDefinition[] = [
  {
    id: "openai",
    name: "OpenAI",
    envKey: "OPENAI_API_KEY",
    modelEnvKey: "OPENAI_ANALYSIS_MODEL",
    description: "Default auto-select option when available; supports image evidence and structured reasoning workflows.",
    setupUrl: "https://platform.openai.com/settings/organization/api-keys",
    capabilityNotes: ["Receives sampled frame images when available.", "Uses the shared RemixKit analysis schema."],
    defaultModel: "gpt-5",
    capabilities: {
      supportsImages: true,
      supportsVideoFile: false,
      supportsStructuredOutput: true,
      supportsReasoning: true
    }
  },
  {
    id: "gemini",
    name: "Gemini",
    envKey: "GEMINI_API_KEY",
    modelEnvKey: "GEMINI_ANALYSIS_MODEL",
    description: "Peer analysis provider with strong multimodal and video-understanding potential.",
    setupUrl: "https://aistudio.google.com/app/apikey",
    capabilityNotes: ["Can receive sampled frame images.", "Video-file input is modeled as a future capability."],
    defaultModel: "gemini-2.5-flash",
    capabilities: {
      supportsImages: true,
      supportsVideoFile: true,
      supportsStructuredOutput: true,
      supportsReasoning: true
    }
  },
  {
    id: "anthropic",
    name: "Anthropic",
    envKey: "ANTHROPIC_API_KEY",
    modelEnvKey: "ANTHROPIC_ANALYSIS_MODEL",
    description: "Peer analysis provider for high-quality creative reasoning over frames, transcript, and OCR.",
    setupUrl: "https://console.anthropic.com/settings/keys",
    capabilityNotes: ["Receives sampled frame images when available.", "Uses text plus image evidence."],
    defaultModel: "claude-sonnet-4-20250514",
    capabilities: {
      supportsImages: true,
      supportsVideoFile: false,
      supportsStructuredOutput: true,
      supportsReasoning: true
    }
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    envKey: "DEEPSEEK_API_KEY",
    modelEnvKey: "DEEPSEEK_ANALYSIS_MODEL",
    description: "Peer provider for cost-conscious reasoning and variant planning from extracted evidence.",
    setupUrl: "https://platform.deepseek.com/api_keys",
    capabilityNotes: ["Receives text evidence only in the current MVP.", "Still returns the same RemixKit schemas."],
    defaultModel: "deepseek-v4-pro",
    capabilities: {
      supportsImages: false,
      supportsVideoFile: false,
      supportsStructuredOutput: true,
      supportsReasoning: true
    }
  },
  {
    id: "fal-openrouter",
    name: "fal / OpenRouter",
    envKey: "FAL_KEY",
    modelEnvKey: "FAL_OPENROUTER_ANALYSIS_MODEL",
    description: "Quick-start analysis route through fal's OpenRouter-compatible endpoint.",
    setupUrl: "https://fal.ai/dashboard/keys",
    capabilityNotes: ["Uses FAL_KEY.", "Routes OpenRouter analysis models through fal."],
    defaultModel: "google/gemini-2.5-flash",
    capabilities: {
      supportsImages: false,
      supportsVideoFile: false,
      supportsStructuredOutput: true,
      supportsReasoning: true
    }
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    envKey: "OPENROUTER_API_KEY",
    modelEnvKey: "OPENROUTER_ANALYSIS_MODEL",
    description: "Direct aggregator for analysis models such as Gemini, Claude, OpenAI, and DeepSeek.",
    setupUrl: "https://openrouter.ai/settings/keys",
    capabilityNotes: ["Uses OPENROUTER_API_KEY.", "Routes multiple LLM providers behind one key."],
    defaultModel: "google/gemini-2.5-flash",
    capabilities: {
      supportsImages: false,
      supportsVideoFile: false,
      supportsStructuredOutput: true,
      supportsReasoning: true
    }
  }
];

export function getAnalysisProvider(id: AnalysisProviderId) {
  return analysisProviders.find((provider) => provider.id === id);
}
