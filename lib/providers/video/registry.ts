import type { VideoProviderDefinition, VideoProviderId } from "./types";

export const videoProviders: VideoProviderDefinition[] = [
  {
    id: "luma",
    name: "Luma",
    envKey: "LUMA_API_KEY",
    modelEnvKey: "LUMA_VIDEO_MODEL",
    description: "Priority provider for video-to-video remix and source-video modification workflows.",
    setupUrl: "https://lumalabs.ai/dream-machine/api/keys",
    capabilityNotes: ["Modify Video is wired.", "Requires a publicly reachable source video URL."],
    priority: "P0",
    capabilities: {
      supportsVideoToVideo: true,
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsReferenceFrames: true,
      supportsLocalFileUpload: false
    }
  },
  {
    id: "runway",
    name: "Runway",
    envKey: "RUNWAY_API_KEY",
    modelEnvKey: "RUNWAY_VIDEO_MODEL",
    description: "Priority provider for video-to-video and image-guided generation workflows.",
    setupUrl: "https://app.runwayml.com/settings/api",
    capabilityNotes: ["Supports local uploads via ephemeral uploads.", "Submits gen4_aleph video-to-video tasks."],
    priority: "P0",
    capabilities: {
      supportsVideoToVideo: true,
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsReferenceFrames: true,
      supportsLocalFileUpload: true
    }
  },
  {
    id: "veo",
    name: "Veo",
    envKey: "GOOGLE_APPLICATION_CREDENTIALS",
    modelEnvKey: "VEO_VIDEO_MODEL",
    description: "Provider slot for image-to-video, reference frames, and extension workflows.",
    setupUrl: "https://console.cloud.google.com/apis/credentials",
    capabilityNotes: ["Registered provider slot.", "Adapter implementation is pending."],
    priority: "P1",
    capabilities: {
      supportsVideoToVideo: false,
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsReferenceFrames: true,
      supportsLocalFileUpload: false
    }
  },
  {
    id: "fal",
    name: "fal",
    envKey: "FAL_KEY",
    modelEnvKey: "FAL_VIDEO_MODEL",
    description: "Aggregator slot for model-specific image, video, audio, and media generation endpoints.",
    setupUrl: "https://fal.ai/dashboard/keys",
    capabilityNotes: ["Registered provider slot.", "Model-specific adapter is pending."],
    priority: "P1",
    capabilities: {
      supportsVideoToVideo: true,
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsReferenceFrames: true,
      supportsLocalFileUpload: false
    }
  },
  {
    id: "replicate",
    name: "Replicate",
    envKey: "REPLICATE_API_TOKEN",
    modelEnvKey: "REPLICATE_VIDEO_MODEL",
    description: "Aggregator slot for prediction-based video generation models.",
    setupUrl: "https://replicate.com/account/api-tokens",
    capabilityNotes: ["Registered provider slot.", "Prediction adapter is pending."],
    priority: "P2",
    capabilities: {
      supportsVideoToVideo: true,
      supportsImageToVideo: true,
      supportsTextToVideo: true,
      supportsReferenceFrames: true,
      supportsLocalFileUpload: false
    }
  }
];

export function getVideoProvider(id: VideoProviderId) {
  return videoProviders.find((provider) => provider.id === id);
}
