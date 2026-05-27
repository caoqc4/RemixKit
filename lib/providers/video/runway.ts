import { readFile } from "node:fs/promises";
import path from "node:path";
import RunwayML, { toFile } from "@runwayml/sdk";
import type { VideoGenerationAdapter } from "./adapter";

export const runwayVideoAdapter: VideoGenerationAdapter = {
  async generate(input) {
    if (!input.sourceVideoPath) {
      throw new Error("Runway video-to-video generation requires a local source video path.");
    }

    const client = new RunwayML({ apiKey: input.apiKey });
    const upload = await client.uploads.createEphemeral({
      file: await toFile(await readFile(input.sourceVideoPath), path.basename(input.sourceVideoPath))
    });
    const task = await client.videoToVideo.create({
      model: "gen4_aleph",
      promptText: input.prompt.slice(0, 1000),
      videoUri: upload.uri
    });

    return {
      provider: "runway",
      variantId: input.variantId,
      status: "submitted",
      remoteId: task.id,
      createdAt: new Date().toISOString()
    };
  }
};

