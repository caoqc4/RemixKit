import { extractChatCompletionText, parseJsonFromModel } from "@/lib/analysis/json";
import { buildCreativeAnalysisPrompt, buildVariantPlanningPrompt } from "@/lib/analysis/prompt";
import { analysisSystemPrompt, creativeAnalysisSchema, variantPlansEnvelopeSchema, variantPlanningSystemPrompt } from "@/lib/analysis/schema";
import type { AnalysisAdapter } from "./adapter";
import { postJson } from "./http";

export const deepSeekAnalysisAdapter: AnalysisAdapter = {
  async analyzeCreative(input) {
    const payload = await deepSeekJsonCompletion({
      apiKey: input.apiKey,
      model: input.model,
      system: `${analysisSystemPrompt}\nThe response must be a valid json object.`,
      prompt: buildCreativeAnalysisPrompt(input)
    });

    return creativeAnalysisSchema.parse(parseJsonFromModel(extractChatCompletionText(payload)));
  },

  async planVariants(input) {
    const payload = await deepSeekJsonCompletion({
      apiKey: input.apiKey,
      model: input.model,
      system: `${variantPlanningSystemPrompt}\nThe response must be a valid json object.`,
      prompt: buildVariantPlanningPrompt(input)
    });

    return variantPlansEnvelopeSchema.parse(parseJsonFromModel(extractChatCompletionText(payload))).variants;
  }
};

async function deepSeekJsonCompletion(input: {
  apiKey: string;
  model: string;
  system: string;
  prompt: string;
}) {
  return postJson("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`
    },
    body: JSON.stringify({
      model: input.model,
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.prompt }
      ],
      response_format: { type: "json_object" }
    })
  });
}
