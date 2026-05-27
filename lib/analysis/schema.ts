import { z } from "zod";

export const sceneTimelineItemSchema = z.object({
  start: z.number(),
  end: z.number(),
  role: z.string(),
  visual: z.string(),
  spokenOrCaptionText: z.string(),
  marketingFunction: z.string(),
  remixGuidance: z.string()
});

export const creativeAnalysisSchema = z.object({
  creativeSummary: z.string(),
  hookAnalysis: z.object({
    type: z.string(),
    timestamp: z.string(),
    whyItWorks: z.string(),
    remixGuidance: z.string()
  }),
  sceneTimeline: z.array(sceneTimelineItemSchema),
  pacingAndRhythm: z.string(),
  messageStructure: z.string(),
  visualPattern: z.string(),
  complianceRisk: z.array(z.string()),
  variantStrategy: z.array(z.string())
});

export const variantPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  angle: z.string(),
  targetAudience: z.string(),
  shotList: z.array(
    z.object({
      start: z.number(),
      end: z.number(),
      prompt: z.string(),
      caption: z.string().optional()
    })
  ),
  providerPrompt: z.string()
});

export const variantPlansSchema = z.array(variantPlanSchema).min(3).max(5);

export const variantPlansEnvelopeSchema = z.object({
  variants: variantPlansSchema
});

export const analysisSystemPrompt = `You are RemixKit's creative analysis engine.

Analyze reference ads to extract marketing structure, not to copy the source.
Prefer concrete timestamps, observable evidence, and remix guidance.
Flag elements that should not be copied: brand marks, creator identity, protected characters, distinctive lines, exact composition, and copyrighted assets.
Return only structured data matching the requested schema.`;

export const variantPlanningSystemPrompt = `You are RemixKit's variant planning engine.

Create original video ad variants inspired by the reference creative structure.
Do not recreate the original video. Preserve useful marketing logic while changing execution, framing, wording, and visual choices.
Return a JSON object with a "variants" array containing 3 to 5 executable plans with provider-ready prompts.`;
