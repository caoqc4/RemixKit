import { readFile } from "node:fs/promises";
import path from "node:path";
import RunwayML, { toFile } from "@runwayml/sdk";
import type { VideoGenerationAdapter } from "./adapter";

export const runwayVideoAdapter: VideoGenerationAdapter = {
  async generate(input) {
    const client = new RunwayML({ apiKey: input.apiKey });
    const videoUri = input.sourceVideoUrl ?? (await uploadLocalSourceVideo(client, input.sourceVideoPath));

    const task = await client.videoToVideo.create({
      model: "gen4_aleph",
      promptText: input.prompt.slice(0, 1000),
      videoUri
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

async function uploadLocalSourceVideo(client: RunwayML, sourceVideoPath: string | undefined) {
  if (!sourceVideoPath) {
    throw new Error("Runway video-to-video generation requires a source video URL or local source video path.");
  }

  const upload = await client.uploads.createEphemeral({
    file: await toFile(await readFile(sourceVideoPath), path.basename(sourceVideoPath))
  });

  return upload.uri;
}
