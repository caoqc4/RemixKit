import {
  ArrowRight,
  CheckCircle2,
  Circle,
  ClipboardList,
  Cloud,
  Film,
  FolderOpen,
  Gauge,
  Layers3,
  Link2,
  Play,
  RefreshCcw,
  Settings2,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Wand2
} from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "./shell";
import { getProviderStatuses } from "@/lib/config/provider-status";
import { getStorageMode, listJobs } from "@/lib/jobs/storage";

export const dynamic = "force-dynamic";

const pipelineStages = [
  { name: "Intake", state: "ready", detail: "File or public URL" },
  { name: "Evidence", state: "queued", detail: "Frames, audio, transcript" },
  { name: "Creative read", state: "queued", detail: "Hook, rhythm, CTA, risks" },
  { name: "Variant plan", state: "queued", detail: "Fresh remix brief" },
  { name: "Generation", state: "blocked", detail: "Needs video provider" },
  { name: "Output", state: "idle", detail: "Variants and exports" }
];

const artifacts = ["Frame contact sheet", "Transcript", "Creative read", "Variant plan"];
const evidenceMetrics = [
  { label: "Shot map", value: "0" },
  { label: "Hook window", value: "0s" },
  { label: "Risk flags", value: "Ready" }
];

export default async function HomePage() {
  const statuses = await getProviderStatuses();
  const jobs = await listJobs();
  const configuredAnalysis = statuses.analysis.filter((provider) => provider.configured);
  const configuredTranscription = statuses.transcription.filter((provider) => provider.configured);
  const configuredGeneration = statuses.generation.filter((provider) => provider.configured);
  const storageMode = getStorageMode();
  const hostedMode = storageMode === "vercel-blob";
  const lastJob = jobs[0];
  const providerReady = configuredAnalysis.length > 0 && configuredGeneration.length > 0;

  return (
    <AppShell>
      <div className="screen workbench-screen">
        <header className="ops-header">
          <div className="ops-title">
            <p className="kicker">RemixKit Workbench</p>
            <h1>Reference creative to original ad variants.</h1>
            <p className="subtle">
              Upload owned source material, extract evidence, ask a reasoning model for the creative read, then generate fresh testable variants.
            </p>
          </div>
          <div className="ops-metrics" aria-label="Workbench status">
            <StatusTile icon={<Cloud size={16} />} label="Storage" value={hostedMode ? "Vercel Blob" : "Local"} />
            <StatusTile icon={<Gauge size={16} />} label="Providers" value={`${configuredAnalysis.length + configuredGeneration.length}/${statuses.analysis.length + statuses.generation.length}`} />
            <StatusTile icon={<RefreshCcw size={16} />} label="Recent run" value={lastJob ? lastJob.status : "None"} />
          </div>
        </header>

        <form action="/api/jobs" className="workbench-grid" encType="multipart/form-data" method="post">
          <section className="source-console" aria-labelledby="source-title">
            <div className="panel-head">
              <div>
                <p className="eyebrow">01 Source intake</p>
                <h2 id="source-title">Reference creative</h2>
              </div>
              <span className="badge">
                <ShieldCheck size={14} />
                User-owned
              </span>
            </div>

            <label className="upload-console" htmlFor="video">
              <input id="video" name="video" type="file" accept="video/*" />
              <span className="upload-preview">
                <Film size={30} />
                <span />
              </span>
              <span className="upload-copy">
                <strong>Drop or select a reference video</strong>
                <small>MP4, MOV, or browser-supported video. The source is analyzed for structure, not copied as-is.</small>
              </span>
              <UploadCloud size={20} />
            </label>

            <label className="url-field workbench-url" htmlFor="sourceUrl">
              <Link2 size={17} />
              <span>Public video URL</span>
              <input id="sourceUrl" name="sourceUrl" placeholder="https://example.com/owned-reference.mp4" type="url" />
            </label>

            <div className="notice-row">
              <ShieldCheck size={16} />
              <span>Use material you have permission to remix. RemixKit generates new variants from observed marketing structure.</span>
            </div>
          </section>

          <section className="brief-console" aria-labelledby="brief-title">
            <div className="panel-head">
              <div>
                <p className="eyebrow">02 Remix brief</p>
                <h2 id="brief-title">Creative direction</h2>
              </div>
              <span className={providerReady ? "badge ok" : "badge"}>{providerReady ? "Ready" : "Configure providers"}</span>
            </div>

            <label className="brief-field" htmlFor="goal">
              <span>Goal for this run</span>
              <textarea
                id="goal"
                name="goal"
                placeholder="Generate 3 TikTok ad variants for a skincare product. Keep the winning hook structure, change the creator framing, visuals, and CTA."
              />
            </label>

            <div className="selector-row" role="group" aria-label="Provider selection">
              <label htmlFor="analysisProvider">
                <span>Analysis model</span>
                <select id="analysisProvider" name="analysisProvider" defaultValue="auto">
                  <option value="auto">Auto select</option>
                  {statuses.analysis.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </label>
              <label htmlFor="generationProvider">
                <span>Video provider</span>
                <select id="generationProvider" name="generationProvider" defaultValue="auto">
                  <option value="auto">Auto select</option>
                  {statuses.generation.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="launch-strip">
              <button className="button launch-button" type="submit">
                <Play size={17} />
                Start remix run
              </button>
              <a className="button ghost" href="/settings">
                <Settings2 size={16} />
                Provider settings
              </a>
            </div>
          </section>

          <aside className="inspection-rail" aria-label="Run inspection">
            <section className="rail-section">
              <div className="rail-head">
                <p className="eyebrow">Readiness</p>
                <Sparkles size={17} />
              </div>
              <ReadinessRow label="Analysis" value={configuredAnalysis.length} total={statuses.analysis.length} />
              <ReadinessRow label="Generation" value={configuredGeneration.length} total={statuses.generation.length} />
              <ReadinessRow label="Transcript" value={configuredTranscription.length} total={statuses.transcription.length} />
            </section>

            <section className="rail-section">
              <div className="rail-head">
                <p className="eyebrow">Artifacts</p>
                <FolderOpen size={17} />
              </div>
              <div className="artifact-list">
                {artifacts.map((artifact) => (
                  <span key={artifact}>
                    <Circle size={11} />
                    {artifact}
                  </span>
                ))}
              </div>
            </section>

            <section className="rail-section">
              <div className="rail-head">
                <p className="eyebrow">Recent jobs</p>
                <ClipboardList size={17} />
              </div>
              {jobs.length ? (
                <div className="run-list">
                  {jobs.slice(0, 4).map((job) => (
                    <a className="run-row" href={`/jobs/${job.id}`} key={job.id}>
                      <span>{job.status}</span>
                      <strong>{job.sourceFileName}</strong>
                      <small>{new Date(job.createdAt).toLocaleString()}</small>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="empty-panel">
                  <ClipboardList size={18} />
                  No remix runs yet.
                </div>
              )}
            </section>
          </aside>
        </form>

        <section className="pipeline-board" aria-label="Pipeline board">
          <div className="board-head">
            <div>
              <p className="eyebrow">Pipeline</p>
              <h2>From source evidence to generated variants</h2>
            </div>
            <div className="board-actions">
              <button className="button secondary" type="button">
                <Wand2 size={16} />
                Analyze
              </button>
              <button className="button secondary" type="button">
                <Play size={16} />
                Generate
              </button>
              <button className="button secondary" type="button">
                <RefreshCcw size={16} />
                Refresh
              </button>
            </div>
          </div>
          <div className="pipeline-grid">
            {pipelineStages.map((stage, index) => (
              <div className={`pipeline-card ${stage.state}`} key={stage.name}>
                <span className="pipeline-index">{String(index + 1).padStart(2, "0")}</span>
                <strong>{stage.name}</strong>
                <small>{stage.detail}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="detail-grid" aria-label="Job detail pattern">
          <div className="detail-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Evidence metrics</p>
                <h2>Analysis frame</h2>
              </div>
              <Layers3 size={18} />
            </div>
            <div className="metric-row">
              {evidenceMetrics.map((metric) => (
                <div className="metric-tile" key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
            <div className="warning-strip">
              <ShieldCheck size={16} />
              <span>Similarity warnings and policy guardrails belong here before generation starts.</span>
            </div>
          </div>

          <div className="detail-panel output-panel">
            <div className="panel-head">
              <div>
                <p className="eyebrow">Generated videos</p>
                <h2>Variant output slots</h2>
              </div>
              <ArrowRight size={18} />
            </div>
            <div className="variant-slots">
              {["Hook test", "Angle test", "CTA test"].map((variant) => (
                <div className="variant-slot" key={variant}>
                  <span />
                  <strong>{variant}</strong>
                  <small>Awaiting generation</small>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function StatusTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="status-tile">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReadinessRow({ label, value, total }: { label: string; value: number; total: number }) {
  const ready = value > 0;

  return (
    <div className="readiness-row">
      <span className={ready ? "ready-dot ready" : "ready-dot"}>{ready ? <CheckCircle2 size={15} /> : <Circle size={15} />}</span>
      <strong>{label}</strong>
      <small>
        {value}/{total} configured
      </small>
      <ArrowRight size={14} />
    </div>
  );
}
