import { createReadStream } from "node:fs";
import OpenAI from "openai";
import type { TranscriptionAdapter } from "./types";

export const openAITranscriptionAdapter: TranscriptionAdapter = {
  async transcribe(input) {
    const client = new OpenAI({ apiKey: input.apiKey });
    const response = await client.audio.transcriptions.create({
      file: createReadStream(input.audioPath),
      model: input.model,
      response_format: "json"
    });

    return [
      {
        start: 0,
        end: 0,
        text: response.text
      }
    ];
  }
};

