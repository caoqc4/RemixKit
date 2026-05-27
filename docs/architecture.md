# RemixKit Architecture

Last updated: 2026-05-27

## System Shape

RemixKit is a local-first Next.js application. The current MVP runs as a local web workbench and writes job data to the filesystem.

The core workflow is:

```txt
upload video
-> extract deterministic evidence
-> analyze creative structure
-> plan variants
-> submit video generation tasks
-> refresh generation tasks
-> save local outputs
```

The application owns workflow orchestration. Providers only own their own API calls.

## Main Modules

```txt
app/
  page.tsx                         workbench upload and recent jobs
  settings/page.tsx                local credential settings
  jobs/[id]/page.tsx               job detail, analysis, generation controls
  api/jobs                         upload/create job
  api/jobs/[id]/analyze            run analysis
  api/jobs/[id]/generate           submit video generation
  api/jobs/[id]/refresh-generated  refresh and download generated outputs

lib/
  extraction/                      ffprobe and ffmpeg evidence extraction
  analysis/                        schemas, prompts, run orchestration
  generation/                      video generation orchestration
  providers/analysis/              OpenAI, Gemini, Anthropic, DeepSeek adapters
  providers/video/                 Luma, Runway, provider registry
  jobs/                            local filesystem persistence
  config/                          local plaintext credentials
```

## Job Storage

Jobs are stored under:

```txt
storage/jobs/{jobId}/
```

Current files:

```txt
input.{ext}
job.json
metadata.json
analysis.json
variant_prompts.json
remix_brief.md
generated_videos.json
frames/
outputs/
```

`job.json` is the source of truth for UI state. The other JSON and Markdown files are convenient artifacts for inspection and downstream use.

## Provider Principles

Analysis providers are peers:

- OpenAI
- Gemini
- Anthropic
- DeepSeek

OpenAI is only first in auto-selection order. Users can manually select any configured provider.

Provider capability differences are handled by evidence packaging:

- OpenAI, Gemini, and Anthropic receive text evidence plus sampled frame images when available.
- DeepSeek receives text evidence and file references because the current official API path is text-first.
- All providers must return the same `CreativeAnalysis` and `VariantPlan` schemas.

Transcription is separate from reasoning:

- OpenAI transcription can produce transcript evidence from extracted audio.
- The selected analysis provider can still be OpenAI, Gemini, Anthropic, or DeepSeek.
- Transcript provider choice should not imply analysis provider preference.

Video providers are execution backends:

- Runway supports local file upload through ephemeral uploads, then submits `gen4_aleph` tasks.
- Luma Modify Video is wired for API submission but requires a public `media.url`.
- Veo, fal, and Replicate are registered provider slots for later adapters.

## Credential Model

Credential priority:

1. `.env.local`
2. `.remixkit/config.json`
3. Unconfigured

The Settings page writes plaintext credentials to `.remixkit/config.json`. This is suitable for a local developer demo, not hosted production.

Official account login can be added later only where a provider exposes a stable OAuth or device-code flow. For MVP, API keys are the reliable path.

The Settings UI links to official provider setup pages so users can sign in with the provider directly, create credentials, and paste them into the local demo. RemixKit does not proxy, store, or sync provider accounts.

## Current Gaps

- Scene-change frame extraction exists, but timestamp/range quality is still approximate.
- Speech-to-text transcript exists through OpenAI transcription when configured; additional providers are not implemented yet.
- No OCR.
- No hosted local-file bridge for providers that require public URLs.
- No background queue; long-running operations happen inside request handlers.
- No automated test suite yet.
- No account system, billing, or hosted storage.

## Design Constraint

The workflow should never become "copy this video." The analysis and generation prompts must keep emphasizing original variants, structure-level inspiration, and risk elements that should not be copied.
