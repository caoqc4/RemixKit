export type ExtractedVideoFacts = {
  jobId: string;
  sourceVideoPath: string;
  sourceVideoUrl?: string;
  metadata: {
    durationSeconds?: number;
    width?: number;
    height?: number;
    fps?: number;
    hasAudio?: boolean;
  };
  frames: Array<{
    path: string;
    timestamp: number;
    kind: "sampled" | "scene";
  }>;
  audio?: {
    path: string;
    format: "mp3";
  };
  transcript?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
  ocr?: Array<{
    timestamp: number;
    text: string;
  }>;
  scenes?: Array<{
    start: number;
    end: number;
  }>;
};
