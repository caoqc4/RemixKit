import type { CreativeAnalysis, VariantPlan } from "./types";
import type { FrameImageEvidence } from "@/lib/analysis/frame-evidence";
import type { ExtractedVideoFacts } from "@/lib/extraction/types";
import type { VideoProviderCapabilities } from "@/lib/providers/video/types";

export type AnalysisAdapterInput = {
  apiKey: string;
  model: string;
  goal: string;
  facts: ExtractedVideoFacts;
  frameImages?: FrameImageEvidence[];
};

export type VariantPlanningAdapterInput = {
  apiKey: string;
  model: string;
  goal: string;
  analysis: CreativeAnalysis;
  videoProviderCapabilities?: VideoProviderCapabilities;
};

export type AnalysisAdapter = {
  analyzeCreative(input: AnalysisAdapterInput): Promise<CreativeAnalysis>;
  planVariants(input: VariantPlanningAdapterInput): Promise<VariantPlan[]>;
};
