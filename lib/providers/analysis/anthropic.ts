import { frameEvidenceInstruction, type FrameImageEvidence } from "@/lib/analysis/frame-evidence";
import { extractAnthropicText, parseJsonFromModel } from "@/lib/analysis/json";
import { buildCreativeAnalysisPrompt, buildVariantPlanningPrompt } from "@/lib/analysis/prompt";
import { analysisSystemPrompt, creativeAnalysisSchema, variantPlansEnvelopeSchema, variantPlanningSystemPrompt } from "@/lib/analysis/schema";
import type { AnalysisAdapter } from "./adapter";
import { postJson } from "./http";

export const anthropicAnalysisAdapter: AnalysisAdapter = {
  async analyzeCreative(input) {
    const payload = await anthropicJsonMessage({
      apiKey: input.apiKey,
      model: input.model,
      system: `${analysisSystemPrompt}\nReturn valid JSON only.`,
      prompt: buildCreativeAnalysisPrompt(input),
      frameImages: input.frameImages
    });

    return creativeAnalysisSchema.parse(parseJsonFromModel(extractAnthropicText(payload)));
  },

  async planVariants(input) {
    const payload = await anthropicJsonMessage({
      apiKey: input.apiKey,
      model: input.model,
      system: `${variantPlanningSystemPrompt}\nReturn valid JSON only.`,
      prompt: buildVariantPlanningPrompt(input)
    });

    return variantPlansEnvelopeSchema.parse(parseJsonFromModel(extractAnthropicText(payload))).variants;
  }
};

async function anthropicJsonMessage(input: {
  apiKey: string;
  model: string;
  system: string;
  prompt: string;
  frameImages?: FrameImageEvidence[];
}) {
  const content = [
    {
      type: "text",
      text: `${input.prompt}\n\n${frameEvidenceInstruction(input.frameImages ?? [])}`
    },
    ...(input.frameImages ?? []).map((frame) => ({
      type: "image",
      source: {
        type: "base64",
        media_type: frame.mimeType,
        data: frame.base64
      }
    }))
  ];

  return postJson("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": input.apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: input.model,
      max_tokens: 4096,
      system: input.system,
      messages: [
        {
          role: "user",
          content
        }
      ]
    })
  });
}
