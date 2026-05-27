import { execFile } from "node:child_process";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { ExtractedVideoFacts } from "./types";

const execFileAsync = promisify(execFile);
const maxSampledFrames = 12;
const maxSceneFrames = 20;

export type FrameSamplingResult = {
  frames: ExtractedVideoFacts["frames"];
  warning?: string;
};

export type AudioExtractionResult = {
  audio?: NonNullable<ExtractedVideoFacts["audio"]>;
  warning?: string;
};

export async function sampleVideoFrames(input: {
  sourceVideoPath: string;
  framesDir: string;
  durationSeconds?: number;
}): Promise<FrameSamplingResult> {
  const interval = chooseFrameInterval(input.durationSeconds);

  try {
    await execFileAsync("ffmpeg", [
      "-y",
      "-i",
      input.sourceVideoPath,
      "-vf",
      `fps=1/${interval},scale=720:-1`,
      "-frames:v",
      String(maxSampledFrames),
      path.join(input.framesDir, "sample_%03d.jpg")
    ]);

    const files = (await readdir(input.framesDir))
      .filter((file) => file.startsWith("sample_") && file.endsWith(".jpg"))
      .sort();

    return {
      frames: files.map((file, index) => ({
        path: path.join(input.framesDir, file),
        timestamp: index * interval,
        kind: "sampled"
      }))
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ffmpeg error";
    return {
      frames: [],
      warning: message.includes("ENOENT")
        ? "ffmpeg is not installed or not available on PATH; skipped frame sampling."
        : `ffmpeg frame sampling failed: ${message}`
    };
  }
}

export async function detectSceneFrames(input: {
  sourceVideoPath: string;
  framesDir: string;
}): Promise<FrameSamplingResult> {
  try {
    await execFileAsync("ffmpeg", [
      "-y",
      "-i",
      input.sourceVideoPath,
      "-vf",
      "select=gt(scene\\,0.35),showinfo,scale=720:-1",
      "-vsync",
      "vfr",
      "-frames:v",
      String(maxSceneFrames),
      path.join(input.framesDir, "scene_%03d.jpg")
    ]);

    const files = (await readdir(input.framesDir))
      .filter((file) => file.startsWith("scene_") && file.endsWith(".jpg"))
      .sort();

    return {
      frames: files.map((file, index) => ({
        path: path.join(input.framesDir, file),
        timestamp: index,
        kind: "scene"
      })),
      warning: files.length ? undefined : "ffmpeg scene detection found no strong scene changes."
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ffmpeg error";
    return {
      frames: [],
      warning: message.includes("ENOENT")
        ? "ffmpeg is not installed or not available on PATH; skipped scene detection."
        : `ffmpeg scene detection failed: ${message}`
    };
  }
}

export async function extractAudioTrack(input: {
  sourceVideoPath: string;
  audioDir: string;
}): Promise<AudioExtractionResult> {
  const audioPath = path.join(input.audioDir, "audio.mp3");

  try {
    await mkdir(input.audioDir, { recursive: true });
    await execFileAsync("ffmpeg", [
      "-y",
      "-i",
      input.sourceVideoPath,
      "-vn",
      "-ac",
      "1",
      "-ar",
      "16000",
      "-b:a",
      "64k",
      audioPath
    ]);

    return {
      audio: {
        path: audioPath,
        format: "mp3"
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ffmpeg error";
    return {
      warning: message.includes("ENOENT")
        ? "ffmpeg is not installed or not available on PATH; skipped audio extraction."
        : `ffmpeg audio extraction failed: ${message}`
    };
  }
}

function chooseFrameInterval(durationSeconds: number | undefined) {
  if (!durationSeconds || durationSeconds <= maxSampledFrames) {
    return 1;
  }

  return Math.max(1, Math.ceil(durationSeconds / maxSampledFrames));
}
