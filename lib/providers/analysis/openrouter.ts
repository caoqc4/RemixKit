import { extractChatCompletionText, parseJsonFromModel } from "@/lib/analysis/json";
import { buildCreativeAnalysisPrompt, buildVariantPlanningPrompt } from "@/lib/analysis/prompt";
import { analysisSystemPrompt, creativeAnalysisSchema, variantPlansEnvelopeSchema, variantPlanningSystemPrompt } from "@/lib/analysis/schema";
import type { AnalysisAdapter } from "./adapter";
import { postJson } from "./http";

export function createOpenRouterAnalysisAdapter(input: {
  baseUrl: string;
  authorizationHeader: (apiKey: string) => string;
}): AnalysisAdapter {
  return {
    async analyzeCreative(request) {
      const payload = await chatCompletionJson({
        baseUrl: input.baseUrl,
        authorization: input.authorizationHeader(request.apiKey),
        model: request.model,
        system: analysisSystemPrompt,
        prompt: buildCreativeAnalysisPrompt(request)
      });

      return creativeAnalysisSchema.parse(parseJsonFromModel(extractChatCompletionText(payload)));
    },

    async planVariants(request) {
      const payload = await chatCompletionJson({
        baseUrl: input.baseUrl,
        authorization: input.authorizationHeader(request.apiKey),
        model: request.model,
        system: variantPlanningSystemPrompt,
        prompt: buildVariantPlanningPrompt(request)
      });

      return variantPlansEnvelopeSchema.parse(parseJsonFromModel(extractChatCompletionText(payload))).variants;
    }
  };
}

async function chatCompletionJson(input: {
  baseUrl: string;
  authorization: string;
  model: string;
  system: string;
  prompt: string;
}) {
  return postJson(input.baseUrl, {
    method: "POST",
    headers: {
      Authorization: input.authorization
    },
    body: JSON.stringify({
      model: input.model,
      messages: [
        { role: "system", content: input.system },
        {
          role: "user",
          content: `${input.prompt}\n\nReturn only valid JSON matching the requested schema.`
        }
      ],
      response_format: { type: "json_object" }
    })
  });
}

export const falOpenRouterAnalysisAdapter = createOpenRouterAnalysisAdapter({
  baseUrl: "https://fal.run/openrouter/router/openai/v1/chat/completions",
  authorizationHeader: (apiKey) => `Key ${apiKey}`
});

export const openRouterAnalysisAdapter = createOpenRouterAnalysisAdapter({
  baseUrl: "https://openrouter.ai/api/v1/chat/completions",
  authorizationHeader: (apiKey) => `Bearer ${apiKey}`
});
