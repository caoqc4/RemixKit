import { creativeAnalysisJsonSchema, variantPlansJsonSchema } from "@/lib/analysis/json-schema";
import { frameEvidenceInstruction, type FrameImageEvidence } from "@/lib/analysis/frame-evidence";
import { extractOpenAIText, parseJsonFromModel } from "@/lib/analysis/json";
import { buildCreativeAnalysisPrompt, buildVariantPlanningPrompt } from "@/lib/analysis/prompt";
import { analysisSystemPrompt, creativeAnalysisSchema, variantPlansEnvelopeSchema, variantPlanningSystemPrompt } from "@/lib/analysis/schema";
import type { AnalysisAdapter } from "./adapter";
import { postJson } from "./http";

export const openAIAnalysisAdapter: AnalysisAdapter = {
  async analyzeCreative(input) {
    const payload = await openAIJsonResponse({
      apiKey: input.apiKey,
      model: input.model,
      system: analysisSystemPrompt,
      prompt: buildCreativeAnalysisPrompt(input),
      frameImages: input.frameImages,
      name: "creative_analysis",
      schema: creativeAnalysisJsonSchema
    });

    return creativeAnalysisSchema.parse(parseJsonFromModel(extractOpenAIText(payload)));
  },

  async planVariants(input) {
    const payload = await openAIJsonResponse({
      apiKey: input.apiKey,
      model: input.model,
      system: variantPlanningSystemPrompt,
      prompt: buildVariantPlanningPrompt(input),
      name: "variant_plans",
      schema: variantPlansJsonSchema
    });

    return variantPlansEnvelopeSchema.parse(parseJsonFromModel(extractOpenAIText(payload))).variants;
  }
};

async function openAIJsonResponse(input: {
  apiKey: string;
  model: string;
  system: string;
  prompt: string;
  frameImages?: FrameImageEvidence[];
  name: string;
  schema: unknown;
}) {
  const userContent = [
    { type: "input_text", text: `${input.prompt}\n\n${frameEvidenceInstruction(input.frameImages ?? [])}` },
    ...(input.frameImages ?? []).map((frame) => ({
      type: "input_image",
      image_url: `data:${frame.mimeType};base64,${frame.base64}`
    }))
  ];

  return postJson("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`
    },
    body: JSON.stringify({
      model: input.model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: input.system }]
        },
        {
          role: "user",
          content: userContent
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: input.name,
          schema: input.schema,
          strict: true
        }
      }
    })
  });
}
