import type { AnalysisProviderId } from "@/lib/providers/analysis/types";
import type { CreativeAnalysis, VariantPlan } from "@/lib/providers/analysis/types";
import type { VideoProviderId } from "@/lib/providers/video/types";
import type { GeneratedVideo } from "@/lib/providers/video/types";
import type { ExtractedVideoFacts } from "@/lib/extraction/types";

export type ProviderSelection<TId extends string> = TId | "auto";

export type RemixJobStatus =
  | "created"
  | "extracted"
  | "analyzing"
  | "analyzed"
  | "generating"
  | "generated"
  | "analysis_pending"
  | "failed";

export type RemixJob = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: RemixJobStatus;
  sourceFileName: string;
  sourceVideoPath: string;
  sourceVideoUrl?: string;
  storageMode?: "local" | "vercel-blob";
  goal: string;
  analysisProvider: ProviderSelection<AnalysisProviderId>;
  generationProvider: ProviderSelection<VideoProviderId>;
  facts?: ExtractedVideoFacts;
  analysis?: CreativeAnalysis;
  variantPlans?: VariantPlan[];
  generatedVideos?: GeneratedVideo[];
  resolvedAnalysisProvider?: AnalysisProviderId;
  analysisModel?: string;
  resolvedGenerationProvider?: VideoProviderId;
  generationModel?: string;
  warnings: string[];
  error?: string;
};

export type RemixJobSummary = Pick<
  RemixJob,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "status"
  | "sourceFileName"
  | "goal"
  | "analysisProvider"
  | "generationProvider"
  | "warnings"
>;
