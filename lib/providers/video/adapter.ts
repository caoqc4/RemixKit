import type { GeneratedVideo, VideoGenerationInput } from "./types";

export type VideoGenerationAdapter = {
  generate(input: VideoGenerationInput & { variantId: string }): Promise<GeneratedVideo>;
};

