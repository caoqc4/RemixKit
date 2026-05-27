# RemixKit Product Breakdown

Last updated: 2026-05-27

## Product Goal

RemixKit is a local-first, open-source workflow for turning a reference creative into original video ad variations.

The first version should be a clickable local web demo. Users can upload one video, configure their own provider credentials, analyze the creative structure, and generate new video material through supported generation providers.

## First-Principles Workflow

The workflow exists to convert reference material into useful creative intelligence, then into new video assets.

```txt
reference video
-> deterministic extraction
-> structured creative analysis
-> variant planning
-> provider-specific video generation
-> local outputs
```

RemixKit should not be a generic video editor. The core value is the analysis and remix planning layer.

## MVP Scope

### In Scope

- Local web UI built with Next.js.
- Single video upload.
- Optional experimental URL import for user-owned videos.
- Local provider settings without user accounts.
- Equal support surface for OpenAI, Gemini, Anthropic, and DeepSeek as analysis providers.
- OpenAI can be the default selection, but users must be able to switch.
- Video generation provider abstraction.
- Initial generation providers: Luma and Runway.
- Provider slots for Veo, fal, and Replicate.
- Structured creative analysis.
- 3-5 generated variant plans.
- Video generation when a configured provider is available.
- Local output files for analysis, plans, prompts, and generated assets.

### Out Of Scope For MVP

- Hosted SaaS accounts.
- Multi-user auth.
- Billing.
- Cloud storage.
- Full timeline video editor.
- Team collaboration.
- Fine-grained manual editing.
- Fully automated social platform scraping.

## Local Credential Model

Users bring their own API keys or provider credentials.

Credential sources, in priority order:

1. `.env.local`
2. `.remixkit/config.json`
3. Empty / unconfigured state

The local Settings page writes to `.remixkit/config.json`. This file must be ignored by git and treated as plaintext local development config.

Official account login is a possible future direction only where providers expose a stable OAuth or device login flow. For MVP, direct API keys are the lowest-complexity option and the most reliable for an open-source local tool.

## Analysis Provider Principle

OpenAI, Gemini, Anthropic, and DeepSeek should be presented as peer providers.

The product may default to OpenAI for first-run convenience, but the architecture must not hard-code OpenAI-specific assumptions into the workflow.

Each provider advertises capabilities:

```ts
type AnalysisProviderCapabilities = {
  supportsImages: boolean
  supportsVideoFile: boolean
  supportsStructuredOutput: boolean
  supportsReasoning: boolean
}
```

Provider capabilities affect how RemixKit packages the extracted evidence, but they should all target the same output schema.

For MVP:

- OpenAI, Gemini, and Anthropic can receive sampled frame images when `ffmpeg` has extracted them.
- DeepSeek remains a peer analysis provider, but receives text evidence only unless a compatible visual endpoint is added later.
- The user-facing model selector should show all configured providers as valid choices rather than implying one provider is more correct.

## Analysis Framework

The analysis should stay small enough to ship, but strong enough to be useful.

The first version has eight modules:

1. Creative Summary
2. Hook Analysis
3. Scene Timeline
4. Pacing & Rhythm
5. Message / Copy Structure
6. Visual Pattern
7. Compliance Risk
8. Variant Strategy

The model should explain the advertising structure, not merely summarize the video.

## LLM Call Budget

MVP should use two analysis-model calls:

1. `analyzeCreative`
   - Input: metadata, selected keyframes, transcript, OCR text, scene list, user goal.
   - Output: structured creative analysis.
2. `planVariants`
   - Input: creative analysis, user goal, selected generation provider capabilities.
   - Output: 3-5 variant plans with provider-specific prompts.

Avoid multi-agent review, scorers, and complex self-critique until the basic workflow proves useful.

## Deterministic Extraction

Before calling an analysis model, RemixKit extracts facts locally:

- `ffprobe` metadata.
- Keyframes or sampled frames.
- Audio track.
- Basic scene list.
- Optional transcript.
- Optional OCR.

The first implementation samples up to 12 frames, extracts scene-change frames, separates mono MP3 audio when `ffmpeg` is available, and can transcribe extracted audio with OpenAI when configured. OCR can be stubbed until local tools or provider APIs are configured, but the interfaces should exist.

## Generation Provider Principle

Generation providers are execution backends. They should not own the entire workflow.

```txt
RemixKit owns:
upload -> extraction -> analysis -> variant planning -> provider selection -> output storage

Providers own:
submit generation job -> poll status -> download result
```

Initial priority:

- P0: Luma, Runway
- P1: Veo, fal
- P2: Replicate

## Provider Selection

Default behavior:

- Automatically choose a configured provider that can satisfy the selected generation mode.

User control:

- Allow manual override in the UI.
- Show unconfigured providers as unavailable with setup guidance.

## Local Output Shape

Each job should produce a local folder:

```txt
storage/jobs/{jobId}/
├── input.mp4
├── metadata.json
├── frames/
├── analysis.json
├── remix_brief.md
├── variant_prompts.json
└── outputs/
    ├── variant_01.mp4
    ├── variant_02.mp4
    └── variant_03.mp4
```

## MVP UI

The app should feel like a focused creative operations workbench:

- Home: upload video, create job, view recent jobs.
- Settings: configure analysis and generation providers.
- Job detail:
  - status
  - extracted metadata
  - creative analysis sections
  - variant plans
  - provider selector
  - generated videos

No landing page is needed for the MVP.
