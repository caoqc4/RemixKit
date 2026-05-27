# RemixKit Product Notes

Last updated: 2026-05-27

## Context

Gemini Omni may create new opportunities for AI video editor and AI video ads workflows, but the first version of RemixKit should not depend on a Gemini Omni API.

As of 2026-05-27, Gemini Omni appears available in consumer or Google-owned surfaces such as Gemini app, Flow, YouTube Shorts, and YouTube Create. There is not yet a clearly public Gemini Omni API or Vertex AI model ID suitable for building the first release around.

## Provider Strategy

The initial architecture should support interchangeable video generation providers instead of betting on a single model.

Good first candidates:

- Luma Modify Video API: suitable for video-to-video remix, style transfer, and content variation from a source video.
- Runway API: suitable for video-to-video and image-to-video workflows.
- Google Veo 3.1: API available, stronger fit for image-to-video, reference images, first and last frames, and video extension.
- Kling, Pika, and third-party aggregator APIs: possible later providers behind the same interface.

## Positioning

Avoid positioning RemixKit as a generic "AI video editor." That category is crowded and search results are dominated by CapCut, VEED, Runway, Canva, Adobe, Kapwing, and similar large players.

Recommended positioning:

> RemixKit: open-source AI workflow for generating video ad variations from reference creatives

Alternative wording:

> Open-source viral ad remix workflow engine

Chinese positioning:

> RemixKit: 开源 AI 爆款视频变体工作流

The product should help users upload video or reference material they have rights to use, analyze its marketing structure, and generate original ad variations inspired by that structure.

## Core Workflow

1. User uploads a reference video.
2. FFmpeg extracts frames, audio, and technical metadata.
3. Speech-to-text transcribes audio.
4. The system analyzes subtitles, scene boundaries, pacing, visual structure, hook, CTA, and reusable marketing patterns.
5. An LLM produces a remix brief:
   - hook pattern
   - pacing structure
   - scene table
   - CTA
   - variable elements
   - risk elements
   - transformation guidance
6. The system generates fresh creative variants using providers such as Luma, Runway, or Veo.
7. User receives multiple short-form ad variants for testing.

Future workflow additions:

- subtitles
- voiceover
- music
- platform aspect ratio adaptation
- batch export
- creative scoring
- similarity warnings
- provider comparison

## Demand Hypothesis

Traditional SEO may not be the best validation path. Terms like "viral video remix," "ad creative variation workflow," and "video repurposing" show low Google Trends volume.

But the demand signal still exists in adjacent markets:

- Fiverr services for AI video editing, video repurposing, UGC videos, and TikTok ads.
- DTC ecommerce teams fighting creative fatigue.
- UGC agencies producing many variants for paid social.
- Media buyers and ad operators who need to test hooks, formats, and CTAs quickly.

Better validation channels:

- open-source launch
- public demo
- Reddit
- X
- Indie Hackers
- Fiverr and Upwork seller interviews
- agency feedback
- Discord or waitlist

## Validation Metrics

Useful early indicators:

- GitHub stars and forks.
- Number of users willing to configure provider API keys.
- Number of users who upload a video and generate at least 5 variants.
- Discord or waitlist signups.
- Hosted-version payment intent.
- Agency or Fiverr seller willingness to try the workflow.

## Naming

Recommended name:

- RemixKit

Recommended tagline:

- RemixKit: open-source AI workflow for generating video ad variations from reference creatives

Other candidates:

- HookRemix
- AdRemixKit
- VariantLab
- Morphcut
- VideoVariant
- CreativeOps
- AdVariants
- CreativeVariants
- ViralVariant
- SceneForge

Preference order:

1. RemixKit
2. HookRemix
3. AdRemixKit
4. VariantLab
5. Morphcut

## Compliance And Safety

Avoid language like:

- clone viral videos
- copy winning videos
- recreate any ad

Safer language:

- Turn reference creatives into fresh video ad variations.
- Analyze winning creative patterns and generate original ad variants.

Product principles:

- Users must upload material they have rights to use.
- Generated outputs should be original variants inspired by structure, not direct copies.
- The system should discourage copying brands, real identities, copyrighted videos, protected characters, and third-party creative assets.
- Later versions should include similarity warnings and policy guardrails.

## Initial Product Shape

The first useful version can be a developer-facing open-source workflow rather than a full SaaS editor.

Suggested MVP:

- CLI or minimal web UI for uploading a reference video.
- FFmpeg-based frame and audio extraction.
- Transcript generation.
- LLM analysis into a structured remix brief.
- Provider abstraction for video generation.
- One provider implementation, likely Luma or Runway first.
- Output folder containing:
  - analysis JSON
  - remix brief Markdown
  - generated prompts
  - generated video variants

The early product should optimize for learning whether users understand and value the workflow before investing heavily in a polished editor.
