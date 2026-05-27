export type VideoProviderId = "luma" | "runway" | "veo" | "fal" | "replicate";

export type VideoProviderCapabilities = {
  supportsVideoToVideo: boolean;
  supportsImageToVideo: boolean;
  supportsTextToVideo: boolean;
  supportsReferenceFrames: boolean;
  supportsLocalFileUpload: boolean;
};

export type VideoProviderDefinition = {
  id: VideoProviderId;
  name: string;
  envKey: string;
  modelEnvKey: string;
  description: string;
  setupUrl: string;
  capabilityNotes: string[];
  priority: "P0" | "P1" | "P2";
  capabilities: VideoProviderCapabilities;
};

export type VideoGenerationInput = {
  jobId: string;
  apiKey: string;
  model: string;
  prompt: string;
  sourceVideoPath?: string;
  sourceVideoUrl?: string;
  referenceImagePaths?: string[];
  durationSeconds?: number;
};

export type GeneratedVideo = {
  provider: VideoProviderId;
  variantId: string;
  status: "submitted" | "completed" | "failed";
  outputPath?: string;
  outputUrl?: string;
  remoteId?: string;
  error?: string;
  createdAt: string;
};
