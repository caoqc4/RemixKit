# RemixKit

Open-source AI workflow for generating video ad variations from reference creatives.

RemixKit is currently a local-first Next.js demo with a lightweight hosted mode for GitHub/Vercel deployment. It is designed to help users upload one reference video, extract creative structure, choose their own analysis and video providers, and generate original ad variants.

## Current MVP

- Web workbench.
- Single reference video upload or public source video URL.
- Local job storage under `storage/jobs`.
- Optional Vercel Blob storage for hosted deployments.
- Provider settings page.
- Peer analysis providers:
  - OpenAI
  - Gemini
  - Anthropic
  - DeepSeek
- Video generation provider registry:
  - Luma
  - Runway
  - Veo
  - fal
  - Replicate
- Optional local config at `.remixkit/config.json`.
- Optional `.env.local` credentials.
- ffprobe metadata extraction when `ffprobe` is installed.
- ffmpeg sampled frame, scene-change frame, and audio extraction when `ffmpeg` is installed.
- OpenAI audio transcription when extracted audio and `OPENAI_API_KEY` are available.

## Run Locally

```bash
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Provider Credentials

Credentials are read in this order:

1. `.env.local`
2. `.remixkit/config.json`
3. Unconfigured state

Example `.env.local`:

```bash
OPENAI_API_KEY=...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=...
DEEPSEEK_API_KEY=...
LUMA_API_KEY=...
RUNWAY_API_KEY=...
GOOGLE_APPLICATION_CREDENTIALS=...
FAL_KEY=...
REPLICATE_API_TOKEN=...
```

Optional model overrides:

```bash
OPENAI_ANALYSIS_MODEL=...
OPENAI_TRANSCRIPTION_MODEL=gpt-4o-transcribe
GEMINI_ANALYSIS_MODEL=...
ANTHROPIC_ANALYSIS_MODEL=...
DEEPSEEK_ANALYSIS_MODEL=...
RUNWAY_VIDEO_MODEL=gen4_aleph
LUMA_VIDEO_MODEL=ray-flash-2
```

The Settings page can save keys into `.remixkit/config.json`. This file is plaintext local config and is ignored by git.

For hosted deployments, configure keys as environment variables in the hosting platform. The settings page is useful for seeing what is missing, but local plaintext config is not persistent on serverless platforms.

The Settings page also links to each provider's official setup page. Direct official-account login is not implemented in the local MVP; it can be added later for providers that expose a stable OAuth or device-code flow.

## Deploy From GitHub to Vercel

1. Push the repository to GitHub.
2. Import the GitHub repo in Vercel as a Next.js project.
3. Create a Vercel Blob store and connect it to the project.
4. Set environment variables:

```bash
REMIXKIT_STORAGE=vercel-blob
BLOB_READ_WRITE_TOKEN=...
OPENAI_API_KEY=...
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=...
DEEPSEEK_API_KEY=...
LUMA_API_KEY=...
RUNWAY_API_KEY=...
```

Hosted mode stores uploaded source videos, job JSON, remix briefs, and downloaded outputs in Vercel Blob. Source videos are saved as public blobs so video providers can read them by URL.

Hosted mode currently skips local ffmpeg/ffprobe extraction because Vercel serverless functions do not provide the same durable filesystem workflow as local development. Analysis still runs with sparse source evidence and the public source URL; run locally when you need full frame/audio/transcript extraction.

For hosted demos, a public source video URL is the most reliable path because it avoids platform request-size limits for large video uploads.

## Provider Selection

Analysis providers are peers. OpenAI may be the first auto-selected provider when multiple keys are configured, but users can manually switch to Gemini, Anthropic, or DeepSeek.

Video providers use the same pattern: RemixKit can auto-select a configured provider, while the UI allows manual override.

Provider capability differences:

- OpenAI, Gemini, and Anthropic receive extracted text evidence plus sampled frame images when available.
- DeepSeek receives extracted text evidence, metadata, transcript, OCR, scene data, and frame file references. It is kept as a peer reasoning provider even when image input is unavailable.
- All analysis providers must return the same RemixKit analysis schema and variant-plan schema.
- Transcription is a separate evidence-extraction step. The current MVP can use OpenAI transcription to produce transcript evidence, but this does not make OpenAI the preferred reasoning provider.

Generation provider behavior:

- Runway can accept a public source video URL in hosted mode, or local uploaded videos through its ephemeral upload API in local mode, then submits `gen4_aleph` video-to-video tasks.
- Luma Modify Video is wired for API submission and requires a publicly reachable `media.url`; hosted mode provides that through Vercel Blob.
- Veo, fal, and Replicate are provider slots for follow-up adapters.

## ffmpeg / ffprobe

Install `ffmpeg` to enable metadata extraction, frame extraction, scene-change frame detection, and audio extraction:

```bash
brew install ffmpeg
```

If `ffprobe` or `ffmpeg` is missing, RemixKit still saves the uploaded video and job record, then adds a warning to the job detail page.

Frame extraction currently writes sampled and scene-change JPEG frames into:

```txt
storage/jobs/{jobId}/frames
```

Audio extraction writes transcript-ready mono MP3 audio into:

```txt
storage/jobs/{jobId}/audio/audio.mp3
```

When `OPENAI_API_KEY` is configured, RemixKit attempts to transcribe that extracted audio and stores the result in `facts.transcript`.

## Project Notes

- Product notes: [PRODUCT_NOTES.md](./PRODUCT_NOTES.md)
- Product breakdown: [docs/product-breakdown.md](./docs/product-breakdown.md)
- Architecture: [docs/architecture.md](./docs/architecture.md)
- MVP roadmap: [docs/mvp-roadmap.md](./docs/mvp-roadmap.md)
