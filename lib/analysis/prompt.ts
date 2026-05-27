import type { CreativeAnalysis } from "@/lib/providers/analysis/types";
import type { ExtractedVideoFacts } from "@/lib/extraction/types";
import type { VideoProviderCapabilities } from "@/lib/providers/video/types";

export function buildCreativeAnalysisPrompt(input: {
  goal: string;
  facts: ExtractedVideoFacts;
}) {
  return `Return JSON for the RemixKit CreativeAnalysis schema.

User creative goal:
${input.goal || "(none provided)"}

Extracted evidence:
${formatFacts(input.facts)}

Analysis requirements:
- Analyze advertising structure, not just content.
- Use unknown/empty values when evidence is missing.
- Do not infer protected identity, ownership, or private details.
- Identify reusable marketing patterns and elements that should not be copied.
- Include a practical scene timeline even when metadata is sparse.`;
}

export function buildVariantPlanningPrompt(input: {
  goal: string;
  analysis: CreativeAnalysis;
  videoProviderCapabilities?: VideoProviderCapabilities;
}) {
  return `Return JSON for an object with a "variants" array containing 3 to 5 RemixKit VariantPlan objects.

User creative goal:
${input.goal || "(none provided)"}

Creative analysis:
${JSON.stringify(input.analysis, null, 2)}

Generation provider capabilities:
${JSON.stringify(input.videoProviderCapabilities ?? {}, null, 2)}

Variant requirements:
- Generate original ad variants inspired by structure only.
- Avoid copying exact scenes, distinctive phrases, creator identity, brand marks, or protected assets.
- Make each variant meaningfully different in angle, opening, scene execution, and copy.
- Keep prompts provider-ready and concrete.`;
}

function formatFacts(facts: ExtractedVideoFacts) {
  return JSON.stringify(
    {
      metadata: facts.metadata,
      frames: facts.frames,
      transcript: facts.transcript,
      ocr: facts.ocr,
      scenes: facts.scenes
    },
    null,
    2
  );
}
