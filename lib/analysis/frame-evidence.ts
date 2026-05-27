import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ExtractedVideoFacts } from "@/lib/extraction/types";

const maxVisionFrames = 8;

export type FrameImageEvidence = {
  path: string;
  timestamp: number;
  mimeType: string;
  base64: string;
};

export async function loadFrameImageEvidence(facts: ExtractedVideoFacts): Promise<FrameImageEvidence[]> {
  const frames = facts.frames.slice(0, maxVisionFrames);
  const loaded = await Promise.all(
    frames.map(async (frame) => {
      try {
        const buffer = await readFile(frame.path);
        return {
          path: frame.path,
          timestamp: frame.timestamp,
          mimeType: mimeTypeForPath(frame.path),
          base64: buffer.toString("base64")
        };
      } catch {
        return null;
      }
    })
  );

  return loaded.filter((frame): frame is FrameImageEvidence => Boolean(frame));
}

export function frameEvidenceInstruction(frames: FrameImageEvidence[]) {
  if (!frames.length) {
    return "No frame images are attached. Use only the extracted textual and metadata evidence.";
  }

  return `Attached frame images are sampled from the source video in chronological order. Use them as visual evidence only. Frame timestamps: ${frames
    .map((frame) => `${path.basename(frame.path)} at ${frame.timestamp}s`)
    .join(", ")}.`;
}

function mimeTypeForPath(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".png") {
    return "image/png";
  }
  if (extension === ".webp") {
    return "image/webp";
  }
  return "image/jpeg";
}

