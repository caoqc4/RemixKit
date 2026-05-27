import { creativeAnalysisJsonSchema, variantPlansJsonSchema } from "@/lib/analysis/json-schema";
import { frameEvidenceInstruction, type FrameImageEvidence } from "@/lib/analysis/frame-evidence";
import { extractGeminiText, parseJsonFromModel } from "@/lib/analysis/json";
import { buildCreativeAnalysisPrompt, buildVariantPlanningPrompt } from "@/lib/analysis/prompt";
import { analysisSystemPrompt, creativeAnalysisSchema, variantPlansEnvelopeSchema, variantPlanningSystemPrompt } from "@/lib/analysis/schema";
import type { AnalysisAdapter } from "./adapter";
import { postJson } from "./http";

export const geminiAnalysisAdapter: AnalysisAdapter = {
  async analyzeCreative(input) {
    const payload = await geminiJsonResponse({
      apiKey: input.apiKey,
      model: input.model,
      system: analysisSystemPrompt,
      prompt: buildCreativeAnalysisPrompt(input),
      frameImages: input.frameImages,
      schema: creativeAnalysisJsonSchema
    });

    return creativeAnalysisSchema.parse(parseJsonFromModel(extractGeminiText(payload)));
  },

  async planVariants(input) {
    const payload = await geminiJsonResponse({
      apiKey: input.apiKey,
      model: input.model,
      system: variantPlanningSystemPrompt,
      prompt: buildVariantPlanningPrompt(input),
      schema: variantPlansJsonSchema
    });

    return variantPlansEnvelopeSchema.parse(parseJsonFromModel(extractGeminiText(payload))).variants;
  }
};

async function geminiJsonResponse(input: {
  apiKey: string;
  model: string;
  system: string;
  prompt: string;
  frameImages?: FrameImageEvidence[];
  schema: unknown;
}) {
  const parts = [
    { text: `${input.prompt}\n\n${frameEvidenceInstruction(input.frameImages ?? [])}` },
    ...(input.frameImages ?? []).map((frame) => ({
      inline_data: {
        mime_type: frame.mimeType,
        data: frame.base64
      }
    }))
  ];

  return postJson(`https://generativelanguage.googleapis.com/v1beta/models/${input.model}:generateContent`, {
    method: "POST",
    headers: {
      "x-goog-api-key": input.apiKey
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: input.system }]
      },
      contents: [
        {
          role: "user",
          parts
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: input.schema
      }
    })
  });
}
