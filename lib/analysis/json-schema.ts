export const creativeAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    creativeSummary: { type: "string" },
    hookAnalysis: {
      type: "object",
      additionalProperties: false,
      properties: {
        type: { type: "string" },
        timestamp: { type: "string" },
        whyItWorks: { type: "string" },
        remixGuidance: { type: "string" }
      },
      required: ["type", "timestamp", "whyItWorks", "remixGuidance"]
    },
    sceneTimeline: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          start: { type: "number" },
          end: { type: "number" },
          role: { type: "string" },
          visual: { type: "string" },
          spokenOrCaptionText: { type: "string" },
          marketingFunction: { type: "string" },
          remixGuidance: { type: "string" }
        },
        required: [
          "start",
          "end",
          "role",
          "visual",
          "spokenOrCaptionText",
          "marketingFunction",
          "remixGuidance"
        ]
      }
    },
    pacingAndRhythm: { type: "string" },
    messageStructure: { type: "string" },
    visualPattern: { type: "string" },
    complianceRisk: { type: "array", items: { type: "string" } },
    variantStrategy: { type: "array", items: { type: "string" } }
  },
  required: [
    "creativeSummary",
    "hookAnalysis",
    "sceneTimeline",
    "pacingAndRhythm",
    "messageStructure",
    "visualPattern",
    "complianceRisk",
    "variantStrategy"
  ]
} as const;

export const variantPlansJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    variants: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          angle: { type: "string" },
          targetAudience: { type: "string" },
          shotList: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                start: { type: "number" },
                end: { type: "number" },
                prompt: { type: "string" },
                caption: { type: "string" }
              },
              required: ["start", "end", "prompt"]
            }
          },
          providerPrompt: { type: "string" }
        },
        required: ["id", "name", "angle", "targetAudience", "shotList", "providerPrompt"]
      }
    }
  },
  required: ["variants"]
} as const;

export const variantPlansArrayJsonSchema = {
  type: "array",
  minItems: 3,
  maxItems: 5,
  items: {
    type: "object",
    additionalProperties: false,
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      angle: { type: "string" },
      targetAudience: { type: "string" },
      shotList: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            start: { type: "number" },
            end: { type: "number" },
            prompt: { type: "string" },
            caption: { type: "string" }
          },
          required: ["start", "end", "prompt"]
        }
      },
      providerPrompt: { type: "string" }
    },
    required: ["id", "name", "angle", "targetAudience", "shotList", "providerPrompt"]
  }
} as const;
