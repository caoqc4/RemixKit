import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { AppShell } from "@/app/shell";
import { readJob } from "@/lib/jobs/storage";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function JobPage({ params }: PageProps) {
  const { id } = await params;
  const job = await readJob(id);

  if (!job) {
    notFound();
  }

  const metadata = job.facts?.metadata;
  const sampledFrameCount = job.facts?.frames.filter((frame) => frame.kind === "sampled").length ?? 0;
  const sceneFrameCount = job.facts?.frames.filter((frame) => frame.kind === "scene").length ?? 0;

  return (
    <AppShell>
      <div className="page-head">
        <div className="stack">
          <p className="eyebrow">Remix job</p>
          <h1>{job.sourceFileName}</h1>
          <p className="subtle">
            Created {new Date(job.createdAt).toLocaleString()} with {job.analysisProvider} analysis and{" "}
            {job.generationProvider} generation.
          </p>
        </div>
        <span className="badge ok">
          <CheckCircle2 size={14} />
          {job.status}
        </span>
      </div>

      <div className="grid">
        <section className="panel panel-pad stack">
          <Link className="button secondary" href="/">
            <ArrowLeft size={16} />
            Back to workbench
          </Link>

          <div className="section stack">
            <h2>Creative goal</h2>
            <p className="subtle">{job.goal || "No goal provided yet."}</p>
          </div>

          <form action={`/api/jobs/${job.id}/analyze`} className="section stack" method="post">
            <h2>Creative analysis</h2>
            <p className="subtle">
              Run the selected peer analysis provider against the extracted evidence. Auto-select uses the first configured provider, with OpenAI first only as the default order.
            </p>
            <button className="button" type="submit">
              <Sparkles size={16} />
              Run analysis
            </button>
            {job.error ? (
              <div className="provider-card">
                <span className="badge">
                  <AlertTriangle size={14} />
                  Analysis error
                </span>
                <p className="subtle">{job.error}</p>
              </div>
            ) : null}
          </form>

          <form action={`/api/jobs/${job.id}/generate`} className="section stack" method="post">
            <h2>Video generation</h2>
            <p className="subtle">
              Generate videos from the current variant plans. Auto-select prefers a configured provider that can accept local uploads; Runway supports this through ephemeral uploads.
            </p>
            <button className="button" type="submit" disabled={!job.variantPlans?.length}>
              <Sparkles size={16} />
              Generate video variants
            </button>
            {!job.variantPlans?.length ? (
              <p className="subtle">Run analysis first to create provider-ready variant prompts.</p>
            ) : null}
          </form>

          <form action={`/api/jobs/${job.id}/refresh-generated`} className="section stack" method="post">
            <h2>Refresh generation tasks</h2>
            <p className="subtle">
              Check submitted provider tasks for completion. Completed Runway outputs are downloaded into the local job outputs folder.
            </p>
            <button className="button secondary" type="submit" disabled={!job.generatedVideos?.length}>
              Refresh generated videos
            </button>
          </form>

          <div className="section stack">
            <h2>Extracted metadata</h2>
            <div className="provider-grid">
              <MetadataItem label="Duration" value={formatDuration(metadata?.durationSeconds)} />
              <MetadataItem label="Size" value={formatSize(metadata?.width, metadata?.height)} />
              <MetadataItem label="FPS" value={formatValue(metadata?.fps)} />
              <MetadataItem label="Audio" value={metadata?.hasAudio === undefined ? "Unknown" : metadata.hasAudio ? "Yes" : "No"} />
              <MetadataItem label="Sampled frames" value={String(sampledFrameCount)} />
              <MetadataItem label="Scene frames" value={String(sceneFrameCount)} />
              <MetadataItem label="Audio file" value={job.facts?.audio ? "Extracted" : "Missing"} />
              <MetadataItem label="Transcript segments" value={String(job.facts?.transcript?.length ?? 0)} />
            </div>
          </div>

          <div className="section stack">
            <h2>Audio evidence</h2>
            {job.facts?.audio ? (
              <div className="provider-card">
                <h3>{job.facts.audio.format.toUpperCase()}</h3>
                <p className="mono">{job.facts.audio.path}</p>
              </div>
            ) : (
              <p className="subtle">No audio track extracted yet. Install ffmpeg and upload a video with audio to enable transcript-ready evidence.</p>
            )}
          </div>

          <div className="section stack">
            <h2>Frame evidence</h2>
            {job.facts?.frames.length ? (
              <div className="frame-list">
                {job.facts.frames.map((frame) => (
                  <div className="provider-card" key={frame.path}>
                    <span className="badge">{frame.kind}</span>
                    <p className="mono">{formatDuration(frame.timestamp)}</p>
                    <p className="subtle">{frame.path}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="subtle">No frames sampled yet. Install ffmpeg and upload a video to enable visual evidence extraction.</p>
            )}
          </div>

          <div className="section stack">
            {job.analysis ? (
              <AnalysisView job={job} />
            ) : (
              <>
                <h2>Next pipeline steps</h2>
                <div className="timeline">
                  <PipelineRow index="01" title="Frame sampling" detail="Extract sampled frames and scene keyframes with ffmpeg." />
                  <PipelineRow index="02" title="Transcript and OCR" detail="Add speech-to-text and on-screen text extraction." />
                  <PipelineRow index="03" title="Creative analysis" detail="Send extracted evidence to the selected peer analysis provider." />
                  <PipelineRow index="04" title="Variant planning" detail="Produce 3-5 original ad variant plans and provider-ready prompts." />
                  <PipelineRow index="05" title="Video generation" detail="Generate new video assets with the selected video provider." />
                </div>
              </>
            )}
          </div>
        </section>

        <aside className="stack">
          <section className="panel panel-pad stack">
            <h2>Provider choices</h2>
            <div className="provider-grid">
              <div className="provider-card">
                <h3>Analysis</h3>
                <p className="subtle">
                  {job.resolvedAnalysisProvider ?? job.analysisProvider}
                  {job.analysisModel ? ` / ${job.analysisModel}` : ""}
                </p>
              </div>
              <div className="provider-card">
                <h3>Generation</h3>
                <p className="subtle">
                  {job.resolvedGenerationProvider ?? job.generationProvider}
                  {job.generationModel ? ` / ${job.generationModel}` : ""}
                </p>
              </div>
            </div>
          </section>

          <section className="panel panel-pad stack">
            <h2>Generated videos</h2>
            {job.generatedVideos?.length ? (
              job.generatedVideos.map((video) => (
                <div className="provider-card" key={`${video.provider}-${video.variantId}-${video.createdAt}`}>
                  <h3>{video.variantId}</h3>
                  <p className="subtle">
                    {video.provider} / {video.status}
                  </p>
                  {video.remoteId ? <p className="mono">{video.remoteId}</p> : null}
                  {video.outputPath ? <p className="mono">{video.outputPath}</p> : null}
                  {video.outputUrl ? (
                    <a className="button secondary" href={video.outputUrl}>
                      Open output
                    </a>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="subtle">No generated video tasks yet.</p>
            )}
          </section>

          <section className="panel panel-pad stack">
            <h2>Local files</h2>
            <p className="mono">{job.sourceVideoPath}</p>
            <p className="subtle">Job data is stored under storage/jobs/{job.id}.</p>
          </section>

          <section className="panel panel-pad stack">
            <h2>Warnings</h2>
            {job.warnings.length ? (
              job.warnings.map((warning) => (
                <div className="provider-card" key={warning}>
                  <span className="badge">
                    <AlertTriangle size={14} />
                    Notice
                  </span>
                  <p className="subtle">{warning}</p>
                </div>
              ))
            ) : (
              <p className="subtle">No warnings.</p>
            )}
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

type JobForAnalysisView = NonNullable<Awaited<ReturnType<typeof readJob>>>;

function AnalysisView({ job }: { job: JobForAnalysisView }) {
  if (!job.analysis) {
    return null;
  }

  return (
    <>
      <h2>Analysis result</h2>
      <div className="stack">
        <div className="provider-card">
          <h3>Creative Summary</h3>
          <p className="subtle">{job.analysis.creativeSummary}</p>
        </div>
        <div className="provider-card">
          <h3>Hook Analysis</h3>
          <p className="subtle">
            {job.analysis.hookAnalysis.type} at {job.analysis.hookAnalysis.timestamp}
          </p>
          <p className="subtle">{job.analysis.hookAnalysis.whyItWorks}</p>
          <p className="subtle">{job.analysis.hookAnalysis.remixGuidance}</p>
        </div>
        <div className="provider-card">
          <h3>Pacing & Rhythm</h3>
          <p className="subtle">{job.analysis.pacingAndRhythm}</p>
        </div>
        <div className="provider-card">
          <h3>Message / Copy Structure</h3>
          <p className="subtle">{job.analysis.messageStructure}</p>
        </div>
        <div className="provider-card">
          <h3>Visual Pattern</h3>
          <p className="subtle">{job.analysis.visualPattern}</p>
        </div>
        <div className="timeline">
          {job.analysis.sceneTimeline.map((scene, index) => (
            <PipelineRow
              key={`${scene.start}-${scene.end}-${index}`}
              index={String(index + 1).padStart(2, "0")}
              title={`${scene.role} (${scene.start}s-${scene.end}s)`}
              detail={`${scene.marketingFunction} ${scene.remixGuidance}`}
            />
          ))}
        </div>
      </div>

      <h2>Variant plans</h2>
      <div className="stack">
        {(job.variantPlans ?? []).map((variant) => (
          <div className="provider-card" key={variant.id}>
            <h3>{variant.name}</h3>
            <p className="subtle">{variant.angle}</p>
            <p className="subtle">{variant.providerPrompt}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="provider-card">
      <h3>{label}</h3>
      <p className="subtle">{value}</p>
    </div>
  );
}

function PipelineRow({ index, title, detail }: { index: string; title: string; detail: string }) {
  return (
    <div className="timeline-row">
      <span className="mono">{index}</span>
      <span>
        {title}
        <br />
        <span className="subtle">{detail}</span>
      </span>
    </div>
  );
}

function formatDuration(value: number | undefined) {
  return value === undefined ? "Unknown" : `${value.toFixed(2)}s`;
}

function formatSize(width: number | undefined, height: number | undefined) {
  return width && height ? `${width} x ${height}` : "Unknown";
}

function formatValue(value: number | undefined) {
  return value === undefined ? "Unknown" : String(value);
}
