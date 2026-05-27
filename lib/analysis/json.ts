export function parseJsonFromModel(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return JSON.parse(fenced ? fenced[1] : trimmed);
}

export function extractOpenAIText(response: unknown) {
  if (isRecord(response) && typeof response.output_text === "string") {
    return response.output_text;
  }

  if (!isRecord(response) || !Array.isArray(response.output)) {
    return "";
  }

  const chunks: string[] = [];
  for (const item of response.output) {
    if (!isRecord(item) || !Array.isArray(item.content)) {
      continue;
    }
    for (const content of item.content) {
      if (isRecord(content) && typeof content.text === "string") {
        chunks.push(content.text);
      }
    }
  }

  return chunks.join("\n");
}

export function extractAnthropicText(response: unknown) {
  if (!isRecord(response) || !Array.isArray(response.content)) {
    return "";
  }

  return response.content
    .map((item) => (isRecord(item) && typeof item.text === "string" ? item.text : ""))
    .filter(Boolean)
    .join("\n");
}

export function extractGeminiText(response: unknown) {
  if (!isRecord(response) || !Array.isArray(response.candidates)) {
    return "";
  }

  return response.candidates
    .flatMap((candidate) => {
      if (!isRecord(candidate) || !isRecord(candidate.content) || !Array.isArray(candidate.content.parts)) {
        return [];
      }
      return candidate.content.parts.map((part) => (isRecord(part) && typeof part.text === "string" ? part.text : ""));
    })
    .filter(Boolean)
    .join("\n");
}

export function extractChatCompletionText(response: unknown) {
  if (!isRecord(response) || !Array.isArray(response.choices)) {
    return "";
  }

  const first = response.choices[0];
  if (!isRecord(first) || !isRecord(first.message) || typeof first.message.content !== "string") {
    return "";
  }

  return first.message.content;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
