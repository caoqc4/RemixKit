# RemixKit MVP Roadmap

Last updated: 2026-05-27

## Done

- Local Next.js workbench.
- Single video upload.
- Local job storage.
- Vercel Blob job storage for hosted deployment.
- Provider settings page.
- `.env.local` and `.remixkit/config.json` credential loading.
- ffprobe metadata extraction with graceful fallback.
- ffmpeg sampled frame extraction with graceful fallback.
- ffmpeg scene-change frame detection with graceful fallback.
- ffmpeg audio extraction with graceful fallback.
- OpenAI audio transcription with graceful fallback.
- Peer analysis adapters:
  - OpenAI
  - Gemini
  - Anthropic
  - DeepSeek
- Structured creative analysis schema.
- Variant planning schema.
- Job analysis API.
- Runway video-to-video submission through ephemeral upload.
- Runway video-to-video submission through public source URLs in hosted mode.
- Luma Modify Video submission adapter for public video URLs.
- Generation task refresh and local download for Runway outputs.

## Next

1. Add more transcript providers or local transcription.
   - Keep transcription separate from analysis provider selection.
   - Add timestamped segments when the chosen transcription provider supports them.

2. Add OCR for on-screen captions and big text.
   - Store timestamped text in `facts.ocr`.
   - Feed OCR into all analysis providers.

3. Improve scene detection timestamps.
   - Current implementation extracts scene-change frames.
   - Next improvement should parse accurate `pts_time` values and scene ranges.

4. Add hosted media extraction.
   - Current Vercel Blob mode gives providers a public source URL.
   - Next step is an async worker or external media service for frames, audio, transcript, and OCR in hosted mode.

5. Add generation provider result polling for Luma.
   - Poll generation ID.
   - Download final video asset into `outputs/`.

6. Add provider setup guidance in the UI.
   - Show configured/missing state. Done.
   - Show official setup links. Done.
   - Show capability notes and limitations. Done.
   - Later: add OAuth/device login where providers officially support it.

7. Add basic automated tests.
   - Provider selection.
   - Local config loading.
   - Job persistence.
   - Schema parsing.

## Later

- URL import for user-owned TikTok, YouTube, or direct video URLs.
- Hosted SaaS mode.
- OAuth/device login where providers officially support it.
- Batch variant generation.
- Subtitle and voiceover generation.
- Aspect-ratio adaptation.
- Similarity warnings.
- Creative scoring.
- fal and Replicate adapters.
- Veo image-to-video adapter.

## Validation Metrics

- Users can run the local app and configure at least one analysis provider.
- Users can upload a video and create a job.
- Users can generate analysis and 3-5 variant plans.
- Users can submit at least one video generation task.
- Users can retrieve or download at least one generated video.
- Agencies or creators can understand the workflow without asking for a generic editor.
