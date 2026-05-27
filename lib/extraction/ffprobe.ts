import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

type FfprobeStream = {
  codec_type?: string;
  width?: number;
  height?: number;
  avg_frame_rate?: string;
  r_frame_rate?: string;
};

type FfprobeFormat = {
  duration?: string;
};

type FfprobeResult = {
  streams?: FfprobeStream[];
  format?: FfprobeFormat;
};

export type ProbeResult = {
  metadata: {
    durationSeconds?: number;
    width?: number;
    height?: number;
    fps?: number;
    hasAudio?: boolean;
  };
  warning?: string;
};

export async function probeVideo(filePath: string): Promise<ProbeResult> {
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v",
      "error",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      filePath
    ]);

    const parsed = JSON.parse(stdout) as FfprobeResult;
    const videoStream = parsed.streams?.find((stream) => stream.codec_type === "video");
    const hasAudio = Boolean(parsed.streams?.some((stream) => stream.codec_type === "audio"));
    const fps = parseFrameRate(videoStream?.avg_frame_rate ?? videoStream?.r_frame_rate);

    return {
      metadata: {
        durationSeconds: parseMaybeNumber(parsed.format?.duration),
        width: videoStream?.width,
        height: videoStream?.height,
        fps,
        hasAudio
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ffprobe error";
    return {
      metadata: {},
      warning: message.includes("ENOENT")
        ? "ffprobe is not installed or not available on PATH; saved the upload but skipped metadata extraction."
        : `ffprobe failed: ${message}`
    };
  }
}

function parseMaybeNumber(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function parseFrameRate(value: string | undefined) {
  if (!value || value === "0/0") {
    return undefined;
  }

  const [numerator, denominator] = value.split("/").map(Number);
  if (!denominator) {
    return Number.isFinite(numerator) ? numerator : undefined;
  }

  const fps = numerator / denominator;
  return Number.isFinite(fps) ? Number(fps.toFixed(3)) : undefined;
}

