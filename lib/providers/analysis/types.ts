export type AnalysisProviderId = "openai" | "gemini" | "anthropic" | "deepseek";

export type AnalysisProviderCapabilities = {
  supportsImages: boolean;
  supportsVideoFile: boolean;
  supportsStructuredOutput: boolean;
  supportsReasoning: boolean;
};

export type AnalysisProviderDefinition = {
  id: AnalysisProviderId;
  name: string;
  envKey: string;
  modelEnvKey: string;
  description: string;
  setupUrl: string;
  capabilityNotes: string[];
  defaultModel: string;
  capabilities: AnalysisProviderCapabilities;
};

export type CreativeAnalysis = {
  creativeSummary: string;
  hookAnalysis: {
    type: string;
    timestamp: string;
    whyItWorks: string;
    remixGuidance: string;
  };
  sceneTimeline: Array<{
    start: number;
    end: number;
    role: string;
    visual: string;
    spokenOrCaptionText: string;
    marketingFunction: string;
    remixGuidance: string;
  }>;
  pacingAndRhythm: string;
  messageStructure: string;
  visualPattern: string;
  complianceRisk: string[];
  variantStrategy: string[];
};

export type VariantPlan = {
  id: string;
  name: string;
  angle: string;
  targetAudience: string;
  shotList: Array<{
    start: number;
    end: number;
    prompt: string;
    caption?: string;
  }>;
  providerPrompt: string;
};
