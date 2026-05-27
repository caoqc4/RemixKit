import path from "node:path";
import { probeVideo } from "./ffprobe";
import { detectSceneFrames, extractAudioTrack, sampleVideoFrames } from "./ffmpeg";
import type { ExtractedVideoFacts } from "./types";
import { transcribeExtractedAudio } from "@/lib/transcription/run";

export async function extractVideoFacts(input: {
  jobId: string;
  sourceVideoPath: string;
  sourceVideoUrl?: string;
}): Promise<{ facts: ExtractedVideoFacts; warnings: string[] }> {
  if (input.sourceVideoUrl) {
    return {
      facts: {
        jobId: input.jobId,
        sourceVideoPath: input.sourceVideoPath,
        sourceVideoUrl: input.sourceVideoUrl,
        metadata: {},
        frames: [],
        transcript: [],
        ocr: [],
        scenes: []
      },
      warnings: [
        "Hosted storage mode stores the source video in Vercel Blob and skips local ffmpeg extraction. Analysis will use sparse evidence unless you run the app locally or add a background media extraction worker."
      ]
    };
  }

  const probe = await probeVideo(input.sourceVideoPath);
  const frames = await sampleVideoFrames({
    sourceVideoPath: input.sourceVideoPath,
    framesDir: path.join(process.cwd(), "storage", "jobs", input.jobId, "frames"),
    durationSeconds: probe.metadata.durationSeconds
  });
  const sceneFrames = await detectSceneFrames({
    sourceVideoPath: input.sourceVideoPath,
    framesDir: path.join(process.cwd(), "storage", "jobs", input.jobId, "frames")
  });
  const audio = await extractAudioTrack({
    sourceVideoPath: input.sourceVideoPath,
    audioDir: path.join(process.cwd(), "storage", "jobs", input.jobId, "audio")
  });
  const warnings = [probe.warning, frames.warning, sceneFrames.warning, audio.warning].filter(
    (warning): warning is string => Boolean(warning)
  );
  const allFrames = [...frames.frames, ...sceneFrames.frames].sort((a, b) => a.timestamp - b.timestamp);
  const facts: ExtractedVideoFacts = {
    jobId: input.jobId,
    sourceVideoPath: input.sourceVideoPath,
    metadata: probe.metadata,
    frames: allFrames,
    audio: audio.audio,
    transcript: [],
    ocr: [],
    scenes: sceneFrames.frames.map((frame, index, list) => ({
      start: frame.timestamp,
      end: list[index + 1]?.timestamp ?? probe.metadata.durationSeconds ?? frame.timestamp
    }))
  };
  const transcript = await transcribeExtractedAudio({ facts });
  if (transcript.warning) {
    warnings.push(transcript.warning);
  }

  return {
    facts: {
      ...facts,
      transcript: transcript.transcript
    },
    warnings: warnings.filter((warning): warning is string => Boolean(warning))
  };
}
