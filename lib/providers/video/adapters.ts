import type { VideoProviderId } from "./types";
import type { VideoGenerationAdapter } from "./adapter";
import { lumaVideoAdapter } from "./luma";
import { runwayVideoAdapter } from "./runway";

export const videoAdapters: Partial<Record<VideoProviderId, VideoGenerationAdapter>> = {
  luma: lumaVideoAdapter,
  runway: runwayVideoAdapter
};
