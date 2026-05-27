import RunwayML from "@runwayml/sdk";
import type { GeneratedVideo } from "./types";

export async function refreshRunwayGeneratedVideo(input: {
  apiKey: string;
  generatedVideo: GeneratedVideo;
}): Promise<GeneratedVideo> {
  if (!input.generatedVideo.remoteId) {
    return input.generatedVideo;
  }

  const client = new RunwayML({ apiKey: input.apiKey });
  const task = await client.tasks.retrieve(input.generatedVideo.remoteId);

  if (task.status === "SUCCEEDED") {
    return {
      ...input.generatedVideo,
      status: "completed",
      outputUrl: task.output[0],
      error: undefined
    };
  }

  if (task.status === "FAILED") {
    return {
      ...input.generatedVideo,
      status: "failed",
      error: task.failure
    };
  }

  if (task.status === "CANCELLED") {
    return {
      ...input.generatedVideo,
      status: "failed",
      error: "Runway task was cancelled."
    };
  }

  return input.generatedVideo;
}

