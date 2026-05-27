import type { VideoGenerationAdapter } from "./adapter";
import { postJson } from "./http";

type LumaGenerationResponse = {
  id?: string;
  state?: string;
  assets?: {
    video?: string;
  };
};

export const lumaVideoAdapter: VideoGenerationAdapter = {
  async generate(input) {
    if (!input.sourceVideoUrl) {
      throw new Error(
        "Luma Modify Video requires a publicly reachable source video URL. Local uploads need a hosted URL before Luma generation can run."
      );
    }

    const payload = (await postJson("https://api.lumalabs.ai/dream-machine/v1/generations/video/modify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`
      },
      body: JSON.stringify({
        generation_type: "modify_video",
        media: {
          url: input.sourceVideoUrl
        },
        model: input.model,
        mode: "flex_1",
        prompt: input.prompt
      })
    })) as LumaGenerationResponse;

    return {
      provider: "luma",
      variantId: input.variantId,
      status: payload.state === "completed" ? "completed" : "submitted",
      remoteId: payload.id,
      outputUrl: payload.assets?.video,
      createdAt: new Date().toISOString()
    };
  }
};

